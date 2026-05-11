import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../core/utils/logger.util';

const logger = new Logger('CacheMiddleware');

/**
 * Cache configuration
 */
interface CacheConfig {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
  skipCache?: (req: Request) => boolean;
}

/**
 * In-memory cache store
 * In production, use Redis or similar
 */
const cacheStore = new Map<string, { data: any; expiresAt: number }>();

/**
 * Generate cache key from request
 */
const generateCacheKey = (req: Request, prefix?: string): string => {
  const parts = [
    prefix || 'api',
    req.method,
    req.path,
    JSON.stringify(req.query),
  ];

  return parts.join(':');
};

/**
 * Check if cache entry is expired
 */
const isExpired = (expiresAt: number): boolean => {
  return Date.now() > expiresAt;
};

/**
 * Get cached data
 */
const getFromCache = (key: string): any => {
  const entry = cacheStore.get(key);

  if (!entry) {
    return null;
  }

  if (isExpired(entry.expiresAt)) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data;
};

/**
 * Set cached data
 */
const setCache = (key: string, data: any, ttl: number): void => {
  const expiresAt = Date.now() + ttl * 1000;
  cacheStore.set(key, { data, expiresAt });
};

/**
 * Clear cache by pattern
 */
const clearCachePattern = (pattern: string): void => {
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
};

/**
 * Cache middleware factory
 * Caches GET requests and serves cached responses
 */
export const cacheMiddleware = (config: CacheConfig = {}) => {
  const { ttl = 300, keyPrefix, skipCache } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if configured
    if (skipCache && skipCache(req)) {
      return next();
    }

    const cacheKey = generateCacheKey(req, keyPrefix);
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      logger.debug(`Cache hit: ${cacheKey}`);
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    logger.debug(`Cache miss: ${cacheKey}`);

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data: any) {
      setCache(cacheKey, data, ttl);
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

/**
 * Cache invalidation middleware
 * Invalidates cache on POST, PUT, DELETE requests
 */
export const invalidateCacheMiddleware = (patterns: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // Only invalidate on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
          for (const pattern of patterns) {
            clearCachePattern(pattern);
            logger.debug(`Cache invalidated: ${pattern}`);
          }
        }
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear all cache
 */
export const clearAllCache = (): void => {
  cacheStore.clear();
  logger.debug('All cache cleared');
};

/**
 * Get cache stats
 */
export const getCacheStats = () => {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
  };
};
