import Bull from "bull";
import { PrismaClient, PieceType, Color, GameStatus } from "@prisma/client";
import { QueueJobTypes } from "../types/database-queue-types";

const prisma = new PrismaClient();
const REDIS_URL = process.env.REDIS_URL;

export interface CreateMoveJob {
    gameId: string;
    playerId: string;
    moveNumber: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    piece: PieceType | string;
    captured?: { piece: PieceType | string; capturedBy: Color }[] | null;
    isCheck?: boolean;
    isCheckMate?: boolean;
}

export interface UpdateGameStateJob {
    gameId: string;
    boardState: any;
    currentTurn: Color | string | undefined;
    status: GameStatus | string | undefined;
    whitePlayerId?: string;
    blackPlayerId?: string;
}

export interface EndGameJob {
    gameId: string;
    winner?: string | null;
    endedAt?: string;
}

interface JobOption {
    attempts: number;
    delay: number;
    removeOnComplete: number;
    removeOnFail: number;
}

export default class DatabaseQueue {
    private databaseQueue: Bull.Queue;
    private defaultJobOptions: JobOption = {
        attempts: 3,
        delay: 1000,
        removeOnComplete: 100,
        removeOnFail: 50,
    };

    constructor() {
        this.databaseQueue = new Bull("database-operations", {
            redis: REDIS_URL,
        });
        this.setupProcessors();
    }

    private setupProcessors() {
        this.databaseQueue.process(
            QueueJobTypes.CREATE_MOVE,
            this.createMoveProcessor.bind(this),
        );
        this.databaseQueue.process(
            QueueJobTypes.UPDATE_GAME_STATE,
            this.updateGameStateProcessor.bind(this),
        );
        this.databaseQueue.process(
            QueueJobTypes.END_GAME,
            this.endGameProcessor.bind(this),
        );
    }

    // <-------------------------------- processors -------------------------------->
    private async createMoveProcessor(job: Bull.Job) {
        try {
            const data: CreateMoveJob = job.data;
            const existing = await prisma.move.findFirst({
                where: {
                    gameId: data.gameId,
                    moveNumber: data.moveNumber,
                },
            });
            if (existing) {
                return { success: true, skipped: true };
            }
            const created = await prisma.move.create({
                data: {
                    gameId: data.gameId,
                    playerId: data.playerId,
                    moveNumber: data.moveNumber,
                    fromX: data.fromX,
                    fromY: data.fromY,
                    toX: data.toX,
                    toY: data.toY,
                    piece: data.piece as PieceType,
                    captured: null,
                    isCheck: !!data.isCheck,
                    isCheckmate: !!data.isCheckMate,
                },
            });
            console.log('inside create move 1');
            if (data.captured && data.captured.length > 0) {
                console.log('inside create move 2');
                const capturedData = data.captured.map((p) => ({
                    gameId: data.gameId,
                    moveId: created.id,
                    piece: p.piece as PieceType,
                    color: p.capturedBy as Color,
                }));
                console.log('inside move captured data is ', capturedData);
                await prisma.capturedPiece.createMany({
                    data: capturedData,
                })
            }
            return { success: true, move: created };
        } catch (error) {
            console.error("Error while processing create move: ", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }

    private async updateGameStateProcessor(job: Bull.Job) {
        try {
            const data: UpdateGameStateJob = job.data;
            
            const updateData: any = {
                boardState: data.boardState,
                currentTurn: data.currentTurn
                    ? (data.currentTurn.toString().toUpperCase() as Color)
                    : undefined,
                status: data.status as GameStatus,
            };

            if (data.whitePlayerId !== undefined) {
                updateData.whitePlayerId = data.whitePlayerId;
            }
            if (data.blackPlayerId !== undefined) {
                updateData.blackPlayerId = data.blackPlayerId;
            }

            const response = await prisma.game.upsert({
                where: { id: data.gameId },
                update: updateData,
                create: {
                    id: data.gameId,
                    boardState: data.boardState,
                    currentTurn: data.currentTurn
                        ? (data.currentTurn.toString().toUpperCase() as Color)
                        : "WHITE",
                    status: (data.status as GameStatus) || GameStatus.WAITING,
                    whitePlayerId: data.whitePlayerId,
                    blackPlayerId: data.blackPlayerId,
                },
            });

            return { success: true };
        } catch (error) {
            console.error("Error while processing update game state: ", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }

    private async endGameProcessor(job: Bull.Job) {
        try {
            const data: EndGameJob = job.data;
            await prisma.game.update({
                where: { id: data.gameId },
                data: {
                    status: data?.winner ? GameStatus.ENDED : GameStatus.IN_PROGRESS,
                    endedAt: data.endedAt ? new Date(data.endedAt) : new Date(),
                    winner: data.winner as Color,
                },
            });
            return { success: true };
        } catch (error) {
            console.error("Error while processing end game: ", error);
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }

    // <-------------------------------- enqueue calls -------------------------------->
    public async createMove(payload: CreateMoveJob, options?: Partial<JobOption>) {
        return this.databaseQueue
            .add(
                QueueJobTypes.CREATE_MOVE,
                payload,
                { jobId: `${payload.gameId}:move:${payload.moveNumber}`, ...this.defaultJobOptions, ...options },
            )
            .catch((error) => console.error("Failed to enqueue create move: ", error));
    }

    public async updateGameState(payload: UpdateGameStateJob, options?: Partial<JobOption>) {
        return this.databaseQueue
            .add(
                QueueJobTypes.UPDATE_GAME_STATE,
                payload,
                { jobId: `${payload.gameId}:update`, ...this.defaultJobOptions, ...options },
            )
            .catch((error) => console.error("Failed to enqueue update game state: ", error));
    }

    public async endGame(payload: EndGameJob, options?: Partial<JobOption>) {
        return this.databaseQueue
            .add(
                QueueJobTypes.END_GAME,
                payload,
                { jobId: `${payload.gameId}:end`, ...this.defaultJobOptions, ...options },
            )
            .catch((error) => console.error("Failed to enqueue end game: ", error));
    }

    public async fetchGame(gameId: string) {
        try {
            const game = await prisma.game.findUnique({
                where: { id: gameId },
                include: {
                    moves: { orderBy: { moveNumber: "asc" } },
                },
            });
            if (!game) return null;
            return {
                id: game.id,
                boardState: game.boardState,
                currentTurn: game.currentTurn,
                status: game.status,
                whitePlayer: game.whitePlayerId,
                blackPlayer: game.blackPlayerId,
                moves: game.moves,
            };
        } catch (error) {
            console.error("Error while fetching game: ", error);
            throw error;
        }
    }

    public async fetchMoves(gameId: string) {
        try {
            return await prisma.move.findMany({
                where: { gameId },
                orderBy: { moveNumber: "asc" },
            });
        } catch (error) {
            console.error("Error while fetching moves: ", error);
            throw error;
        }
    }

    public async close() {
        try {
            await this.databaseQueue.close();
        } catch (error) {
            console.warn("Error closing database queue: ", error);
        }
    }
}