import { Request, Response } from "express";
import { ws_handler } from "../../ChessGame/chess-game-singleton/singleton";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function joinGame(req: Request, res: Response) {
    const { gameId, playerId } = req.body;

    if (!gameId || !playerId) {
        res.status(400).json({
            success: false,
            message: "Missing gameId or playerId",
        });
        return;
    }

    try {
        const result = ws_handler.gameManager.join_game(gameId, playerId);
        if (result.success) {
            const color = result.result.color;

            await prisma.game.update({
                where: { id: gameId },
                data: {
                    status: result.result.status === 'game_started' ? 'ACTIVE' : 'WAITING',
                    whitePlayerId: color === 'white' ? playerId : undefined,
                    blackPlayerId: color === 'black' ? playerId : undefined,
                },
            });

            const game = ws_handler.gameManager.get_game(gameId);
            res.status(201).json({
                success: true,
                result: result.success,
                game_state: game?.get_game_state(),
            });
        }
    } catch (error) {
        console.error('Error in joining game', error);
        res.status(500).json({ success: false, error: "Failed to join game" });
        return;
    }
}