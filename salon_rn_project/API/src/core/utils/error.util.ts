import { Logger } from './logger.util';
import { BaseException } from '../exceptions/BaseException';
import { ErrorCodes, ErrorMessages, HttpStatus } from '../types/error.types';

/**
 * Error utility for error handling and formatting
 */
export class ErrorUtil {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ErrorUtil');
  }

  /**
   * Handle error and return formatted error response
   */
  handleError(error: any): {
    code: string;
    message: string;
    details?: any;
    statusCode: number;
  } {
    // If it's a BaseException, use its properties
    if (error instanceof BaseException) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        statusCode: error.statusCode
      };
    }

    // If it's a standard Error
    if (error instanceof Error) {
      this.logger.error('Unhandled error:', error);

      return {
        code: ErrorCodes.SERVER_INTERNAL_ERROR,
        message: ErrorMessages[ErrorCodes.SERVER_INTERNAL_ERROR],
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      };
    }

    // Unknown error type
    this.logger.error('Unknown error type:', error);

    return {
      code: ErrorCodes.SERVER_INTERNAL_ERROR,
      message: ErrorMessages[ErrorCodes.SERVER_INTERNAL_ERROR],
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    };
  }

  /**
   * Create error response object
   */
  createErrorResponse(code: string, message: string, details?: any): {
    success: false;
    error: {
      code: string;
      message: string;
      details?: any;
    };
    timestamp: string;
  } {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get HTTP status code for error code
   */
  getStatusCode(errorCode: string): number {
    const statusMap: Record<string, number> = {
      // Authentication errors
      [ErrorCodes.AUTH_INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
      [ErrorCodes.AUTH_TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
      [ErrorCodes.AUTH_TOKEN_INVALID]: HttpStatus.UNAUTHORIZED,
      [ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS]: HttpStatus.FORBIDDEN,
      [ErrorCodes.AUTH_SESSION_EXPIRED]: HttpStatus.UNAUTHORIZED,

      // Validation errors
      [ErrorCodes.VAL_INVALID_INPUT]: HttpStatus.BAD_REQUEST,
      [ErrorCodes.VAL_MISSING_FIELD]: HttpStatus.BAD_REQUEST,
      [ErrorCodes.VAL_INVALID_FORMAT]: HttpStatus.BAD_REQUEST,
      [ErrorCodes.VAL_INVALID_LENGTH]: HttpStatus.BAD_REQUEST,
      [ErrorCodes.VAL_INVALID_VALUE]: HttpStatus.BAD_REQUEST,

      // Not found errors
      [ErrorCodes.NOT_FOUND_USER]: HttpStatus.NOT_FOUND,
      [ErrorCodes.NOT_FOUND_RESOURCE]: HttpStatus.NOT_FOUND,
      [ErrorCodes.NOT_FOUND_ENTITY]: HttpStatus.NOT_FOUND,

      // Conflict errors
      [ErrorCodes.CONFLICT_DUPLICATE]: HttpStatus.CONFLICT,
      [ErrorCodes.CONCURRENT_MODIFICATION]: HttpStatus.CONFLICT,
      [ErrorCodes.STATE_CONFLICT]: HttpStatus.CONFLICT,

      // Forbidden errors
      [ErrorCodes.FORBIDDEN_ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [ErrorCodes.FORBIDDEN_RESOURCE_OWNERSHIP]: HttpStatus.FORBIDDEN,
      [ErrorCodes.FORBIDDEN_INSUFFICIENT_ROLE]: HttpStatus.FORBIDDEN,

      // Server errors
      [ErrorCodes.SERVER_INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ErrorCodes.SERVER_DATABASE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ErrorCodes.SERVER_EXTERNAL_SERVICE_ERROR]: HttpStatus.BAD_GATEWAY,
      [ErrorCodes.SERVER_TIMEOUT]: HttpStatus.GATEWAY_TIMEOUT,

      // Rate limit errors
      [ErrorCodes.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS
    };

    return statusMap[errorCode] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Check if error is a specific type
   */
  isAuthError(error: any): boolean {
    return error.code?.startsWith('AUTH_');
  }

  isValidationError(error: any): boolean {
    return error.code?.startsWith('VAL_');
  }

  isNotFoundError(error: any): boolean {
    return error.code?.startsWith('NOT_FOUND_');
  }

  isConflictError(error: any): boolean {
    return error.code?.startsWith('CONFLICT_');
  }

  isForbiddenError(error: any): boolean {
    return error.code?.startsWith('FORBIDDEN_');
  }

  isServerError(error: any): boolean {
    return error.code?.startsWith('SERVER_');
  }

  /**
   * Log error with context
   */
  logError(error: any, context?: Record<string, any>): void {
    const errorInfo = this.handleError(error);

    this.logger.error('Error occurred:', {
      code: errorInfo.code,
      message: errorInfo.message,
      statusCode: errorInfo.statusCode,
      details: errorInfo.details,
      context
    });
  }

  /**
   * Format error for client
   */
  formatForClient(error: any): {
    code: string;
    message: string;
    details?: any;
  } {
    const errorInfo = this.handleError(error);

    // Remove sensitive information in production
    if (process.env.NODE_ENV === 'production') {
      delete errorInfo.details;
    }

    return {
      code: errorInfo.code,
      message: errorInfo.message,
      details: errorInfo.details
    };
  }

  /**
   * Wrap async function with error handling
   */
  async wrapAsync<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<{ data?: T; error?: any }> {
    try {
      const data = await fn();
      return { data };
    } catch (error) {
      this.logError(error, context);
      return { error: this.handleError(error) };
    }
  }

  /**
   * Create error from error code
   */
  fromCode(code: string, details?: any): {
    code: string;
    message: string;
    details?: any;
    statusCode: number;
  } {
    return {
      code,
      message: ErrorMessages[code] || 'An error occurred',
      details,
      statusCode: this.getStatusCode(code)
    };
  }
}

/**
 * Global error utility instance
 */
export const errorUtil = new ErrorUtil();
