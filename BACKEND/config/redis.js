import Redis from 'ioredis';

let redis = null;

if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
    });

    redis.on('connect', () => console.log('[Redis] Connected'));
    redis.on('error', (err) => console.warn('[Redis] Error (falling back to MongoDB):', err.message));
} else {
    console.warn('[Redis] REDIS_URL not set — caching disabled.');
}

export default redis;
