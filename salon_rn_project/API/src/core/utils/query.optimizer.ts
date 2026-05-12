/**
 * Database query optimization utilities
 */

import { Logger } from '../utils/logger.util';

/**
 * Query optimization options
 */
export interface QueryOptimizationOptions {
  enableIndexHints?: boolean;
  enableQueryCaching?: boolean;
  enableBatching?: boolean;
  maxBatchSize?: number;
  enablePagination?: boolean;
  defaultPageSize?: number;
  enableFieldSelection?: boolean;
  enableSorting?: boolean;
}

/**
 * Query builder for optimized queries
 */
export class QueryOptimizer {
  private logger: Logger;
  private options: QueryOptimizationOptions;

  constructor(options: QueryOptimizationOptions = {}) {
    this.logger = new Logger('QueryOptimizer');
    this.options = {
      enableIndexHints: true,
      enableQueryCaching: true,
      enableBatching: true,
      maxBatchSize: 100,
      enablePagination: true,
      defaultPageSize: 20,
      enableFieldSelection: true,
      enableSorting: true,
      ...options
    };
  }

  /**
   * Optimize a query by adding index hints
   */
  optimizeWithIndex(query: string, indexName: string): string {
    if (!this.options.enableIndexHints) {
      return query;
    }

    this.logger.debug(`Adding index hint: ${indexName}`);
    return query.replace(/FROM\s+(\w+)/i, `FROM $1 USE INDEX (${indexName})`);
  }

  /**
   * Optimize query by adding LIMIT clause
   */
  optimizeWithLimit(query: string, limit: number, offset?: number): string {
    if (!this.options.enablePagination) {
      return query;
    }

    let optimized = query;

    if (offset !== undefined) {
      optimized += ` LIMIT ${limit} OFFSET ${offset}`;
    } else {
      optimized += ` LIMIT ${limit}`;
    }

    this.logger.debug(`Adding pagination: LIMIT ${limit}${offset ? ` OFFSET ${offset}` : ''}`);
    return optimized;
  }

  /**
   * Optimize query by selecting only specific fields
   */
  optimizeWithFieldSelection(query: string, fields: string[]): string {
    if (!this.options.enableFieldSelection || fields.length === 0) {
      return query;
    }

    const fieldList = fields.join(', ');
    this.logger.debug(`Optimizing field selection: ${fieldList}`);
    return query.replace(/SELECT\s+\*/i, `SELECT ${fieldList}`);
  }

