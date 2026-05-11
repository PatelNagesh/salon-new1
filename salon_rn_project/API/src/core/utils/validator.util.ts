import { Logger } from './logger.util';
import { ValidationException } from '../exceptions/ValidationException';

/**
 * Validation utility for input validation
 */
export class ValidatorUtil {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ValidatorUtil');
  }

  /**
   * Validate required field
   */
  validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ValidationException(
        `Field '${fieldName}' is required`,
        { field: fieldName }
      );
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string, fieldName: string = 'email'): void {
    this.validateRequired(email, fieldName);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException(
        `Invalid email format for field '${fieldName}'`,
        { field: fieldName, value: email }
      );
    }
  }

  /**
   * Validate phone number format
   */
  validatePhone(phone: string, fieldName: string = 'phone'): void {
    this.validateRequired(phone, fieldName);

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Check if it has at least 10 digits
    if (digits.length < 10) {
      throw new ValidationException(
        `Invalid phone number format for field '${fieldName}'`,
        { field: fieldName, value: phone }
      );
    }
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string, fieldName: string = 'url'): void {
    this.validateRequired(url, fieldName);

    try {
      new URL(url);
    } catch (error) {
      throw new ValidationException(
        `Invalid URL format for field '${fieldName}'`,
        { field: fieldName, value: url }
      );
    }
  }

  /**
   * Validate UUID format
   */
  validateUuid(uuid: string, fieldName: string = 'id'): void {
    this.validateRequired(uuid, fieldName);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      throw new ValidationException(
        `Invalid UUID format for field '${fieldName}'`,
        { field: fieldName, value: uuid }
      );
    }
  }

  /**
   * Validate string length
   */
  validateLength(
    value: string,
    fieldName: string,
    min: number,
    max: number
  ): void {
    this.validateRequired(value, fieldName);

    if (value.length < min || value.length > max) {
      throw new ValidationException(
        `Field '${fieldName}' must be between ${min} and ${max} characters`,
        { field: fieldName, length: value.length, min, max }
      );
    }
  }

  /**
   * Validate number range
   */
  validateRange(
    value: number,
    fieldName: string,
    min: number,
    max: number
  ): void {
    this.validateRequired(value, fieldName);

    if (value < min || value > max) {
      throw new ValidationException(
        `Field '${fieldName}' must be between ${min} and ${max}`,
        { field: fieldName, value, min, max }
      );
    }
  }

  /**
   * Validate minimum value
   */
  validateMin(value: number, fieldName: string, min: number): void {
    this.validateRequired(value, fieldName);

    if (value < min) {
      throw new ValidationException(
        `Field '${fieldName}' must be at least ${min}`,
        { field: fieldName, value, min }
      );
    }
  }

  /**
   * Validate maximum value
   */
  validateMax(value: number, fieldName: string, max: number): void {
    this.validateRequired(value, fieldName);

    if (value > max) {
      throw new ValidationException(
        `Field '${fieldName}' must be at most ${max}`,
        { field: fieldName, value, max }
      );
    }
  }

  /**
   * Validate date format
   */
  validateDate(date: string, fieldName: string = 'date'): void {
    this.validateRequired(date, fieldName);

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new ValidationException(
        `Invalid date format for field '${fieldName}'`,
        { field: fieldName, value: date }
      );
    }
  }

  /**
   * Validate date is in the future
   */
  validateFutureDate(date: string, fieldName: string = 'date'): void {
    this.validateDate(date, fieldName);

    const parsedDate = new Date(date);
    const now = new Date();

    if (parsedDate <= now) {
      throw new ValidationException(
        `Field '${fieldName}' must be in the future`,
        { field: fieldName, value: date }
      );
    }
  }

  /**
   * Validate date is in the past
   */
  validatePastDate(date: string, fieldName: string = 'date'): void {
    this.validateDate(date, fieldName);

    const parsedDate = new Date(date);
    const now = new Date();

    if (parsedDate >= now) {
      throw new ValidationException(
        `Field '${fieldName}' must be in the past`,
        { field: fieldName, value: date }
      );
    }
  }

  /**
   * Validate enum value
   */
  validateEnum(value: any, fieldName: string, allowedValues: any[]): void {
    this.validateRequired(value, fieldName);

    if (!allowedValues.includes(value)) {
      throw new ValidationException(
        `Field '${fieldName}' must be one of: ${allowedValues.join(', ')}`,
        { field: fieldName, value, allowedValues }
      );
    }
  }

  /**
   * Validate regex pattern
   */
  validatePattern(value: string, fieldName: string, pattern: RegExp, errorMessage?: string): void {
    this.validateRequired(value, fieldName);

    if (!pattern.test(value)) {
      throw new ValidationException(
        errorMessage || `Field '${fieldName}' does not match required pattern`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * Validate array
   */
  validateArray(value: any, fieldName: string): void {
    if (!Array.isArray(value)) {
      throw new ValidationException(
        `Field '${fieldName}' must be an array`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * Validate object
   */
  validateObject(value: any, fieldName: string): void {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ValidationException(
        `Field '${fieldName}' must be an object`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * Validate boolean
   */
  validateBoolean(value: any, fieldName: string): void {
    if (typeof value !== 'boolean') {
      throw new ValidationException(
        `Field '${fieldName}' must be a boolean`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * Validate number
   */
  validateNumber(value: any, fieldName: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationException(
        `Field '${fieldName}' must be a number`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * Validate integer
   */
  validateInteger(value: any, fieldName: string): void {
    this.validateNumber(value, fieldName);

    if (!Number.isInteger(value)) {
      throw new ValidationException(
        `Field '${fieldName}' must be an integer`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * Validate positive number
   */
  validatePositive(value: number, fieldName: string): void {
    this.validateNumber(value, fieldName);

    if (value <= 0) {
      throw new ValidationException(
        `Field '${fieldName}' must be positive`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * Validate non-negative number
   */
  validateNonNegative(value: number, fieldName: string): void {
    this.validateNumber(value, fieldName);

    if (value < 0) {
      throw new ValidationException(
        `Field '${fieldName}' must be non-negative`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * Validate multiple fields
   */
  validateFields(data: Record<string, any>, validations: Record<string, (value: any) => void>): void {
    const errors: Array<{ field: string; message: string }> = [];

    for (const [field, validation] of Object.entries(validations)) {
      try {
        validation(data[field]);
      } catch (error) {
        if (error instanceof ValidationException) {
          errors.push({ field, message: error.message });
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationException(
        'Validation failed for multiple fields',
        { errors }
      );
    }
  }

  /**
   * Sanitize string input
   */
  sanitizeString(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }

    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Sanitize number input
   */
  sanitizeNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Sanitize boolean input
   */
  sanitizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }

    return Boolean(value);
  }
}

/**
 * Global validator utility instance
 */
export const validatorUtil = new ValidatorUtil();
