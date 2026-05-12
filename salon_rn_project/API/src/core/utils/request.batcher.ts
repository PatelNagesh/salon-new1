/**
 * Request batching utilities for optimizing API calls
 */

import { Logger } from '../utils/logger.util';

/**
 * Batch request item
 */
interface BatchRequest<T> {
  id: string;
  request: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  timestamp: number;
}

/**
 * Batch configuration
 */
export interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  maxConcurrentBatches: number;
}

/**
 * Request batcher for grouping similar requests
 */
export class RequestBatcher {
  private logger: Logger;
  private batches: Map<string, BatchRequest<any>[]>;
  private batchTimers: Map<string, NodeJS.Timeout>;
  private config: BatchConfig;
  private activeBatches: number;

  constructor(config: Partial<BatchConfig> = {}) {
    this.logger = new Logger('RequestBatcher');
    this.batches = new Map();
    this.batchTimers = new Map();
    this.activeBatches = 0;
    this.config = {
      maxBatchSize: 50,
      maxWaitTime: 100, // 100ms
      maxConcurrentBatches: 10,
      ...config
    };
  }

  /**
   * Add request to batch
   */
  async addRequest<T>(
    batchKey: string,
    request: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      const batchItem: BatchRequest<T> = {
        id: requestId,
        request,
        resolve: resolve as (value: any) => void,
        reject,
        timestamp: Date.now()
      };

      // Get or create batch
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }

      const batch = this.batches.get(batchKey)!;
      batch.push(batchItem);

      this.logger.debug(`Added request ${requestId} to batch ${batchKey} (size: ${batch.length})`);

      // Check if batch should be executed
      if (batch.length >= this.config.maxBatchSize) {
        this.executeBatch(batchKey);
      } else {
        // Set timer if not already set
        if (!this.batchTimers.has(batchKey)) {
          const timer = setTimeout(() => {
            this.executeBatch(batchKey);
          }, this.config.maxWaitTime);
          this.batchTimers.set(batchKey, timer);
        }
      }
    });
  }

  /**
   * Execute batch of requests
   */
  private async executeBatch(batchKey: string): Promise<void> {
    // Check if we can execute another batch
    if (this.activeBatches >= this.config.maxConcurrentBatches) {
      this.logger.debug(`Max concurrent batches reached, queuing batch ${batchKey}`);
      return;
    }

    // Clear timer
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }

    // Get batch
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }

    // Remove batch from map
    this.batches.delete(batchKey);
    this.activeBatches++;

    this.logger.info(`Executing batch ${batchKey} with ${batch.length} requests`);

    try {
      // Execute all requests in parallel
      const results = await Promise.allSettled(
        batch.map(item => item.request())
      );

      // Resolve/reject each request
      results.forEach((result, index) => {
        const item = batch[index];
        if (result.status === 'fulfilled') {
          item.resolve(result.value);
        } else {
          item.reject(result.reason);
        }
      });

      this.logger.info(`Batch ${batchKey} completed successfully`);
    } catch (error) {
      this.logger.error(`Batch ${batchKey} failed:`, error);

      // Reject all requests
      batch.forEach(item => {
        item.reject(error);
      });
    } finally {
      this.activeBatches--;
    }
  }

  /**
   * Force execute all pending batches
   */
  async flushAll(): Promise<void> {
    this.logger.info('Flushing all pending batches');

    const batchKeys = Array.from(this.batches.keys());
    await Promise.all(batchKeys.map(key => this.executeBatch(key)));
  }

  /**
   * Get batch statistics
   */
  getStats() {
    return {
      pendingBatches: this.batches.size,
      totalPendingRequests: Array.from(this.batches.values()).reduce(
        (sum, batch) => sum + batch.length,
        0
      ),
      activeBatches: this.activeBatches,
      maxConcurrentBatches: this.config.maxConcurrentBatches
    };
  }

  /**
   * Clear all pending batches
   */
  clear(): void {
    this.logger.info('Clearing all pending batches');

    // Clear all timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();

    // Reject all pending requests
    for (const [batchKey, batch] of this.batches.entries()) {
      batch.forEach(item => {
        item.reject(new Error('Batch cleared'));
      });
    }

    this.batches.clear();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Request deduplicator for preventing duplicate requests
 */
export class RequestDeduplicator {
  private logger: Logger;
  private pendingRequests: Map<string, Promise<any>>;

  constructor() {
    this.logger = new Logger('RequestDeduplicator');
    this.pendingRequests = new Map();
  }

  /**
   * Execute request with deduplication
   */
  async execute<T>(
    key: string,
    request: () => Promise<T>
  ): Promise<T> {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      this.logger.debug(`Request already pending: ${key}`);
      return this.pendingRequests.get(key)! as Promise<T>;
    }

    // Execute request
    const promise = request()
      .finally(() => {
        // Remove from pending after completion
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    this.logger.debug(`Executing request: ${key}`);

    return promise;
  }

  /**
   * Get pending request count
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.logger.info('Clearing all pending requests');
    this.pendingRequests.clear();
  }
}

/**
 * Request queue for managing request rate
 */
export class RequestQueue {
  private logger: Logger;
  private queue: Array<{ request: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void }>;
  private isProcessing: boolean;
  private maxConcurrent: number;
  private currentConcurrent: number;

  constructor(maxConcurrent: number = 10) {
    this.logger = new Logger('RequestQueue');
    this.queue = [];
    this.isProcessing = false;
    this.maxConcurrent = maxConcurrent;
    this.currentConcurrent = 0;
  }

  /**
   * Add request to queue
   */
  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve: resolve as (value: any) => void, reject });
      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) break;

      this.currentConcurrent++;

      item.request()
        .then(result => {
          item.resolve(result);
        })
        .catch(error => {
          item.reject(error);
        })
        .finally(() => {
          this.currentConcurrent--;
          this.processQueue();
        });
    }

    this.isProcessing = false;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      currentConcurrent: this.currentConcurrent,
      maxConcurrent: this.maxConcurrent
    };
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.logger.info('Clearing request queue');

    // Reject all queued requests
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });

    this.queue = [];
  }
}

