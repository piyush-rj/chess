import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function (req: Request, res: Response) {
    const { user } = req.body;

    try {
        const myUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                image: user.image,
            },
            create: {
                email: user.email,
                name: user.name,
                image: user.image,
            },
        });

        const jwtPayload = {
            name: myUser.name,
            email: myUser.email,
            image: myUser.image,
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: 'internal server error' });
            return;
        }

        const token = jwt.sign(jwtPayload, secret);
        res.status(201).json({
            success: true,
            user: myUser,
            token,
        });
    } catch (error: any) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: 'sign-in failed',
        });
    }
}
