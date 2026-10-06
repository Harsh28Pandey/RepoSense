import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

export let redisClient = null;
export let isRedisConnected = false;

export function initRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy(times) {
        if (times > 2) {
          logger.warn('Redis unavailable, using in-memory fallback.');
          return null; // Stop retrying
        }
        return 1000;
      }
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      logger.info('Redis connected successfully.');
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      // logger.warn(`Redis Error: ${err.message}`);
    });
  } catch (err) {
    logger.warn('Failed to initialize Redis client.');
  }
}
