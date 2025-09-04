import { Request, Response } from "express";
import { ws_handler } from "../../ChessGame/chess-game-singleton/singleton";

export default function leaveGame(req: Request, res: Response) {
    const { playerId } = req.body;
    if (!playerId) {
        res.status(400).json({
            success: false,
            error: 'Missing playerId',
        });
    }

    ws_handler.gameManager.leave_game(playerId);
    res.status(201).json({
        success: true,
        message: "Left the game successfully",
    })
}