  /**
   * Optimize query by adding ORDER BY clause
   */
  optimizeWithSorting(query: string, sortBy: string, sortOrder: 'ASC' | 'DESC' = 'ASC'): string {
    if (!this.options.enableSorting) {
      return query;
    }

    this.logger.debug(`Adding sorting: ${sortBy} ${sortOrder}`);
    return query + ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  /**
   * Optimize query by adding WHERE clause
   */
  optimizeWithFilter(query: string, conditions: Record<string, any>): string {
    const whereClauses: string[] = [];

    for (const [field, value] of Object.entries(conditions)) {
      if (value === null) {
        whereClauses.push(`${field} IS NULL`);
      } else if (Array.isArray(value)) {
        whereClauses.push(`${field} IN (${value.map(v => `'${v}'`).join(', ')})`);
      } else if (typeof value === 'string' && value.includes('%')) {
        whereClauses.push(`${field} LIKE '${value}'`);
      } else {
        whereClauses.push(`${field} = '${value}'`);
      }
    }

    if (whereClauses.length === 0) {
      return query;
    }

    const whereClause = whereClauses.join(' AND ');
    this.logger.debug(`Adding filter: ${whereClause}`);

    if (query.toUpperCase().includes('WHERE')) {
      return query.replace(/WHERE/i, `WHERE ${whereClause} AND`);
    }

    return query + ` WHERE ${whereClause}`;
  }

  /**
   * Analyze query for potential optimizations
   */
  analyzeQuery(query: string): QueryAnalysis {
    const analysis: QueryAnalysis = {
      originalQuery: query,
      hasSelectAll: query.includes('SELECT *'),
      hasLimit: query.includes('LIMIT'),
      hasOffset: query.includes('OFFSET'),
      hasOrderBy: query.includes('ORDER BY'),
      hasWhere: query.includes('WHERE'),
      hasJoin: query.includes('JOIN'),
      hasSubquery: query.includes('(') && query.includes(')'),
      estimatedComplexity: this.estimateComplexity(query),
      suggestions: []
    };

    // Generate suggestions
    if (analysis.hasSelectAll) {
      analysis.suggestions.push('Consider selecting only required fields instead of SELECT *');
    }

    if (!analysis.hasLimit) {
      analysis.suggestions.push('Add LIMIT clause to prevent large result sets');
    }

    if (analysis.hasJoin && !analysis.hasWhere) {
      analysis.suggestions.push('Add WHERE clause to filter JOIN results');
    }

    if (analysis.estimatedComplexity === 'high') {
      analysis.suggestions.push('Consider breaking down complex queries or using views');
    }

    return analysis;
  }

  /**
   * Estimate query complexity
   */
  private estimateComplexity(query: string): 'low' | 'medium' | 'high' {
    const upperQuery = query.toUpperCase();
    let complexity = 0;

    // Count joins
    const joinCount = (upperQuery.match(/JOIN/g) || []).length;
    complexity += joinCount * 2;

    // Count subqueries
    const subqueryCount = (upperQuery.match(/\(/g) || []).length;
    complexity += subqueryCount;

    // Check for complex operations
    if (upperQuery.includes('GROUP BY')) complexity += 2;
    if (upperQuery.includes('HAVING')) complexity += 2;
    if (upperQuery.includes('UNION')) complexity += 3;
    if (upperQuery.includes('DISTINCT')) complexity += 1;

    if (complexity <= 2) return 'low';
    if (complexity <= 5) return 'medium';
    return 'high';
  }
}

/**
 * Query analysis result
 */
export interface QueryAnalysis {
  originalQuery: string;
  hasSelectAll: boolean;
  hasLimit: boolean;
  hasOffset: boolean;
  hasOrderBy: boolean;
  hasWhere: boolean;
  hasJoin: boolean;
  hasSubquery: boolean;
  estimatedComplexity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

/**
 * Batch query executor
 */
export class BatchQueryExecutor {
  private logger: Logger;
  private maxBatchSize: number;

  constructor(maxBatchSize: number = 100) {
    this.logger = new Logger('BatchQueryExecutor');
    this.maxBatchSize = maxBatchSize;
  }

  /**
   * Execute queries in batches
   */
  async executeBatch<T>(
    queries: Array<{ query: string; params?: any[] }>,
    executor: (query: string, params?: any[]) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];
    const batches = this.createBatches(queries);

    this.logger.info(`Executing ${queries.length} queries in ${batches.length} batches`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.debug(`Executing batch ${i + 1}/${batches.length} (${batch.length} queries)`);

      const batchResults = await Promise.all(
        batch.map(({ query, params }) => executor(query, params))
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Create batches from queries
   */
  private createBatches<T>(
    queries: Array<{ query: string; params?: any[] }>
  ): Array<Array<{ query: string; params?: any[] }>> {
    const batches: Array<Array<{ query: string; params?: any[] }>> = [];

    for (let i = 0; i < queries.length; i += this.maxBatchSize) {
      batches.push(queries.slice(i, i + this.maxBatchSize));
    }

    return batches;
  }

  /**
   * Execute single query with multiple parameter sets
   */
  async executeWithMultipleParams<T>(
    query: string,
    paramsList: any[][],
    executor: (query: string, params: any[]) => Promise<T>
  ): Promise<T[]> {
    this.logger.info(`Executing query with ${paramsList.length} parameter sets`);

    const queries = paramsList.map(params => ({ query, params }));
    return this.executeBatch(queries, executor);
  }
}

/**
 * Query cache manager
 */
export class QueryCacheManager {
  private cache: Map<string, { result: any; timestamp: number; ttl: number }>;
  private logger: Logger;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300) {
    this.cache = new Map();
    this.logger = new Logger('QueryCacheManager');
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached query result
   */
  get<T>(query: string, params?: any[]): T | null {
    const cacheKey = this.buildCacheKey(query, params);
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    if (this.isExpired(cached)) {
      this.cache.delete(cacheKey);
      this.logger.debug(`Query cache expired: ${cacheKey}`);
      return null;
    }

    this.logger.debug(`Query cache hit: ${cacheKey}`);
    return cached.result as T;
  }

  /**
   * Set query result in cache
   */
  set<T>(query: string, params: any[] | undefined, result: T, ttl?: number): void {
    const cacheKey = this.buildCacheKey(query, params);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
    this.logger.debug(`Query cache set: ${cacheKey}`);
  }

  /**
   * Invalidate cache for a query pattern
   */
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.logger.info(`Invalidated ${count} cached queries matching pattern: ${pattern}`);
  }

  /**
   * Clear all cached queries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.info(`Cleared ${size} cached queries`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate()
    };
  }

  private buildCacheKey(query: string, params?: any[]): string {
    const normalizedQuery = query.trim().replace(/\s+/g, ' ');
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${normalizedQuery}:${paramsStr}`;
  }

  private isExpired(cached: { result: any; timestamp: number; ttl: number }): boolean {
    return Date.now() > cached.timestamp + cached.ttl * 1000;
  }

  private calculateHitRate(): number {
    // This would need to track hits/misses in a real implementation
    return 0;
  }
}

/**
 * Global query optimizer instance
 */
export const queryOptimizer = new QueryOptimizer();

/**
 * Global batch query executor instance
 */
export const batchQueryExecutor = new BatchQueryExecutor();

/**
 * Global query cache manager instance
 */
export const queryCacheManager = new QueryCacheManager();
