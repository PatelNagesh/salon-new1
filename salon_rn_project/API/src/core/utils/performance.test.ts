/**
 * Performance testing and monitoring utilities
 */

import { Logger } from '../utils/logger.util';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Performance test result
 */
export interface PerformanceTestResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  percentile95: number;
  percentile99: number;
  successRate: number;
  memoryUsage?: {
    initial: number;
    final: number;
    delta: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Performance monitor for tracking operations
 */
export class PerformanceMonitor {
  private logger: Logger;
  private metrics: PerformanceMetrics[];
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.logger = new Logger('PerformanceMonitor');
    this.metrics = [];
    this.enabled = enabled;
  }

  /**
   * Start monitoring an operation
   */
  start(operation: string, metadata?: Record<string, any>): () => void {
    if (!this.enabled) {
      return () => {};
    }

    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    return () => {
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      const duration = endTime - startTime;

      const metric: PerformanceMetrics = {
        operation,
        duration,
        timestamp: endTime,
        success: true,
        memoryUsage: {
          heapUsed: endMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
          external: endMemory.external
        },
        metadata
      };

      this.metrics.push(metric);
      this.logger.debug(`Operation ${operation} completed in ${duration}ms`);
    };
  }

  /**
   * Record a failed operation
   */
  recordFailure(operation: string, metadata?: Record<string, any>): void {
    if (!this.enabled) {
      return;
    }

    const metric: PerformanceMetrics = {
      operation,
      duration: 0,
      timestamp: Date.now(),
      success: false,
      metadata
    };

    this.metrics.push(metric);
    this.logger.warn(`Operation ${operation} failed`);
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(operation: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get statistics for an operation
   */
  getStatistics(operation: string): PerformanceStatistics {
    const metrics = this.getMetrics(operation);

    if (metrics.length === 0) {
      return {
        count: 0,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalDuration: 0
      };
    }

    const successfulMetrics = metrics.filter(m => m.success);
    const durations = successfulMetrics.map(m => m.duration);

    return {
      count: metrics.length,
      successCount: successfulMetrics.length,
      failureCount: metrics.length - successfulMetrics.length,
      successRate: successfulMetrics.length / metrics.length,
      averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      minDuration: durations.length > 0 ? Math.min(...durations) : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
      totalDuration: durations.reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.logger.info('Performance metrics cleared');
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.logger.info(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }
}

/**
 * Performance statistics
 */
export interface PerformanceStatistics {
  count: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
}

/**
 * Performance test runner
 */
export class PerformanceTestRunner {
  private logger: Logger;
  private monitor: PerformanceMonitor;

  constructor() {
    this.logger = new Logger('PerformanceTestRunner');
    this.monitor = new PerformanceMonitor();
  }

  /**
   * Run a performance test
   */
  async runTest(
    name: string,
    operation: () => Promise<any>,
    iterations: number = 100,
    warmupIterations: number = 10
  ): Promise<PerformanceTestResult> {
    this.logger.info(`Starting performance test: ${name} (${iterations} iterations)`);

    // Warmup
    this.logger.info(`Running ${warmupIterations} warmup iterations`);
    for (let i = 0; i < warmupIterations; i++) {
      try {
        await operation();
      } catch (error) {
        this.logger.warn(`Warmup iteration ${i + 1} failed:`, error);
      }
    }

    // Clear metrics after warmup
    this.monitor.clear();

    // Get initial memory
    const initialMemory = process.memoryUsage().heapUsed;

    // Run test iterations
    const durations: number[] = [];
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const stop = this.monitor.start(name);

      try {
        await operation();
        stop();
        durations.push(this.monitor.getMetrics(name)[i].duration);
        successCount++;
      } catch (error) {
        this.monitor.recordFailure(name);
        this.logger.warn(`Iteration ${i + 1} failed:`, error);
      }
    }

    // Get final memory
    const finalMemory = process.memoryUsage().heapUsed;

    // Calculate statistics
    const sortedDurations = durations.sort((a, b) => a - b);
    const totalTime = durations.reduce((a, b) => a + b, 0);
    const averageTime = totalTime / durations.length;
    const minTime = sortedDurations[0] || 0;
    const maxTime = sortedDurations[sortedDurations.length - 1] || 0;
    const percentile95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)] || 0;
    const percentile99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)] || 0;

    const result: PerformanceTestResult = {
      name,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      percentile95,
      percentile99,
      successRate: successCount / iterations,
      memoryUsage: {
        initial: initialMemory,
        final: finalMemory,
        delta: finalMemory - initialMemory
      }
    };

    this.logger.info(`Performance test completed: ${name}`);
    this.logger.info(`  Average: ${averageTime.toFixed(2)}ms`);
    this.logger.info(`  Min: ${minTime.toFixed(2)}ms`);
    this.logger.info(`  Max: ${maxTime.toFixed(2)}ms`);
    this.logger.info(`  P95: ${percentile95.toFixed(2)}ms`);
    this.logger.info(`  P99: ${percentile99.toFixed(2)}ms`);
    this.logger.info(`  Success Rate: ${(result.successRate * 100).toFixed(2)}%`);
    this.logger.info(`  Memory Delta: ${((finalMemory - initialMemory) / 1024 / 1024).toFixed(2)}MB`);

    return result;
  }

  /**
   * Run multiple performance tests
   */
  async runMultipleTests(
    tests: Array<{
      name: string;
      operation: () => Promise<any>;
      iterations?: number;
      warmupIterations?: number;
    }>
  ): Promise<PerformanceTestResult[]> {
    this.logger.info(`Running ${tests.length} performance tests`);

    const results: PerformanceTestResult[] = [];

    for (const test of tests) {
      const result = await this.runTest(
        test.name,
        test.operation,
        test.iterations || 100,
        test.warmupIterations || 10
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Compare two performance tests
   */
  compareTests(test1: PerformanceTestResult, test2: PerformanceTestResult): PerformanceComparison {
    const avgDiff = test2.averageTime - test1.averageTime;
    const avgDiffPercent = (avgDiff / test1.averageTime) * 100;

    const p95Diff = test2.percentile95 - test1.percentile95;
    const p95DiffPercent = (p95Diff / test1.percentile95) * 100;

    return {
      test1Name: test1.name,
      test2Name: test2.name,
      averageTime: {
        test1: test1.averageTime,
        test2: test2.averageTime,
        difference: avgDiff,
        differencePercent: avgDiffPercent
      },
      percentile95: {
        test1: test1.percentile95,
        test2: test2.percentile95,
        difference: p95Diff,
        differencePercent: p95DiffPercent
      },
      faster: avgDiff < 0 ? test2.name : test1.name,
      speedup: Math.abs(avgDiffPercent)
    };
  }

  /**
   * Get performance monitor
   */
  getMonitor(): PerformanceMonitor {
    return this.monitor;
  }
}

/**
 * Performance comparison result
 */
export interface PerformanceComparison {
  test1Name: string;
  test2Name: string;
  averageTime: {
    test1: number;
    test2: number;
    difference: number;
    differencePercent: number;
  };
  percentile95: {
    test1: number;
    test2: number;
    difference: number;
    differencePercent: number;
  };
  faster: string;
  speedup: number;
}

/**
 * Performance profiler for detailed analysis
 */
export class PerformanceProfiler {
  private logger: Logger;
  private profiles: Map<string, ProfileData>;

  constructor() {
    this.logger = new Logger('PerformanceProfiler');
    this.profiles = new Map();
  }

  /**
   * Start profiling
   */
  startProfile(name: string): void {
    this.profiles.set(name, {
      name,
      startTime: Date.now(),
      startMemory: process.memoryUsage(),
      samples: []
    });

    this.logger.debug(`Started profiling: ${name}`);
  }

  /**
   * Add sample to profile
   */
  addSample(name: string, label: string, metadata?: Record<string, any>): void {
    const profile = this.profiles.get(name);
    if (!profile) {
      this.logger.warn(`Profile not found: ${name}`);
      return;
    }

    profile.samples.push({
      timestamp: Date.now(),
      label,
      memory: process.memoryUsage(),
      metadata
    });
  }

  /**
   * Stop profiling and get results
   */
  stopProfile(name: string): ProfileResult | null {
    const profile = this.profiles.get(name);
    if (!profile) {
      this.logger.warn(`Profile not found: ${name}`);
      return null;
    }

    const endTime = Date.now();
    const endMemory = process.memoryUsage();

    const result: ProfileResult = {
      name: profile.name,
      duration: endTime - profile.startTime,
      memoryUsage: {
        initial: profile.startMemory.heapUsed,
        final: endMemory.heapUsed,
        delta: endMemory.heapUsed - profile.startMemory.heapUsed
      },
      samples: profile.samples,
      sampleCount: profile.samples.length
    };

    this.profiles.delete(name);
    this.logger.info(`Stopped profiling: ${name} (${result.duration}ms)`);

    return result;
  }

  /**
   * Get all active profiles
   */
  getActiveProfiles(): string[] {
    return Array.from(this.profiles.keys());
  }
}

/**
 * Profile data
 */
interface ProfileData {
  name: string;
  startTime: number;
  startMemory: NodeJS.MemoryUsage;
  samples: ProfileSample[];
}

/**
 * Profile sample
 */
interface ProfileSample {
  timestamp: number;
  label: string;
  memory: NodeJS.MemoryUsage;
  metadata?: Record<string, any>;
}

/**
 * Profile result
 */
export interface ProfileResult {
  name: string;
  duration: number;
  memoryUsage: {
    initial: number;
    final: number;
    delta: number;
  };
  samples: ProfileSample[];
  sampleCount: number;
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Global performance test runner instance
 */
export const performanceTestRunner = new PerformanceTestRunner();

/**
 * Global performance profiler instance
 */
export const performanceProfiler = new PerformanceProfiler();
