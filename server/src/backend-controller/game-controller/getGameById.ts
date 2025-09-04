import { Request, Response } from "express";
import { ws_handler } from "../../ChessGame/chess-game-singleton/singleton";

export default function getGameById(req: Request, res: Response) {
    const { gameId } = req.body;
    
    const game = ws_handler.gameManager.get_game(gameId);
    if (!game) {
        res.status(400).json({
            success: false,
            message: 'Error in fetching game',
        });
        return;
    }

    res.status(201).json({
        success: true,
        game,
        message: "Game fetched successfully",
    });
    return;
}