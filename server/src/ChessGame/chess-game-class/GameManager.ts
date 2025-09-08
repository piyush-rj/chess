import { CreateMoveJob, EndGameJob, UpdateGameStateJob } from "../../queue/database-queue";
import { databaseQueueInstance, redisCacheInstance } from "../../services/init-services";
import { GameStatusEnum, PieceTypeEnum, Position } from "../../types/websocket-types";
import { Game } from "./Game";


//responsibilities:
// keep in-memory games map
// map players -> gameId
// restore games from redis/db
// update redis and enqueue DB jobs
// cleanup unplayed games


const GAME_CLEANUP = 30 * 60 * 1000;

export class GameManager {
    private games = new Map<string, Game>();
    private player_game_map = new Map<string, string>();
    private cleanupTimers = new Map<string, NodeJS.Timeout>();

    constructor() { }

    public async create_game(gameId: string, creatorId?: string): Promise<Game> {
        const game = new Game(gameId);
        this.games.set(gameId, game);

        if (creatorId) {
            game.add_player(creatorId);
            this.player_game_map.set(creatorId, gameId);
        }

        await redisCacheInstance.setGame(gameId, {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
            whitePlayerId: game.get_game_state().whitePlayer,
            blackPlayerId: game.get_game_state().blackPlayer,
        });

        this.clearCleanupTimer(gameId);

        return game;
    }

    public async restore_game_from_cache(gameId: string): Promise<Game | null> {
        let game = this.games.get(gameId);
        if (game) return game;

        const cached = await redisCacheInstance.getGame(gameId);

        const rawMoves = await databaseQueueInstance.fetchMoves(gameId);

        const moves = (rawMoves || []).map((m) => ({
            id: m.id,
            moveNumber: m.moveNumber,
            from: { x: m.fromX, y: m.fromY },
            to: { x: m.toX, y: m.toY },
            piece: m.piece as unknown as PieceTypeEnum,
            captured: m.captured ? (m.captured as unknown as PieceTypeEnum) : undefined,
            isCheck: m.isCheck,
            isCheckmate: m.isCheckmate,
            isCastle: m.isCastle,
            isEnPassant: m.isEnPassant,
            promotion: m.promotion ? (m.promotion as unknown as PieceTypeEnum) : undefined,
            algebraicNotation: m.algebraicNotation ?? undefined,
            timeSpent: m.timeSpent ?? undefined,
            playerId: m.playerId,
        }));

        if (cached) {
            game = new Game(gameId);
            game.restore_game_state(cached, moves);
            this.games.set(gameId, game);
            this.clearCleanupTimer(gameId);
            return game;
        }

        const dbGame = await databaseQueueInstance.fetchGame(gameId);
        if (!dbGame) return null;

        const dbMoves = (dbGame.moves || []).map((m) => ({
            id: m.id,
            moveNumber: m.moveNumber,
            from: { x: m.fromX, y: m.fromY },
            to: { x: m.toX, y: m.toY },
            piece: m.piece as unknown as PieceTypeEnum,
            captured: m.captured ? (m.captured as unknown as PieceTypeEnum) : undefined,
            isCheck: m.isCheck,
            isCheckmate: m.isCheckmate,
            isCastle: m.isCastle,
            isEnPassant: m.isEnPassant,
            promotion: m.promotion ? (m.promotion as unknown as PieceTypeEnum) : undefined,
            algebraicNotation: m.algebraicNotation ?? undefined,
            timeSpent: m.timeSpent ?? undefined,
            playerId: m.playerId,
        }));

        game = new Game(gameId);
        game.restore_game_state(dbGame, dbMoves);
        this.games.set(gameId, game);

        await redisCacheInstance.setGame(gameId, {
            gameId,
            boardState: dbGame.boardState,
            currentTurn: dbGame.currentTurn,
            status: dbGame.status,
            whitePlayerId: dbGame.whitePlayer,
            blackPlayerId: dbGame.blackPlayer,
        });

        this.clearCleanupTimer(gameId);
        return game;
    }

    public async join_game(gameId: string, playerId: string): Promise<{ success: boolean; result?: any; error?: string; gameState?: any }> {
        let game: Game | undefined | null = this.games.get(gameId);
        if (!game) {
            game = await this.restore_game_from_cache(gameId);
            if (!game) {
                return { success: false, error: "Game not found" };
            }
        }

        const previousGameId = this.player_game_map.get(playerId);
        if (previousGameId) {
            try {
                await this.leave_game(playerId);
            } catch (err) {
                console.warn("Failed to leave previous game for join:", err);
            }
        }

        try {
            const result = game.add_player(playerId);
            this.player_game_map.set(playerId, gameId);

            await redisCacheInstance.setGame(gameId, {
                gameId,
                boardState: game.get_game_state().board,
                currentTurn: game.get_game_state().currentPlayer,
                status: game.get_game_state().gameStatus,
                whitePlayerId: game.get_game_state().whitePlayer,
                blackPlayerId: game.get_game_state().blackPlayer,
            });

            const payload: UpdateGameStateJob = {
                gameId,
                boardState: game.get_game_state().board,
                currentTurn: game.get_game_state().currentPlayer,
                status: game.get_game_state().gameStatus,
                whitePlayerId: game.get_game_state().whitePlayer!,
                blackPlayerId: game.get_game_state().blackPlayer!,
            };
            await databaseQueueInstance.updateGameState(payload);

            this.clearCleanupTimer(gameId);

            return { success: true, result, gameState: game.get_game_state() };
        } catch (err) {
            console.error("Join game error:", err);
            return { success: false, error: "Join failed" };
        }
    }

