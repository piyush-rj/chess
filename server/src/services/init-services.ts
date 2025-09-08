// import RedisCache from "../cache/RedisCache";
// import DatabaseQueue from "../queue/database-queue";

// export let redisCacheInstance: RedisCache;
// export let databaseQueueInstance: DatabaseQueue;
// let initialized = false;

// export function init_services(redis_url?: string) {
//     if (initialized) return { redisCacheInstance, databaseQueueInstance };

//     redisCacheInstance = new RedisCache(redis_url || process.env.REDIS_URL);
//     databaseQueueInstance = new DatabaseQueue(redis_url || process.env.REDIS_URL);

//     initialized = true;
//     return { redisCacheInstance, databaseQueueInstance };
// }

import RedisCache from "../cache/RedisCache";
import DatabaseQueue from "../queue/database-queue";

export let redisCacheInstance: RedisCache;
export let databaseQueueInstance: DatabaseQueue;

export default function initServices() {
    redisCacheInstance = new RedisCache(process.env.REDIS_URL);
    databaseQueueInstance = new DatabaseQueue(process.env.REDIS_URL);
}
