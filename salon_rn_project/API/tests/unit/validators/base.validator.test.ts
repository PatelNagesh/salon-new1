import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  BaseValidator,
  IValidator,
  createValidationResult,
  formatValidationErrors,
  validateMultiple,
  allValidationsPassed,
} from '../base.validator';

describe('BaseValidator', () => {
  it('should implement IValidator interface', () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(0),
    });

    const validator = new BaseValidator(schema);
    expect(validator).toBeInstanceOf(BaseValidator);
    expect(validator).toHaveProperty('validate');
    expect(validator).toHaveProperty('validateAsync');
    expect(validator).toHaveProperty('safeParse');
  });

  it('should validate valid data', () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(0),
    });

    const validator = new BaseValidator(schema);
    const data = { name: 'John', age: 30 };

    const result = validator.validate(data);
    expect(result).toEqual(data);
  });

  it('should throw on invalid data', () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(0),
    });

    const validator = new BaseValidator(schema);
    const data = { name: 'J', age: -5 };

    expect(() => validator.validate(data)).toThrow();
  });

  it('should validate async', async () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(0),
    });

    const validator = new BaseValidator(schema);
    const data = { name: 'John', age: 30 };

    const result = await validator.validateAsync(data);
    expect(result).toEqual(data);
  });

  it('should safe parse valid data', () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(0),
    });

    const validator = new BaseValidator(schema);
    const data = { name: 'John', age: 30 };

    const result = validator.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('should safe parse invalid data', () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(0),
    });

    const validator = new BaseValidator(schema);
    const data = { name: 'J', age: -5 };

    const result = validator.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('createValidationResult', () => {
  it('should create success result', () => {
    const schema = z.string();
    const result = schema.safeParse('test');

    const validationResult = createValidationResult(result);
    expect(validationResult.success).toBe(true);
    expect(validationResult.data).toBe('test');
    expect(validationResult.errors).toBeUndefined();
  });

  it('should create error result', () => {
    const schema = z.string().min(5);
    const result = schema.safeParse('test');

    const validationResult = createValidationResult(result);
    expect(validationResult.success).toBe(false);
    expect(validationResult.data).toBeUndefined();
    expect(validationResult.errors).toBeDefined();
  });
});

describe('formatValidationErrors', () => {
  it('should format validation errors', () => {
    const schema = z.object({
      name: z.string().min(5),
      age: z.number().min(18),
    });

    const result = schema.safeParse({ name: 'John', age: 15 });
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      expect(errors).toHaveLength(2);
      expect(errors).toContain('age: Number must be greater than or equal to 18');
    }
  });

  it('should handle nested paths', () => {
    const schema = z.object({
      user: z.object({
        name: z.string().min(5),
      }),
    });

    const result = schema.safeParse({ user: { name: 'John' } });
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      expect(errors).toContain('user.name: String must contain at least 5 character(s)');
    }
  });
});

describe('validateMultiple', () => {
  it('should validate multiple schemas', () => {
    const schemas = {
      name: z.string().min(2),
      age: z.number().min(0),
      email: z.string().email(),
    };

    const data = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    };

    const results = validateMultiple(schemas, data);
    expect(results.name.success).toBe(true);
    expect(results.age.success).toBe(true);
    expect(results.email.success).toBe(true);
  });

  it('should handle partial failures', () => {
    const schemas = {
      name: z.string().min(2),
      age: z.number().min(0),
      email: z.string().email(),
    };

    const data = {
      name: 'J',
      age: -5,
      email: 'invalid',
    };

    const results = validateMultiple(schemas, data);
    expect(results.name.success).toBe(false);
    expect(results.age.success).toBe(false);
    expect(results.email.success).toBe(false);
  });
});

describe('allValidationsPassed', () => {
  it('should return true when all validations pass', () => {
    const results = {
      name: { success: true, data: 'John' },
      age: { success: true, data: 30 },
      email: { success: true, data: 'john@example.com' },
    };

    const result = allValidationsPassed(results);
    expect(result).toBe(true);
  });

  it('should return false when any validation fails', () => {
    const results = {
      name: { success: true, data: 'John' },
      age: { success: false, errors: new z.ZodError([]) },
      email: { success: true, data: 'john@example.com' },
    };

    const result = allValidationsPassed(results);
    expect(result).toBe(false);
  });
});
