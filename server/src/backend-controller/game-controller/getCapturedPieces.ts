import { Request, Response } from "express";
import prisma from "../../../prisma/prisma-singleton";

export default async function getCapturedPieces(req: Request, res: Response) {
    const { gameId } = req.body;
    if (!gameId) {
        res.status(400).json({
            success: false,
            error: 'Game id not found',
        });
        return;
    }
    try {
        const response  = await prisma.capturedPiece.findMany({
            where: {
                gameId: gameId
            },
            select: {
                piece: true,
                color: true,
                moveId: true,
                move: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        res.status(201).json({
            success: true,
            response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        return;
    }
}