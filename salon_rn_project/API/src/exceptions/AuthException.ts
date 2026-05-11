import { BaseException } from './BaseException';
import { HttpStatus, ErrorCodes } from '../core/types/error.types';

/**
 * Authentication exception
 */
export class AuthException extends BaseException {
  constructor(
    code: string,
    message: string,
    details?: any
  ) {
    super(code, message, HttpStatus.UNAUTHORIZED, details);
  }
}

/**
 * Invalid credentials exception
 */
export class InvalidCredentialsException extends AuthException {
  constructor(details?: any) {
    super(
      ErrorCodes.AUTH_INVALID_CREDENTIALS,
      'Invalid credentials provided',
      details
    );
  }
}

/**
 * Token expired exception
 */
export class TokenExpiredException extends AuthException {
  constructor(details?: any) {
    super(
      ErrorCodes.AUTH_TOKEN_EXPIRED,
      'Authentication token has expired',
      details
    );
  }
}

/**
 * Token invalid exception
 */
export class TokenInvalidException extends AuthException {
  constructor(details?: any) {
    super(
      ErrorCodes.AUTH_TOKEN_INVALID,
      'Invalid authentication token',
      details
    );
  }
}

/**
 * Insufficient permissions exception
 */
export class InsufficientPermissionsException extends AuthException {
  constructor(requiredPermission?: string, details?: any) {
    super(
      ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS,
      requiredPermission
        ? `Insufficient permissions. Required: ${requiredPermission}`
        : 'Insufficient permissions to perform this action',
      { requiredPermission, ...details }
    );
  }
}

/**
 * Session expired exception
 */
export class SessionExpiredException extends AuthException {
  constructor(details?: any) {
    super(
      ErrorCodes.AUTH_SESSION_EXPIRED,
      'Session has expired, please login again',
      details
    );
  }
}
