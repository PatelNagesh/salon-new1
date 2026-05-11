import { BaseException } from './BaseException';
import { HttpStatus, ErrorCodes } from '../core/types/error.types';

/**
 * Conflict exception
 */
export class ConflictException extends BaseException {
  constructor(
    message: string,
    details?: any
  ) {
    super(
      ErrorCodes.CONFLICT_DUPLICATE,
      message,
      HttpStatus.CONFLICT,
      details
    );
  }
}

/**
 * Duplicate resource exception
 */
export class DuplicateResourceException extends ConflictException {
  constructor(resourceType: string, identifier: string, details?: any) {
    super(
      `${resourceType} with identifier '${identifier}' already exists`,
      { resourceType, identifier, ...details }
    );
  }
}

/**
 * Concurrent modification exception
 */
export class ConcurrentModificationException extends ConflictException {
  constructor(resourceType: string, resourceId: string, details?: any) {
    super(
      `${resourceType} with ID ${resourceId} was modified by another user`,
      { resourceType, resourceId, ...details }
    );
  }
}

/**
 * State conflict exception
 */
export class StateConflictException extends ConflictException {
  constructor(resourceType: string, resourceId: string, currentState: string, requiredState: string, details?: any) {
    super(
      `${resourceType} with ID ${resourceId} is in state '${currentState}' but requires state '${requiredState}'`,
      { resourceType, resourceId, currentState, requiredState, ...details }
    );
  }
}
