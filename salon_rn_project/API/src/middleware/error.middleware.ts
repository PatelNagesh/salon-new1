import { Request, Response, NextFunction } from 'express';
import { Logger } from '../core/utils/logger.util';
import { errorUtil } from '../core/utils/error.util';
import { BaseException } from '../exceptions/BaseException';
import { ErrorCodes, HttpStatus } from '../constants/error.constants';

/**
 * Error handling middleware
 */
export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger = new Logger('ErrorMiddleware');

  // Handle BaseException
  if (error instanceof BaseException) {
    logger.error('BaseException occurred:', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      details: error.details
    });

    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Handle standard Error
  if (error instanceof Error) {
    const errorInfo = errorUtil.handleError(error);

    logger.error('Error occurred:', {
      code: errorInfo.code,
      message: errorInfo.message,
      statusCode: errorInfo.statusCode,
      path: req.path,
      method: req.method,
      stack: error.stack
    });

    res.status(errorInfo.statusCode).json({
      success: false,
      error: {
        code: errorInfo.code,
        message: errorInfo.message,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle unknown error type
  logger.error('Unknown error type:', {
    error,
    path: req.path,
    method: req.method
  });

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ErrorCodes.SERVER_INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger = new Logger('NotFoundHandler');

  logger.warn('Resource not found:', {
    path: req.path,
    method: req.method
  });

  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    error: {
      code: ErrorCodes.NOT_FOUND_RESOURCE,
      message: `Cannot ${req.method} ${req.path}`,
      details: {
        path: req.path,
        method: req.method
      }
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Request logging middleware
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger = new Logger('RequestLogger');
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

/**
 * Request ID middleware
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.headers['x-request-id'] = req.headers['x-request-id'] ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('x-request-id', req.headers['x-request-id']);
  next();
};
