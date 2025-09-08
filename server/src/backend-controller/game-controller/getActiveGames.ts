import { Request, Response } from "express";
import prisma from "../../../prisma/prisma-singleton";
import { GameStatus } from "@prisma/client";

export default async function getActiveGame(req: Request, res: Response) {
    const playerId = req.query.playerId as string;
    console.log("inside get active games");
    if (!playerId) {
        res.status(400).json({
            success: false,
            error: 'Player not found',
        });
        return;
    }

    try {
        const activeGames = await prisma.game.findMany({
            where: {
                status: GameStatus.ACTIVE,
                OR: [
                    { whitePlayerId: playerId },
                    { blackPlayerId: playerId },
                ],
            },
            include: {
                whitePlayer: {
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                        image: true,
                    },
                },
                blackPlayer: {
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                        image: true,
                    },
                },
                moves: {
                    select: {
                        id: true,
                        fromX: true,
                        fromY: true,
                        toX: true,
                        toY: true,
                        moveNumber: true,
                        piece: true,
                        captured: true,
                        createdAt: true,
                    },
                },
                capturedPieces: {
                    select: {
                        id: true,
                        piece: true,
                        color: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!activeGames || activeGames.length === 0) {
            res.status(404).json({
                success: false,
                error: 'No games found for this player',
            });
            return;
        }

        res.status(201).json({
            success: true,
            activeGames,
        });
        return;
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        })
    }
}