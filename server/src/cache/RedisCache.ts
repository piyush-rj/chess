import Redis from "ioredis";

export type GameCacheValue = {
    gameId: string;
    boardState: any | null;
    currentTurn: string | null;
    status: string | null;
    whitePlayerId?: string | null;
    blackPlayerId?: string | null;
    updatedAt?: string;
}

export default class RedisCache {
    private redis: Redis;

    constructor(redisUrl?: string) {
        const url = redisUrl || process.env.REDIS_URL;
        this.redis = new Redis(url!);

        this.redis.on('error', (err) => console.error('Redis error', err));
        this.redis.on('connect', () => console.log('Redis connected'));
    }

    public async setKey(key: string, value: any, ttlSeconds?: number) {
        const s = JSON.stringify(value);
        if (ttlSeconds) {
            await this.redis.set(key, s, 'EX', ttlSeconds);
        } else {
            await this.redis.set(key, s);
        }
    }

    public async getKey<T = any>(key: string): Promise<T | null> {
        const raw = await this.redis.get(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as T;
        } catch (e) {
            console.error('Failed to parse redis value for key', key, e);
            return null;
        }
    }

    public async delKey(key: string) {
        await this.redis.del(key);
    }

    // -------------------- game helpers --------------------
    private get_game_key(gameId: string) {
        return `game:${gameId}`;
    }

    public async set_game(gameId: string, value: GameCacheValue) {
        value.updatedAt = new Date().toISOString();
        await this.setKey(this.get_game_key(gameId), value);
    }

    public async get_game(gameId: string): Promise<GameCacheValue | null> {
        return this.getKey<GameCacheValue>(this.get_game_key(gameId));
    }

    public async delete_game(gameId: string) {
        await this.delKey(this.get_game_key(gameId));
    }

    // -------------------- user helpers --------------------
    private get_user_key(userId: string) {
        return `user:${userId}`;
    }

    private async set_user(userId: string, data: any) {
        await this.setKey(this.get_user_key(userId), data);
    }

    public async get_user(userId: string) {
        return this.getKey(this.get_user_key(userId));
    }

    public async close() {
        try {
            await this.redis.quit();
        } catch (err) {
            try {
                await this.redis.disconnect();
            } catch (_) {}
        }
    }
}