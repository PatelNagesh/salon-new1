/**
 * Connection pooling for database connections
 */

import { Logger } from '../utils/logger.util';

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
  validationInterval: number;
}

/**
 * Connection pool entry
 */
interface PoolEntry<T> {
  connection: T;
  inUse: boolean;
  createdAt: number;
  lastUsedAt: number;
  lastValidatedAt: number;
}

/**
 * Generic connection pool
 */
export class ConnectionPool<T> {
  private logger: Logger;
  private pool: PoolEntry<T>[];
  private config: ConnectionPoolConfig;
  private connectionFactory: () => Promise<T>;
  private validator?: (connection: T) => Promise<boolean>;
  private destroyer?: (connection: T) => Promise<void>;
  private validationTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    connectionFactory: () => Promise<T>,
    config: Partial<ConnectionPoolConfig> = {},
    validator?: (connection: T) => Promise<boolean>,
    destroyer?: (connection: T) => Promise<void>
  ) {
    this.logger = new Logger('ConnectionPool');
    this.pool = [];
    this.connectionFactory = connectionFactory;
    this.validator = validator;
    this.destroyer = destroyer;
    this.config = {
      minConnections: 2,
      maxConnections: 10,
      acquireTimeout: 30000,
      idleTimeout: 300000, // 5 minutes
      maxLifetime: 3600000, // 1 hour
      validationInterval: 60000, // 1 minute
      ...config
    };

    this.initializePool();
    this.startValidation();
    this.startCleanup();
  }

  /**
   * Initialize pool with minimum connections
   */
  private async initializePool(): Promise<void> {
    this.logger.info(`Initializing connection pool (min: ${this.config.minConnections}, max: ${this.config.maxConnections})`);

    const promises: Promise<void>[] = [];

    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection());
    }

    await Promise.all(promises);
    this.logger.info(`Connection pool initialized with ${this.pool.length} connections`);
  }

  /**
   * Create a new connection
   */
  private async createConnection(): Promise<void> {
    try {
      const connection = await this.connectionFactory();
      const entry: PoolEntry<T> = {
        connection,
        inUse: false,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        lastValidatedAt: Date.now()
      };

      this.pool.push(entry);
      this.logger.debug(`Created new connection (pool size: ${this.pool.length})`);
    } catch (error) {
      this.logger.error('Failed to create connection:', error);
      throw error;
    }
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(): Promise<T> {
    const startTime = Date.now();

    // Try to find an available connection
    let entry = this.pool.find(e => !e.inUse);

    // If no available connection and pool not at max, create new one
    if (!entry && this.pool.length < this.config.maxConnections) {
      await this.createConnection();
      entry = this.pool.find(e => !e.inUse);
    }

    // If still no connection, wait for one to become available
    if (!entry) {
      await this.waitForAvailableConnection();
      entry = this.pool.find(e => !e.inUse);
    }

    if (!entry) {
      throw new Error('Failed to acquire connection from pool');
    }

    // Check if connection is still valid
    if (this.validator && await this.shouldValidate(entry)) {
      const isValid = await this.validator(entry.connection);
      if (!isValid) {
        this.logger.debug('Connection invalid, removing from pool');
        await this.removeConnection(entry);
        return this.acquire();
      }
      entry.lastValidatedAt = Date.now();
    }

    // Mark as in use
    entry.inUse = true;
    entry.lastUsedAt = Date.now();

    const acquireTime = Date.now() - startTime;
    this.logger.debug(`Acquired connection in ${acquireTime}ms (pool size: ${this.pool.length})`);

    return entry.connection;
  }

  /**
   * Release a connection back to the pool
   */
  async release(connection: T): Promise<void> {
    const entry = this.pool.find(e => e.connection === connection);

    if (!entry) {
      this.logger.warn('Attempted to release connection not in pool');
      return;
    }

    entry.inUse = false;
    entry.lastUsedAt = Date.now();

    this.logger.debug(`Released connection (pool size: ${this.pool.length})`);
  }

  /**
   * Remove a connection from the pool
   */
  private async removeConnection(entry: PoolEntry<T>): Promise<void> {
    const index = this.pool.indexOf(entry);
    if (index > -1) {
      this.pool.splice(index, 1);

      if (this.destroyer) {
        try {
          await this.destroyer(entry.connection);
        } catch (error) {
          this.logger.error('Failed to destroy connection:', error);
        }
      }

      this.logger.debug(`Removed connection from pool (pool size: ${this.pool.length})`);
    }
  }

  /**
   * Wait for an available connection
   */
  private async waitForAvailableConnection(): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < this.config.acquireTimeout) {
      const available = this.pool.find(e => !e.inUse);
      if (available) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error('Timeout waiting for available connection');
  }

  /**
   * Check if connection should be validated
   */
  private shouldValidate(entry: PoolEntry<T>): boolean {
    return Date.now() - entry.lastValidatedAt > this.config.validationInterval;
  }

  /**
   * Start periodic validation
   */
  private startValidation(): void {
    this.validationTimer = setInterval(async () => {
      await this.validateConnections();
    }, this.config.validationInterval);
  }

  /**
   * Validate all connections
   */
  private async validateConnections(): Promise<void> {
    if (!this.validator) {
      return;
    }

    this.logger.debug('Validating connections');

    for (const entry of this.pool) {
      if (!entry.inUse && await this.shouldValidate(entry)) {
        const isValid = await this.validator(entry.connection);
        if (!isValid) {
          this.logger.debug('Connection invalid during validation, removing');
          await this.removeConnection(entry);
        } else {
          entry.lastValidatedAt = Date.now();
        }
      }
    }

    // Ensure minimum connections
    await this.ensureMinimumConnections();
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanupConnections();
    }, this.config.idleTimeout / 2);
  }

  /**
   * Cleanup idle and expired connections
   */
  private async cleanupConnections(): Promise<void> {
    const now = Date.now();
    const toRemove: PoolEntry<T>[] = [];

    for (const entry of this.pool) {
      if (entry.inUse) {
        continue;
      }

      // Check if connection is idle
      if (now - entry.lastUsedAt > this.config.idleTimeout) {
        toRemove.push(entry);
        continue;
      }

      // Check if connection has exceeded max lifetime
      if (now - entry.createdAt > this.config.maxLifetime) {
        toRemove.push(entry);
      }
    }

    for (const entry of toRemove) {
      this.logger.debug('Removing idle/expired connection');
      await this.removeConnection(entry);
    }

    // Ensure minimum connections
    await this.ensureMinimumConnections();
  }

  /**
   * Ensure minimum number of connections
   */
  private async ensureMinimumConnections(): Promise<void> {
    const available = this.pool.filter(e => !e.inUse).length;

    if (available < this.config.minConnections) {
      const needed = this.config.minConnections - available;
      this.logger.debug(`Creating ${needed} connections to meet minimum`);

      const promises: Promise<void>[] = [];
      for (let i = 0; i < needed; i++) {
        promises.push(this.createConnection());
      }

      await Promise.all(promises);
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const inUse = this.pool.filter(e => e.inUse).length;
    const available = this.pool.length - inUse;

    return {
      total: this.pool.length,
      inUse,
      available,
      minConnections: this.config.minConnections,
      maxConnections: this.config.maxConnections,
      utilization: this.pool.length > 0 ? inUse / this.pool.length : 0
    };
  }

  /**
   * Close all connections and shutdown pool
   */
  async close(): Promise<void> {
    this.logger.info('Closing connection pool');

    // Clear timers
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Close all connections
    const promises: Promise<void>[] = [];
    for (const entry of this.pool) {
      if (this.destroyer) {
        promises.push(this.destroyer(entry.connection));
      }
    }

    await Promise.all(promises);
    this.pool = [];

    this.logger.info('Connection pool closed');
  }
}

