import { BaseException } from './BaseException';
import { HttpStatus, ErrorCodes } from '../core/types/error.types';

/**
 * Validation exception
 */
export class ValidationException extends BaseException {
  constructor(
    message: string,
    details?: any
  ) {
    super(
      ErrorCodes.VAL_INVALID_INPUT,
      message,
      HttpStatus.BAD_REQUEST,
      details
    );
  }
}

/**
 * Missing field exception
 */
export class MissingFieldException extends ValidationException {
  constructor(field: string, details?: any) {
    super(
      `Required field '${field}' is missing`,
      { field, ...details }
    );
  }
}

/**
 * Invalid format exception
 */
export class InvalidFormatException extends ValidationException {
  constructor(field: string, value: any, details?: any) {
    super(
      `Invalid format for field '${field}'`,
      { field, value, ...details }
    );
  }
}

/**
 * Invalid length exception
 */
export class InvalidLengthException extends ValidationException {
  constructor(field: string, length: number, min: number, max: number, details?: any) {
    super(
      `Field '${field}' must be between ${min} and ${max} characters`,
      { field, length, min, max, ...details }
    );
  }
}

/**
 * Invalid value exception
 */
export class InvalidValueException extends ValidationException {
  constructor(field: string, value: any, allowedValues: any[], details?: any) {
    super(
      `Field '${field}' must be one of: ${allowedValues.join(', ')}`,
      { field, value, allowedValues, ...details }
    );
  }
}
