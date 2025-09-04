import { Request, Response } from "express";
import { ws_handler } from "../../ChessGame/chess-game-singleton/singleton";

export default function joinGame(req: Request, res: Response) {
    const { gameId, playerId } = req.body;

    if (!gameId || !playerId) {
        res.status(400).json({
            success: false,
            message: "Missing gameId or playerId",
        });
        return;
    }

    const result = ws_handler.gameManager.join_game(gameId, playerId);
    if (result.success) {
        const game = ws_handler.gameManager.get_game(gameId);
        res.status(201).json({
            success: true,
            result: result.result,
            game_state: game?.get_game_state(),
        });
    } else {
        res.status(400).json({
            success: false,
            error: result.error
        });
    }
}