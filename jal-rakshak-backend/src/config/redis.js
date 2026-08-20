const logger = require('../utils/logger');

let redisClient = null;
let isRedisConnected = false;

// In-memory fallback cache when Redis is unavailable
const memoryCache = new Map();

const initRedis = async () => {
  if (process.env.NODE_ENV === 'test') {
    return; // Use in-memory cache in test environment
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    const { createClient } = require('redis');
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: false,
        connectTimeout: 2000,
      },
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      logger.info('Redis client connected successfully');
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      logger.warn(`Redis notice: ${err.message}. Using in-memory cache.`);
    });

    await redisClient.connect().catch((e) => {
      isRedisConnected = false;
      logger.warn(`Redis connection skipped (${e.message}). Using in-memory cache.`);
    });
  } catch (error) {
    isRedisConnected = false;
    logger.warn(`Redis initialization skipped. Using in-memory cache.`);
  }
};

const getCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    }
    const item = memoryCache.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  } catch (err) {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
      return;
    }
    memoryCache.set(key, {
      value,
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  } catch (err) {
    // ignore
  }
};

const delCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    }
    memoryCache.delete(key);
  } catch (err) {
    // ignore
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  isRedisConnected: () => isRedisConnected,
};
