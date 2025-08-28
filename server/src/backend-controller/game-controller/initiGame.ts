import { Request, Response } from "express";

export default function initGame(req: Request, res: Response) {
    const gameId = Math.random().toString(36).substring(2, 15);
    res.json({
        gameId,
        message: "game created"
    });
    return;
}