/**
 * Request aggregator for combining multiple requests
 */
export class RequestAggregator {
  private logger: Logger;
  private aggregators: Map<string, {
    requests: Map<string, { resolve: (value: any) => void; reject: (error: any) => void }>;
    timer?: NodeJS.Timeout;
  }>;
  private aggregationTimeout: number;

  constructor(aggregationTimeout: number = 50) {
    this.logger = new Logger('RequestAggregator');
    this.aggregators = new Map();
    this.aggregationTimeout = aggregationTimeout;
  }

  /**
   * Add request to aggregator
   */
  async addRequest<T>(
    aggregatorKey: string,
    requestId: string,
    request: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Get or create aggregator
      if (!this.aggregators.has(aggregatorKey)) {
        this.aggregators.set(aggregatorKey, {
          requests: new Map()
        });
      }

      const aggregator = this.aggregators.get(aggregatorKey)!;
      aggregator.requests.set(requestId, { resolve: resolve as (value: any) => void, reject });

      this.logger.debug(`Added request ${requestId} to aggregator ${aggregatorKey}`);

      // Set timer if not already set
      if (!aggregator.timer) {
        aggregator.timer = setTimeout(() => {
          this.executeAggregator(aggregatorKey, request);
        }, this.aggregationTimeout);
      }
    });
  }

  /**
   * Execute aggregated requests
   */
  private async executeAggregator<T>(
    aggregatorKey: string,
    request: () => Promise<T>
  ): Promise<void> {
    const aggregator = this.aggregators.get(aggregatorKey);
    if (!aggregator) return;

    // Clear timer
    if (aggregator.timer) {
      clearTimeout(aggregator.timer);
    }

    // Remove aggregator
    this.aggregators.delete(aggregatorKey);

    this.logger.info(`Executing aggregator ${aggregatorKey} with ${aggregator.requests.size} requests`);

    try {
      // Execute request once
      const result = await request();

      // Resolve all requests with same result
      for (const [requestId, { resolve }] of aggregator.requests.entries()) {
        resolve(result);
      }

      this.logger.info(`Aggregator ${aggregatorKey} completed successfully`);
    } catch (error) {
      this.logger.error(`Aggregator ${aggregatorKey} failed:`, error);

      // Reject all requests
      for (const [requestId, { reject }] of aggregator.requests.entries()) {
        reject(error);
      }
    }
  }

  /**
   * Get aggregator statistics
   */
  getStats() {
    return {
      activeAggregators: this.aggregators.size,
      totalPendingRequests: Array.from(this.aggregators.values()).reduce(
        (sum, agg) => sum + agg.requests.size,
        0
      )
    };
  }

  /**
   * Clear all aggregators
   */
  clear(): void {
    this.logger.info('Clearing all aggregators');

    // Clear all timers
    for (const aggregator of this.aggregators.values()) {
      if (aggregator.timer) {
        clearTimeout(aggregator.timer);
      }
    }

    this.aggregators.clear();
  }
}

/**
 * Global request batcher instance
 */
export const requestBatcher = new RequestBatcher();

/**
 * Global request deduplicator instance
 */
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Global request queue instance
 */
export const requestQueue = new RequestQueue();

/**
 * Global request aggregator instance
 */
export const requestAggregator = new RequestAggregator();
