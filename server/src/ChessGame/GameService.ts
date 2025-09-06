import { PrismaClient } from "@prisma/client";
import { GameManager } from "../ChessGame/chess-game-class/GameManager";

const prisma = new PrismaClient();

export class GameService {
    private gameManager: GameManager;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
    }

    async createGame(playerId: string) {
        const dbGame = await prisma.game.create({
            data: {
                whitePlayerId: playerId,
                status: "WAITING",
            },
        });
        console.log('game created', dbGame);

        this.gameManager.create_game(dbGame.id);
        console.log('after creating game in ws');
        const joinResult = this.gameManager.join_game(dbGame.id, playerId);

        return { gameId: dbGame.id, ...joinResult };
    }

    async joinGame(gameId: string, playerId: string) {
        console.log("gameId received is -----------> ", gameId);

        const dbGame = await prisma.game.findUnique({
            where: { id: gameId }
        });

        if (!dbGame) {
            return { success: false, error: "Game not found in database" };
        }

        if (dbGame.status !== "WAITING") {
            return { success: false, error: "Game is not available for joining" };
        }

        if (dbGame.whitePlayerId === playerId) {
            return { success: false, error: "Cannot join your own game" };
        }

        let game = this.gameManager.get_game(gameId);
        if (!game) {
            this.gameManager.create_game(gameId);
            this.gameManager.join_game(gameId, dbGame.whitePlayerId!);
            game = this.gameManager.get_game(gameId);
        }

        const result = this.gameManager.join_game(gameId, playerId);

        if (!result.success) {
            return result;
        }

        const gameState = this.gameManager.get_game(gameId)!.get_game_state();
        await prisma.game.update({
            where: { id: gameId },
            data: {
                blackPlayerId: gameState.blackPlayer,
                status: gameState.gameStatus,
            },
        });

        return result;
    }

    async saveMove(
        playerId: string,
        gameId: string,
        from: { x: number; y: number },
        to: { x: number; y: number }
    ) {
        const game = this.gameManager.get_game(gameId);
        if (!game) return { success: false, error: "game not found" };

        const moveResult = game.make_move(playerId, from, to);

        if (moveResult.success) {
            const moveCount = await prisma.move.count({ where: { gameId } });
            const moveNumber = moveCount + 1;

            await prisma.move.create({
                data: {
                    gameId,
                    playerId,
                    moveNumber,
                    fromX: from.x,
                    fromY: from.y,
                    toX: to.x,
                    toY: to.y,
                    piece: moveResult.move!.piece,
                    captured: moveResult.move?.captured ?? null,
                    isCheck: moveResult.move?.isCheck ?? false,
                    isCheckmate: moveResult.move?.isCheckmate ?? false,
                    // isCastle: moveResult.move?.isCastle ?? false,
                    // isEnPassant: moveResult.move?.isEnPassant ?? false,
                    // promotion: moveResult.move?.promotion ?? null,
                },
            });

            await prisma.game.update({
                where: { id: gameId },
                data: {
                    status: game.get_game_state().gameStatus,
                    boardState: serializeBoard(game.get_game_state().board),
                },
            });
        }

        return moveResult;
    }


    async getGameState(gameId: string) {
        return this.gameManager.get_game(gameId)?.get_game_state();
    }
}

function serializeBoard(board: (any | null)[][]) {
    return board.map(row =>
        row.map(piece =>
            piece
                ? {
                    type: piece.type,
                    color: piece.color,
                }
                : null
        )
    );
}
