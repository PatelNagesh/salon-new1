# Performance Optimization Guide

## Overview

This guide covers the performance optimization features implemented in the API layer, including caching strategies, query optimization, request batching, connection pooling, and performance testing.

## Table of Contents

1. [Caching Strategies](#caching-strategies)
2. [Query Optimization](#query-optimization)
3. [Request Batching](#request-batching)
4. [Connection Pooling](#connection-pooling)
5. [Performance Testing](#performance-testing)
6. [Best Practices](#best-practices)

## Caching Strategies

### Available Strategies

The API layer provides three caching strategies:

#### 1. LRU (Least Recently Used) Cache

Best for: General-purpose caching with access pattern optimization

```typescript
import { LRUCache } from './core/strategies';

const cache = new LRUCache(1000, 300); // maxSize, defaultTTL

await cache.set('user:123', userData);
const user = await cache.get('user:123');
```

#### 2. FIFO (First In First Out) Cache

Best for: Time-based data where order matters

```typescript
import { FIFOCache } from './core/strategies';

const cache = new FIFOCache(1000, 300);

await cache.set('log:entry', logData);
const log = await cache.get('log:entry');
```

#### 3. LFU (Least Frequently Used) Cache

Best for: Frequently accessed data

```typescript
import { LFUCache } from './core/strategies';

const cache = new LFUCache(1000, 300);

await cache.set('config:settings', settings);
const config = await cache.get('config:settings');
```

### Cache Configuration

Configure caching in `cache.config.ts`:

```typescript
export const cacheConfigs = {
  development: {
    enabled: true,
    defaultTTL: 300,
    maxSize: 100,
    strategy: 'lru'
  },
  production: {
    enabled: true,
    defaultTTL: 3600,
    maxSize: 1000,
    strategy: 'lru'
  }
};
```

### Cache Key Patterns

Use the cache key builders for consistent key generation:

```typescript
import {
  buildEntityCacheKey,
  buildListCacheKey,
  buildUserCacheKey
} from './config/cache.config';

// Entity cache
const key = buildEntityCacheKey('user', '123');

// List cache
const listKey = buildListCacheKey('services', { salonId: '456' });

// User-specific cache
const userKey = buildUserCacheKey('123', 'preferences');
```

## Query Optimization

### Query Optimizer

Optimize database queries with the `QueryOptimizer`:

```typescript
import { queryOptimizer } from './core/utils';

let query = 'SELECT * FROM users';

// Add index hint
query = queryOptimizer.optimizeWithIndex(query, 'idx_email');

// Add pagination
query = queryOptimizer.optimizeWithLimit(query, 20, 0);

// Select specific fields
query = queryOptimizer.optimizeWithFieldSelection(query, ['id', 'name', 'email']);

// Add sorting
query = queryOptimizer.optimizeWithSorting(query, 'created_at', 'DESC');

// Add filter
query = queryOptimizer.optimizeWithFilter(query, { status: 'active' });
```

### Batch Query Execution

Execute multiple queries efficiently:

```typescript
import { batchQueryExecutor } from './core/utils';

const queries = [
  { query: 'SELECT * FROM users WHERE id = $1', params: ['1'] },
  { query: 'SELECT * FROM users WHERE id = $1', params: ['2'] },
  { query: 'SELECT * FROM users WHERE id = $1', params: ['3'] }
];

const results = await batchQueryExecutor.executeBatch(
  queries,
  (query, params) => database.query(query, params)
);
```

### Query Caching

Cache query results:

```typescript
import { queryCacheManager } from './core/utils';

// Check cache first
const cached = queryCacheManager.get<User>('SELECT * FROM users WHERE id = $1', ['123']);

if (cached) {
  return cached;
}

// Execute query
const result = await database.query('SELECT * FROM users WHERE id = $1', ['123']);

// Cache result
queryCacheManager.set('SELECT * FROM users WHERE id = $1', ['123'], result, 300);
```

## Request Batching

### Request Batcher

Group similar requests together:

```typescript
import { requestBatcher } from './core/utils';

// Add requests to batch
const result1 = await requestBatcher.addRequest('users', () => fetchUser('1'));
const result2 = await requestBatcher.addRequest('users', () => fetchUser('2'));
const result3 = await requestBatcher.addRequest('users', () => fetchUser('3'));

// Requests are batched automatically
```

### Request Deduplication

Prevent duplicate requests:

```typescript
import { requestDeduplicator } from './core/utils';

// Multiple calls with same key will only execute once
const result1 = await requestDeduplicator.execute('user:123', () => fetchUser('123'));
const result2 = await requestDeduplicator.execute('user:123', () => fetchUser('123'));

// result1 and result2 are the same promise
```

### Request Queue

Control request rate:

```typescript
import { requestQueue } from './core/utils';

// Queue requests with max concurrency
const results = await Promise.all([
  requestQueue.add(() => fetchUser('1')),
  requestQueue.add(() => fetchUser('2')),
  requestQueue.add(() => fetchUser('3'))
]);
```

## Connection Pooling

### Connection Pool

Manage database connections efficiently:

```typescript
import { ConnectionPool } from './core/utils';

const pool = new ConnectionPool(
  async () => await createDatabaseConnection(),
  {
    minConnections: 2,
    maxConnections: 10,
    acquireTimeout: 30000,
    idleTimeout: 300000,
    maxLifetime: 3600000
  },
  async (connection) => await connection.ping(),
  async (connection) => await connection.close()
);

// Acquire connection
const connection = await pool.acquire();

try {
  // Use connection
  const result = await connection.query('SELECT * FROM users');
} finally {
  // Release connection
  await pool.release(connection);
}

// Get pool statistics
const stats = pool.getStats();
console.log(stats);
// { total: 10, inUse: 3, available: 7, utilization: 0.3 }
```

### Supabase Connection Pool

Pre-configured pool for Supabase:

```typescript
import { SupabaseConnectionPool } from './core/utils';

const pool = new SupabaseConnectionPool({
  minConnections: 2,
  maxConnections: 10
});

const client = await pool.acquire();
// Use client
await pool.release(client);
```

### Connection Pool Manager

Manage multiple connection pools:

```typescript
import { ConnectionPoolManager } from './core/utils';

// Get or create pool
const pool = ConnectionPoolManager.getPool(
  'database',
  async () => await createConnection(),
  { maxConnections: 10 }
);

// Get pool by name
const existingPool = ConnectionPoolManager.getPoolByName('database');

// Get all pool statistics
const allStats = ConnectionPoolManager.getAllStats();

// Close all pools
await ConnectionPoolManager.closeAll();
```

## Performance Testing

### Performance Monitor

Track operation performance:

```typescript
import { performanceMonitor } from './core/utils';

// Start monitoring
const stop = performanceMonitor.start('getUser', { userId: '123' });

try {
  const user = await fetchUser('123');
  stop();
} catch (error) {
  performanceMonitor.recordFailure('getUser', { userId: '123' });
}

// Get statistics
const stats = performanceMonitor.getStatistics('getUser');
console.log(stats);
// { count: 100, successCount: 95, averageDuration: 45, ... }
```

### Performance Test Runner

Run performance tests:

```typescript
import { performanceTestRunner } from './core/utils';

const result = await performanceTestRunner.runTest(
  'getUser',
  async () => await fetchUser('123'),
  100, // iterations
  10   // warmup iterations
);

console.log(result);
// {
//   name: 'getUser',
//   iterations: 100,
//   averageTime: 45.23,
//   minTime: 32.11,
//   maxTime: 89.45,
//   percentile95: 67.89,
//   percentile99: 78.34,
//   successRate: 0.98
// }
```

### Performance Profiler

Profile detailed performance:

```typescript
import { performanceProfiler } from './core/utils';

// Start profiling
performanceProfiler.startProfile('userFetch');

// Add samples
performanceProfiler.addSample('userFetch', 'databaseQuery');
const user = await database.query('SELECT * FROM users');

performanceProfiler.addSample('userFetch', 'dataTransform');
const transformed = transformData(user);

// Stop profiling
const result = performanceProfiler.stopProfile('userFetch');
console.log(result);
// {
//   name: 'userFetch',
//   duration: 123,
//   memoryUsage: { initial: 1024, final: 2048, delta: 1024 },
//   samples: [...]
// }
```

## Best Practices

### 1. Caching

- Use appropriate cache strategies based on access patterns
- Set appropriate TTL values based on data volatility
- Use cache key builders for consistency
- Invalidate cache when data changes

### 2. Query Optimization

- Always use LIMIT for list queries
- Select only required fields
- Use appropriate indexes
- Analyze query complexity before execution

### 3. Request Batching

- Batch similar requests together
- Use deduplication for identical requests
- Control request rate with queues
- Monitor batch statistics

### 4. Connection Pooling

- Configure appropriate pool sizes
- Use connection validation
- Monitor pool statistics
- Close pools when done

### 5. Performance Testing

- Run performance tests regularly
- Use warmup iterations
- Monitor memory usage
- Compare performance over time

## Performance Targets

### Response Time

- API endpoints: < 200ms (P95)
- Database queries: < 50ms (P95)
- Cache operations: < 5ms (P95)

### Resource Usage

- Memory: < 512MB per instance
- CPU: < 70% average utilization
- Connections: < 80% of pool capacity

### Success Rate

- API endpoints: > 99.9%
- Database queries: > 99.9%
- Cache operations: > 99.9%

## Monitoring

### Key Metrics

Monitor these metrics regularly:

1. **Response Time**: P50, P95, P99
2. **Throughput**: Requests per second
3. **Error Rate**: Failed requests percentage
4. **Cache Hit Rate**: Cache effectiveness
5. **Connection Pool Utilization**: Pool efficiency
6. **Memory Usage**: Memory consumption

### Alerts

Set up alerts for:

- Response time > 500ms (P95)
- Error rate > 1%
- Cache hit rate < 80%
- Connection pool utilization > 90%
- Memory usage > 80%

## Troubleshooting

### Slow Queries

1. Check query complexity
2. Verify index usage
3. Review query plan
4. Consider query optimization

### High Memory Usage

1. Check cache size
2. Review connection pool size
3. Profile memory usage
4. Check for memory leaks

### Low Cache Hit Rate

1. Review cache key patterns
2. Check TTL values
3. Verify cache invalidation
4. Analyze access patterns

### Connection Pool Exhaustion

1. Increase pool size
2. Check connection leaks
3. Review connection lifetime
4. Optimize connection usage
