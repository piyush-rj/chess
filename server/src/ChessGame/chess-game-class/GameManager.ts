import { CreateMoveJob, EndGameJob, UpdateGameStateJob } from "../../queue/database-queue";
import { databaseQueueInstance, redisCacheInstance } from "../../services/init-services";
import { GameStatusEnum, PieceTypeEnum, Position } from "../../types/websocket-types";
import { Game } from "./Game";

export class GameManager {
    private games = new Map<string, Game>();
    private player_game_map = new Map<string, string>();

    constructor() { };

    public async create_game(gameId: string, creatorId?: string): Promise<Game> {
        console.log("gameid received is", gameId);
        const game = new Game(gameId);
        this.games.set(gameId, game);

        if (creatorId) {
            game.add_player(creatorId);
            this.player_game_map.set(creatorId, gameId);
        }

        await redisCacheInstance.set_game(gameId, {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
        });

        return game;
    }

    public async restore_game_from_cache(gameId: string): Promise<Game | null> {
        let game = this.games.get(gameId);
        if (game) return game;

        const cached = await redisCacheInstance.get_game(gameId);
        const rawMoves = await databaseQueueInstance.fetch_moves(gameId);

        const moves = rawMoves.map(m => ({
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
            return game;
        }

        const dbGame = await databaseQueueInstance.fetch_game(gameId);
        if (!dbGame) return null;

        const dbMoves = (dbGame.moves || []).map(m => ({
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

        await redisCacheInstance.set_game(gameId, {
            gameId,
            boardState: dbGame.boardState,
            currentTurn: dbGame.currentTurn,
            status: dbGame.status,
            whitePlayerId: dbGame.whitePlayer,
            blackPlayerId: dbGame.blackPlayer,
        });

        return game;
    }


    public async join_game(gameId: string, playerId: string): Promise<{ success: boolean, result?: any, error?: string, gameState?: any }> {

        let game: Game | null | undefined = this.games.get(gameId);
        if (!game) {
            game = await this.restore_game_from_cache(gameId);
            if (!game) {
                return {
                    success: false,
                    error: 'Game not found',
                }
            }
        }

        const previousGameId = this.player_game_map.get(playerId);
        if (previousGameId) {
            await this.leave_game(playerId);
        };

        try {
            const result = game.add_player(playerId);
            this.player_game_map.set(playerId, gameId);

            await redisCacheInstance.set_game(gameId, {
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

            await databaseQueueInstance.enqueue_update_game_staet(payload);

            return {
                success: true,
                result,
                gameState: game.get_game_state(),
            }
        } catch (error) {
            return {
                success: false,
                error: 'Join failed',
            }
        }
    }

    public async leave_game(playerId: string): Promise<void> {
        const gameId = this.player_game_map.get(playerId);
        if (!gameId) return;

        const game = this.games.get(gameId);
        if (!game) return;

        game.remove_player(playerId);
        this.player_game_map.delete(playerId);

        await redisCacheInstance.set_game(gameId, {
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

        await databaseQueueInstance.enqueue_update_game_staet(payload);
    }

    public async make_move(playerId: string, from: Position, to: Position): Promise<{ success: boolean, result?: any, error?: string }> {
        console.log('make move ----------> 1');
        const gameId = this.player_game_map.get(playerId);
        if (!gameId) {
            return {
                success: false,
                error: 'Game id not found',
            };
        };
        console.log('make move ----------> 2');
        let game: Game | null | undefined = this.games.get(gameId);
        if (!game) {
            game = await this.restore_game_from_cache(gameId);
            if (!game) {
                return {
                    success: false,
                    error: 'game not foudn',
                }
            }
        }

        console.log('make move ----------> 3');
        const result = game.make_move(playerId, from, to);
        if (!result.success) return result;
        console.log('make move ----------> 4');
        await redisCacheInstance.set_game(gameId, {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
            whitePlayerId: game.get_game_state().whitePlayer,
            blackPlayerId: game.get_game_state().blackPlayer,
        });
        console.log('make move ----------> 5');
        const moveJob: CreateMoveJob = {
            gameId,
            playerId,
            moveNumber: game.get_game_state().moveHistory.length,
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            piece: result.move!.piece,
            captured: result.move!.captured || null,
            isCheck: game.get_game_state().gameStatus === GameStatusEnum.CHECK,
            isCheckMate: game.get_game_state().gameStatus === GameStatusEnum.CHECKMATE,
        };
        console.log('make move ----------> 6');
        await databaseQueueInstance.enqueue_create_move(moveJob);

        const stateJob: UpdateGameStateJob = {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
        };
        await databaseQueueInstance.enqueue_update_game_staet(stateJob);
        console.log('make move ----------> 7');
        return result;
    }

    public async end_game(gameId: string, winner?: string | null) {
        const game = this.games.get(gameId);
        if (!game) return;

        game.get_game_state().gameStatus = GameStatusEnum.ENDED;

        await redisCacheInstance.set_game(gameId, {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
            whitePlayerId: game.get_game_state().whitePlayer,
            blackPlayerId: game.get_game_state().blackPlayer,
        });

        const endJob: EndGameJob = {
            gameId,
            winner: winner || null,
            endedAt: new Date().toISOString(),
        };
        await databaseQueueInstance.enqueue_end_game(endJob);
    }

    public get_game(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    public get_player_game(playerId: string): Game | undefined {
        const gameId = this.player_game_map.get(playerId);
        return gameId ? this.games.get(gameId) : undefined;
    }
}