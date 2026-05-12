import { z } from 'zod';

/**
 * Base validator interface
 */
export interface IValidator<T> {
  validate(data: unknown): T;
  validateAsync(data: unknown): Promise<T>;
  safeParse(data: unknown): z.SafeParseReturnType<T, T>;
}

/**
 * Base validator class
 */
export abstract class BaseValidator<T> implements IValidator<T> {
  protected schema: z.ZodSchema<T>;

  constructor(schema: z.ZodSchema<T>) {
    this.schema = schema;
  }

  validate(data: unknown): T {
    return this.schema.parse(data);
  }

  async validateAsync(data: unknown): Promise<T> {
    return this.schema.parseAsync(data);
  }

  safeParse(data: unknown): z.SafeParseReturnType<T, T> {
    return this.schema.safeParse(data);
  }
}

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
}

/**
 * Create validation result from Zod result
 */
export function createValidationResult<T>(
  result: z.SafeParseReturnType<T, T>
): ValidationResult<T> {
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error,
  };
}

/**
 * Format validation errors
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path ? path + ': ' : ''}${err.message}`;
  });
}

/**
 * Validate multiple schemas
 */
export function validateMultiple<T extends Record<string, z.ZodSchema<any>>>(
  schemas: T,
  data: Record<string, unknown>
): Record<keyof T, ValidationResult<any>> {
  const results: Record<keyof T, ValidationResult<any>> = {} as any;

  for (const [key, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(data[key]);
    results[key as keyof T] = createValidationResult(result);
  }

  return results;
}

/**
 * Check if all validations passed
 */
export function allValidationsPassed<T>(
  results: Record<keyof T, ValidationResult<any>>
): boolean {
  return Object.values(results).every((result) => result.success);
}
