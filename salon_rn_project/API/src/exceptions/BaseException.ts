import { HttpStatus } from '../core/types/error.types';

/**
 * Base exception class for all custom exceptions
 */
export abstract class BaseException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(code: string, message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert exception to error response object
   */
  toJSON(): {
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
        code: this.code,
        message: this.message,
        details: this.details
      },
      timestamp: this.timestamp
    };
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.code.startsWith('AUTH_');
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.code.startsWith('VAL_');
  }

  /**
   * Check if this is a not found error
   */
  isNotFoundError(): boolean {
    return this.code.startsWith('NOT_FOUND_');
  }

  /**
   * Check if this is a conflict error
   */
  isConflictError(): boolean {
    return this.code.startsWith('CONFLICT_');
  }

  /**
   * Check if this is a forbidden error
   */
  isForbiddenError(): boolean {
    return this.code.startsWith('FORBIDDEN_');
  }

  /**
   * Check if this is a server error
   */
  isServerError(): boolean {
    return this.code.startsWith('SERVER_');
  }
}
