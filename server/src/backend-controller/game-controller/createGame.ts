import { Request, Response } from "express";
import { ws_handler } from "../../ChessGame/chess-game-singleton/singleton";

export default function createGame(req: Request, res: Response) {
    try {
        const gameId = ws_handler.gameManager.create_game();

        res.status(201).json({
            success: true,
            gameId,
            message: "Game created successfully",
        });
        return;
    } catch (error) {
        console.error("Error in creating game", error);
        return;
    }
    
}