    public async leave_game(playerId: string): Promise<void> {
        const gameId = this.player_game_map.get(playerId);
        if (!gameId) return;

        const game = this.games.get(gameId);
        if (!game) {
            this.player_game_map.delete(playerId);
            return;
        }

        game.remove_player(playerId);
        this.player_game_map.delete(playerId);

        await redisCacheInstance.setGame(gameId, {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
            whitePlayerId: game.get_game_state().whitePlayer,
            blackPlayerId: game.get_game_state().blackPlayer,
        });

        const payload: UpdateGameStateJob = {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
        };
        await databaseQueueInstance.updateGameState(payload);

        // if both players are absent, schedule cleanup
        const state = game.get_game_state();
        if (!state.whitePlayer && !state.blackPlayer) {
            this.scheduleCleanup(gameId);
        }
    }

    public async make_move(playerId: string, from: Position, to: Position): Promise<{ success: boolean; result?: any; error?: string }> {
        const gameId = this.player_game_map.get(playerId);
        if (!gameId) {
            return {
                success: false,
                error: "Game id not found",
            }
        };

        let game: Game | undefined | null = this.games.get(gameId);

        if (!game) {
            game = await this.restore_game_from_cache(gameId);
            if (!game) {
                return {
                    success: false,
                    error: "Game not found"
                };
            };
        }

        const result = game.make_move(playerId, from, to);
        if (!result.success) return result;

        const capturedPieces = game.get_captured_pieces();
        console.log("captured pieces are ------> ", capturedPieces);
        const formatted = capturedPieces.map(p => ({
            piece: p.piece,
            capturedBy: p.capturedColor,    
        }));

        if (formatted.length) {
            await redisCacheInstance.addCapturedPieces(gameId, formatted);

            const moveJob: CreateMoveJob = {
                gameId,
                playerId,
                moveNumber: game.get_game_state().moveHistory.length,
                fromX: from.x,
                fromY: from.y,
                toX: to.x,
                toY: to.y,
                piece: result.move!.piece,
                captured: formatted.length ? formatted : null,
                isCheck: game.get_game_state().gameStatus === GameStatusEnum.CHECK,
                isCheckMate: game.get_game_state().gameStatus === GameStatusEnum.CHECKMATE,
            };

            await databaseQueueInstance.createMove(moveJob);
            game.clear_captured_pieces();
        } else {
            const moveJob: CreateMoveJob = {
                gameId,
                playerId,
                moveNumber: game.get_game_state().moveHistory.length,
                fromX: from.x,
                fromY: from.y,
                toX: to.x,
                toY: to.y,
                piece: result.move!.piece,
                captured: null,
                isCheck: game.get_game_state().gameStatus === GameStatusEnum.CHECK,
                isCheckMate: game.get_game_state().gameStatus === GameStatusEnum.CHECKMATE,
            };

            await databaseQueueInstance.createMove(moveJob);
        }

        try {
            const stateJob: UpdateGameStateJob = {
                gameId,
                boardState: game.get_game_state().board,
                currentTurn: game.get_game_state().currentPlayer,
                status: game.get_game_state().gameStatus,
            };
            await databaseQueueInstance.updateGameState(stateJob);
        } catch (err) {
            console.error("Failed to enqueue update game state:", err);
        }

        this.clearCleanupTimer(gameId);

        return result;
    }

    public async end_game(gameId: string, winner?: string | null) {
        const game = this.games.get(gameId);
        if (!game) return;

        try {
            // mark ended locally
            const state = game.get_game_state();
            state.gameStatus = GameStatusEnum.ENDED;

            await redisCacheInstance.setGame(gameId, {
                gameId,
                boardState: state.board,
                currentTurn: state.currentPlayer,
                status: state.gameStatus,
                whitePlayerId: state.whitePlayer,
                blackPlayerId: state.blackPlayer,
            });

            const endJob: EndGameJob = {
                gameId,
                winner: winner || null,
                endedAt: new Date().toISOString(),
            };
            await databaseQueueInstance.endGame(endJob);
        } catch (err) {
            console.error("Failed to end game:", err);
        } finally {
            this.deleteGameFromMemory(gameId);
        }
    }

    public get_game(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    public get_player_game(playerId: string): Game | undefined {
        const gameId = this.player_game_map.get(playerId);
        return gameId ? this.games.get(gameId) : undefined;
    }

    private scheduleCleanup(gameId: string) {
        this.clearCleanupTimer(gameId);
        const timer = setTimeout(async () => {
            try {
                const game = this.games.get(gameId);
                if (!game) {
                    this.deleteGameFromMemory(gameId);
                    return;
                }
                const state = game.get_game_state();
                if (!state.whitePlayer && !state.blackPlayer) {
                    await redisCacheInstance.deleteGame(gameId);
                    this.deleteGameFromMemory(gameId);
                }
            } catch (err) {
                console.warn("Error during scheduled cleanup:", err);
            }
        }, GAME_CLEANUP);
        this.cleanupTimers.set(gameId, timer);
    }

    private clearCleanupTimer(gameId: string) {
        const t = this.cleanupTimers.get(gameId);
        if (t) {
            clearTimeout(t);
            this.cleanupTimers.delete(gameId);
        }
    }

    private deleteGameFromMemory(gameId: string) {
        this.clearCleanupTimer(gameId);
        this.games.delete(gameId);
        // remove any player -> game mapping for players that belonged to this game
        for (const [pid, gid] of Array.from(this.player_game_map.entries())) {
            if (gid === gameId) this.player_game_map.delete(pid);
        }
    }
}
