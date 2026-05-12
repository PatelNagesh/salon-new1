/**
 * Advanced caching strategies implementation
 */

import { Logger } from '../utils/logger.util';

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessedAt: number;
}

/**
 * LRU (Least Recently Used) Cache
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private logger: Logger;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 300) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.logger = new Logger('LRUCache');
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.logger.debug(`LRU cache entry expired: ${key}`);
      return null;
    }

    // Update access metadata
    entry.accessCount++;
    entry.lastAccessedAt = Date.now();

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.logger.debug(`LRU cache hit: ${key}`);
    return entry.value;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Remove least recently used if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.logger.debug(`LRU evicted: ${firstKey}`);
      }
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : Date.now() + this.defaultTTL * 1000,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessedAt: Date.now()
    };

    this.cache.set(key, entry);
    this.logger.debug(`LRU cache set: ${key}`);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.logger.info('LRU cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private calculateHitRate(): number {
    let totalAccess = 0;
    let hits = 0;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      if (entry.accessCount > 0) {
        hits++;
      }
    }

    return totalAccess > 0 ? hits / totalAccess : 0;
  }
}

/**
 * FIFO (First In First Out) Cache
 */
export class FIFOCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private logger: Logger;
  private defaultTTL: number;
  private queue: string[];

  constructor(maxSize: number = 1000, defaultTTL: number = 300) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.logger = new Logger('FIFOCache');
    this.defaultTTL = defaultTTL;
    this.queue = [];
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.queue = this.queue.filter(k => k !== key);
      this.logger.debug(`FIFO cache entry expired: ${key}`);
      return null;
    }

    this.logger.debug(`FIFO cache hit: ${key}`);
    return entry.value;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Remove first in if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.queue.shift();
      if (firstKey) {
        this.cache.delete(firstKey);
        this.logger.debug(`FIFO evicted: ${firstKey}`);
      }
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : Date.now() + this.defaultTTL * 1000,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessedAt: Date.now()
    };

    this.cache.set(key, entry);

    if (!this.queue.includes(key)) {
      this.queue.push(key);
    }

    this.logger.debug(`FIFO cache set: ${key}`);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.queue = this.queue.filter(k => k !== key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.queue = [];
    this.logger.info('FIFO cache cleared');
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }
}

/**
 * LFU (Least Frequently Used) Cache
 */
export class LFUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private logger: Logger;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 300) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.logger = new Logger('LFUCache');
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.logger.debug(`LFU cache entry expired: ${key}`);
      return null;
    }

    // Update access count
    entry.accessCount++;
    entry.lastAccessedAt = Date.now();

    this.logger.debug(`LFU cache hit: ${key}`);
    return entry.value;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Remove least frequently used if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      let lfuKey: string | null = null;
      let minAccess = Infinity;

      for (const [k, entry] of this.cache.entries()) {
        if (entry.accessCount < minAccess) {
          minAccess = entry.accessCount;
          lfuKey = k;
        }
      }

      if (lfuKey) {
        this.cache.delete(lfuKey);
        this.logger.debug(`LFU evicted: ${lfuKey}`);
      }
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : Date.now() + this.defaultTTL * 1000,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessedAt: Date.now()
    };

    this.cache.set(key, entry);
    this.logger.debug(`LFU cache set: ${key}`);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.logger.info('LFU cache cleared');
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt;
  }
}

/**
 * Cache strategy factory
 */
export class CacheStrategyFactory {
  private static logger = new Logger('CacheStrategyFactory');

  static create<T>(
    strategy: 'lru' | 'fifo' | 'lfu',
    maxSize: number = 1000,
    defaultTTL: number = 300
  ): LRUCache<T> | FIFOCache<T> | LFUCache<T> {
    this.logger.info(`Creating cache strategy: ${strategy}`);

    switch (strategy) {
      case 'lru':
        return new LRUCache<T>(maxSize, defaultTTL);
      case 'fifo':
        return new FIFOCache<T>(maxSize, defaultTTL);
      case 'lfu':
        return new LFUCache<T>(maxSize, defaultTTL);
      default:
        this.logger.warn(`Unknown strategy: ${strategy}, defaulting to LRU`);
        return new LRUCache<T>(maxSize, defaultTTL);
    }
  }
}