/**
 * Supabase connection pool
 */
export class SupabaseConnectionPool extends ConnectionPool<any> {
  constructor(config: Partial<ConnectionPoolConfig> = {}) {
    super(
      async () => {
        // Import Supabase client dynamically
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
        return createClient(supabaseUrl, supabaseKey);
      },
      config,
      async (connection) => {
        // Validate connection by making a simple query
        try {
          const { error } = await connection.from('profiles').select('id').limit(1);
          return !error;
        } catch {
          return false;
        }
      },
      async (connection) => {
        // Supabase client doesn't need explicit cleanup
        // Just remove reference
      }
    );
  }
}

/**
 * Connection pool manager
 */
export class ConnectionPoolManager {
  private static pools: Map<string, ConnectionPool<any>> = new Map();
  private static logger = new Logger('ConnectionPoolManager');

  /**
   * Get or create a connection pool
   */
  static getPool<T>(
    name: string,
    connectionFactory: () => Promise<T>,
    config?: Partial<ConnectionPoolConfig>,
    validator?: (connection: T) => Promise<boolean>,
    destroyer?: (connection: T) => Promise<void>
  ): ConnectionPool<T> {
    if (!this.pools.has(name)) {
      this.logger.info(`Creating connection pool: ${name}`);
      const pool = new ConnectionPool(connectionFactory, config, validator, destroyer);
      this.pools.set(name, pool);
    }

    return this.pools.get(name) as ConnectionPool<T>;
  }

  /**
   * Get a pool by name
   */
  static getPoolByName<T>(name: string): ConnectionPool<T> | undefined {
    return this.pools.get(name) as ConnectionPool<T> | undefined;
  }

  /**
   * Close all pools
   */
  static async closeAll(): Promise<void> {
    this.logger.info('Closing all connection pools');

    const promises: Promise<void>[] = [];
    for (const pool of this.pools.values()) {
      promises.push(pool.close());
    }

    await Promise.all(promises);
    this.pools.clear();
  }

  /**
   * Get statistics for all pools
   */
  static getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [name, pool] of this.pools.entries()) {
      stats[name] = pool.getStats();
    }

    return stats;
  }
}
