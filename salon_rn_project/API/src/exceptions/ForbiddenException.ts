import { BaseException } from './BaseException';
import { HttpStatus, ErrorCodes } from '../core/types/error.types';

/**
 * Forbidden exception
 */
export class ForbiddenException extends BaseException {
  constructor(
    message: string,
    details?: any
  ) {
    super(
      ErrorCodes.FORBIDDEN_ACCESS_DENIED,
      message,
      HttpStatus.FORBIDDEN,
      details
    );
  }
}

/**
 * Access denied exception
 */
export class AccessDeniedException extends ForbiddenException {
  constructor(resource: string, details?: any) {
    super(
      `Access denied to ${resource}`,
      { resource, ...details }
    );
  }
}

/**
 * Resource ownership exception
 */
export class ResourceOwnershipException extends ForbiddenException {
  constructor(resourceType: string, resourceId: string, details?: any) {
    super(
      `You do not have permission to access this ${resourceType}`,
      { resourceType, resourceId, ...details }
    );
  }
}

/**
 * Insufficient role exception
 */
export class InsufficientRoleException extends ForbiddenException {
  constructor(requiredRole: string, currentRole: string, details?: any) {
    super(
      `Insufficient role. Required: ${requiredRole}, Current: ${currentRole}`,
      { requiredRole, currentRole, ...details }
    );
  }
}
