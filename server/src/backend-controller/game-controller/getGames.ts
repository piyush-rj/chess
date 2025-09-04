import { Request, Response } from "express";
import { ws_handler } from "../../ChessGame/chess-game-singleton/singleton";

export default function getGames(req: Request, res: Response) {
    try {
        const games = ws_handler.gameManager.get_all_games();
        res.status(200).json({
            success: true,
            games,
        });
    } catch (error) {
        console.error("Error in getting games", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
