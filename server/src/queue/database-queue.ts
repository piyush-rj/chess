import Bull from 'bull';
import { PrismaClient, PieceType, Color, GameStatus } from '@prisma/client';
import { QueueJobTypes } from '../types/database-queue-types';
import { GameStatusEnum } from '../types/websocket-types';

const prisma = new PrismaClient();

export interface CreateMoveJob {
    gameId: string;
    playerId: string;
    moveNumber: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    piece: PieceType | string;
    captured?: PieceType | string | null;
    isCheck?: boolean;
    isCheckMate?: boolean;
}

export interface UpdateGameStateJob {
    gameId: string;
    boardState: any;
    currentTurn: Color | string | undefined;
    status: GameStatus | string | undefined;
}

export interface EndGameJob {
    gameId: string;
    winner?: string | null;
    endedAt?: string;
}

const DEFAULT_JOB_OPTIONS: Bull.JobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 1000,
};

export default class DatabaseQueue {
    private queue: Bull.Queue;

    constructor(redis_url?: string) {
        const url = redis_url || process.env.REDIS_URL;
        this.queue = new Bull('database-operations', { redis: url });
        this.setup_processors();
    }

    private setup_processors() {

        this.queue.process(QueueJobTypes.CREATE_MOVE, async (job: Bull.Job) => {
            const data = job.data as CreateMoveJob;
            try {
                const existing = await prisma.move.findFirst({
                    where: {
                        gameId: data.gameId,
                        moveNumber: data.moveNumber
                    }
                });
                if (existing) {
                    return {
                        success: true,
                        skipped: true,
                    };
                };

                console.log('playerId from db queue ----------------------------------------------------> ', data.playerId);

                const created = await prisma.move.create({
                    data: {
                        gameId: data.gameId,
                        playerId: data.playerId,
                        moveNumber: data.moveNumber,
                        fromX: data.fromX,
                        fromY: data.fromY,
                        toX: data.toX,
                        toY: data.toY,
                        piece: (data.piece as any),
                        captured: (data.captured as any) || null,
                        isCheck: !!data.isCheck,
                        isCheckmate: !!data.isCheckMate,
                    },
                });

                return {
                    success: true,
                    move: created,
                }
            } catch (error) {
                console.error('create move processor err ', error);
                throw error;
            }
        });

        this.queue.process(QueueJobTypes.UPDATE_GAME_STATE, async (job: Bull.Job) => {
            const data = job.data as UpdateGameStateJob;
            try {
                await prisma.game.upsert({
                    where: { id: data.gameId },
                    update: {
                        boardState: data.boardState,
                        currentTurn: data.currentTurn ? (data.currentTurn?.toString().toUpperCase() as Color) : undefined,
                        status: data.status as GameStatus,
                    },
                    create: {
                        id: data.gameId,
                        boardState: data.boardState,
                        currentTurn: data.currentTurn ? (data.currentTurn?.toString().toUpperCase() as Color) : "WHITE", // fallback
                        status: (data.status as GameStatus) || GameStatus.WAITING,
                    },
                });

                return { success: true };
            } catch (error) {
                console.error("update game processor error: ", error);
                throw error;
            }
        });


        this.queue.process(QueueJobTypes.END_GAME, async (job: Bull.Job) => {
            const data = job.data as EndGameJob;
            try {
                await prisma.game.update({
                    where: {
                        id: data.gameId,
                    },
                    data: {
                        status: data?.winner ? GameStatusEnum.ENDED : GameStatusEnum.IN_PROGRESS,
                        endedAt: data.endedAt ? new Date(data.endedAt) : new Date(),
                        winner: data.winner || null,
                    } as any,
                });

                return {
                    success: true,
                }
            } catch (error) {
                console.error('end game procc err: ', error);
                throw error;
            }
        });
    }

    public async enqueue_create_move(payload: CreateMoveJob, opts?: Bull.JobOptions) {
        return this.queue.add(QueueJobTypes.CREATE_MOVE, payload, { jobId: `${payload.gameId}:move:${payload.moveNumber}`, ...DEFAULT_JOB_OPTIONS, ...opts });
    }

    public async enqueue_update_game_staet(payload: UpdateGameStateJob, opts?: Bull.JobOptions) {
        return this.queue.add(QueueJobTypes.UPDATE_GAME_STATE, payload, { jobId: `${payload.gameId}:update`, ...DEFAULT_JOB_OPTIONS, ...opts });
    }


    public async enqueue_end_game(payload: EndGameJob, opts?: Bull.JobOptions) {
        return this.queue.add(QueueJobTypes.END_GAME, payload, { jobId: `${payload.gameId}:end`, ...DEFAULT_JOB_OPTIONS, ...opts });
    }

    public async fetch_game(gameId: string) {
        try {
            const game = await prisma.game.findUnique({
                where: { id: gameId },
                include: {
                    moves: {
                        orderBy: { moveNumber: "asc" }
                    }
                }
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
            console.error("fetch_game error:", error);
            throw error;
        }
    }

    public async fetch_moves(gameId: string) {
        try {
            const moves = await prisma.move.findMany({
                where: { gameId },
                orderBy: { moveNumber: "asc" },
            });

            return moves;
        } catch (error) {
            console.error("fetch_moves error:", error);
            throw error;
        }
    }

    public async close() {
        try {
            await this.queue.close();
        } catch (e) {
            console.warn("Error closing queue", e);
        }
    }
}