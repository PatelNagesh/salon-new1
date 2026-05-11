import { BaseException } from './BaseException';
import { HttpStatus, ErrorCodes } from '../core/types/error.types';

/**
 * Not found exception
 */
export class NotFoundException extends BaseException {
  constructor(
    message: string,
    details?: any
  ) {
    super(
      ErrorCodes.NOT_FOUND_RESOURCE,
      message,
      HttpStatus.NOT_FOUND,
      details
    );
  }
}

/**
 * User not found exception
 */
export class UserNotFoundException extends NotFoundException {
  constructor(userId: string, details?: any) {
    super(
      `User with ID ${userId} not found`,
      { userId, ...details }
    );
  }
}

/**
 * Resource not found exception
 */
export class ResourceNotFoundException extends NotFoundException {
  constructor(resourceType: string, resourceId: string, details?: any) {
    super(
      `${resourceType} with ID ${resourceId} not found`,
      { resourceType, resourceId, ...details }
    );
  }
}

/**
 * Entity not found exception
 */
export class EntityNotFoundException extends NotFoundException {
  constructor(entityType: string, entityId: string, details?: any) {
    super(
      `${entityType} with ID ${entityId} not found`,
      { entityType, entityId, ...details }
    );
  }
}
