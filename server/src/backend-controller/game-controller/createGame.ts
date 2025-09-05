import { Request, Response } from "express";
import { ws_handler } from "../../ChessGame/chess-game-singleton/singleton";
import { PrismaClient } from "@prisma/client";
import { GameStatusEnum } from "../../types/types";
import { Color } from "../../generated/prisma";

const prisma = new PrismaClient();

export default async function createGame(req: Request, res: Response) {
    try {
        const gameId = ws_handler.gameManager.create_game();

        await prisma.game.create({
            data: {
                id: gameId,
                status: GameStatusEnum.WAITING,
                currentTurn: Color.WHITE,
            }
        })

        res.status(201).json({
            success: true,
            gameId,
            message: "Game created successfully",
        });
    } catch (error) {
        console.error("Error in creating game", error);
        return;
    }
    
}