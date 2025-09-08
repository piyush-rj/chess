import { Color, PieceType } from "@prisma/client";
import Redis from "ioredis";
import { PieceTypeEnum } from "../types/websocket-types";

export type GameCacheValue = {
    gameId: string;
    boardState: any | null;
    currentTurn: string | null;
    status: string | null;
    whitePlayerId?: string | null;
    blackPlayerId?: string | null;
    updatedAt?: string;
};

const REDIS_URL = process.env.REDIS_URL;

export default class RedisCache {
    private redisCache: Redis;

    constructor() {
        this.redisCache = new Redis(REDIS_URL!);

        this.redisCache.on("error", (err) =>
            console.error("Redis error: ", err),
        );
        this.redisCache.on("connect", () =>
            console.log("redis connected successfully"),
        );
    }

    public async setKey(key: string, value: any, ttlSeconds?: number) {
        try {
            const stringified = JSON.stringify(value);
            if (ttlSeconds) {
                await this.redisCache.set(key, stringified, "EX", ttlSeconds);
            } else {
                await this.redisCache.set(key, stringified);
            }
        } catch (error) {
            console.error(`Error while setting key "${key}" in cache: `, error);
        }
    }

    public async getKey<T = any>(key: string): Promise<T | null> {
        try {
            const raw = await this.redisCache.get(key);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch (error) {
            console.error(`Error while getting key "${key}" from cache: `, error);
            return null;
        }
    }

    public async delKey(key: string) {
        try {
            await this.redisCache.del(key);
        } catch (error) {
            console.error(`Error while deleting key "${key}" from cache: `, error);
        }
    }

    // <-------------------------------- game-cache -------------------------------->

    private getGameKey(gameId: string) {
        return `game:${gameId}`;
    }

    public async setGame(gameId: string, value: GameCacheValue) {
        try {
            value.updatedAt = new Date().toISOString();
            await this.setKey(this.getGameKey(gameId), value);
        } catch (error) {
            console.error("Error while setting game in cache: ", error);
        }
    }

    public async getGame(gameId: string): Promise<GameCacheValue | null> {
        try {
            return await this.getKey<GameCacheValue>(this.getGameKey(gameId));
        } catch (error) {
            console.error("Error while getting game from cache: ", error);
            return null;
        }
    }

    public async deleteGame(gameId: string) {
        try {
            await this.delKey(this.getGameKey(gameId));
        } catch (error) {
            console.error("Error while deleting game from cache: ", error);
        }
    }

    public async addCapturedPieces(gameId: string, pieces: { piece: PieceTypeEnum, capturedBy: Color }[]) {
        if (!pieces) return;
        try {
            const key = `game:${gameId}:capturedPieces`;
            for (const p of pieces) {
                await this.redisCache.rpush(key, JSON.stringify(p));
            }
        } catch (error) {

        }
    }

    public async getCapturedPieces(gameId: string) {
        const key = `game:${gameId}:capturedPieces`;
        const items = await this.redisCache.lrange(key, 0, 1);
        return items.map((i: string) => JSON.parse(i));
    }

    async clearCapturedPieces(gameId: string) {
        const key = `game:${gameId}:capturedPieces`;
        await this.redisCache.del(key);
    }

    // <-------------------------------- users-cache -------------------------------->
    private getUserKey(userId: string) {
        return `user:${userId}`;
    }

    public async setUser(userId: string, data: any) {
        try {
            await this.setKey(this.getUserKey(userId), data);
        } catch (error) {
            console.error("Error while setting user in cache: ", error);
        }
    }

    public async getUser<T = any>(userId: string): Promise<T | null> {
        try {
            return await this.getKey<T>(this.getUserKey(userId));
        } catch (error) {
            console.error("Error while getting user from cache: ", error);
            return null;
        }
    }

    public async close() {
        try {
            await this.redisCache.quit();
        } catch (error) {
            console.warn("Error while closing Redis connection, forcing disconnect");
            try {
                await this.redisCache.disconnect();
            } catch (_) { }
        }
    }
}
