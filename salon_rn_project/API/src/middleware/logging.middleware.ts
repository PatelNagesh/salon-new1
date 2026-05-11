import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../core/utils/logger.util';

const logger = new Logger('RequestLogger');

/**
 * Request logging middleware
 * Logs incoming requests with timing information
 */
export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const { method, path, ip, headers } = req;

  // Generate request ID
  const requestId = headers['x-request-id'] as string || generateRequestId();

  // Attach request ID to request
  (req as any).requestId = requestId;

  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    method,
    path,
    ip,
    userAgent: headers['user-agent'],
    contentType: headers['content-type'],
  });

  // Store original end method
  const originalEnd = res.end.bind(res);

  // Override end method to log response
  res.end = function (...args: any[]): void {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    // Log response
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]('Request completed', {
      requestId,
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
    });

    // Add response headers
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Response-Time', `${duration}ms`);

    return originalEnd(...args);
  };

  next();
};

/**
 * Error logging middleware
 * Logs errors with stack traces
 */
export const errorLoggingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req as any).requestId || 'unknown';

  logger.error('Request error', {
    requestId,
    method: req.method,
    path: req.path,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });

  next(err);
};

/**
 * Generate unique request ID
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Request timing middleware
 * Tracks slow requests
 */
export const requestTimingMiddleware = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    const originalEnd = res.end.bind(res);

    res.end = function (...args: any[]): void {
      const duration = Date.now() - startTime;

      if (duration > threshold) {
        logger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
        });
      }

      return originalEnd(...args);
    };

    next();
  };
};
