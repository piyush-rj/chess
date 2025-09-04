import { Request, Response } from "express";
import { ws_handler } from "../../ChessGame/chess-game-singleton/singleton";

export default function makeMove(req: Request, res: Response) {
    const { gameId, playerId, from, to } = req.body;

    if ( !gameId || !playerId || !from || !to) {
        res.status(400).json({
            success: false,
            error: 'Insufficient parameters',
        });
        return;
    }

    const game = ws_handler.gameManager.get_game(gameId);
    if (!game) {
        console.error("Game not found");
        return;
    }

    const result = game.make_move(playerId, from, to);
    if (result.success) {
        res.status(201).json({
            success: true,
            move: result.move,
            gameState: game.get_game_state(),
        });
        return;
    } else {
        res.status(400).json({
            success: false,
            error: 'Failed to make a move',
        });
        return;
    }
}