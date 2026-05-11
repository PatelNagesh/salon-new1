import { Logger } from './logger.util';

/**
 * Cache utility for in-memory caching
 */
export class CacheService {
  private cache: Map<string, CacheEntry>;
  private logger: Logger;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300) {
    this.cache = new Map();
    this.logger = new Logger('CacheService');
    this.defaultTTL = defaultTTL;

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.logger.debug(`Cache entry expired: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit: ${key}`);
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry = {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : Date.now() + this.defaultTTL * 1000,
      createdAt: Date.now()
    };

    this.cache.set(key, entry);
    this.logger.debug(`Cache set: ${key} (TTL: ${ttl || this.defaultTTL}s)`);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache deleted: ${key}`);
    }
  }

  /**
   * Delete multiple keys from cache
   */
  async deleteMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(key);
    }
  }

  /**
   * Delete keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
    }

    this.logger.debug(`Deleted ${keysToDelete.length} keys matching pattern: ${pattern}`);
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.info(`Cache cleared (${size} entries)`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (this.isExpired(entry)) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      size: this.getCacheSize()
    };
  }

  /**
   * Get or set value (get if exists, set if not)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Set multiple values at once
   */
  async setMany<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const { key, value, ttl } of entries) {
      await this.set(key, value, ttl);
    }
  }

  /**
   * Get multiple values at once
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();

    for (const key of keys) {
      result.set(key, await this.get<T>(key));
    }

    return result;
  }

  /**
   * Increment value in cache
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const current = await this.get<number>(key);
    const newValue = (current || 0) + amount;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement value in cache
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    return this.increment(key, -amount);
  }

  /**
   * Check if entry has expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Get cache size in bytes
   */
  private getCacheSize(): number {
    let size = 0;

    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(entry.value).length * 2;
    }

    return size;
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
  }
}

/**
 * Cache entry interface
 */
interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  total: number;
  valid: number;
  expired: number;
  size: number;
}

/**
 * Global cache service instance
 */
export const cacheService = new CacheService();
