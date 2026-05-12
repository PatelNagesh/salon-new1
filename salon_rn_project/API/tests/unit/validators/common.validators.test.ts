import { describe, it, expect } from '@jest/globals';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  zipCodeSchema,
  stateCodeSchema,
  dateSchema,
  timeSchema,
  urlSchema,
  passwordSchema,
  nameSchema,
  descriptionSchema,
  notesSchema,
  addressSchema,
  citySchema,
  priceSchema,
  quantitySchema,
  durationSchema,
  percentageSchema,
  ratingSchema,
  salonStatusSchema,
  serviceStatusSchema,
  bookingStatusSchema,
  customerStatusSchema,
  orderStatusSchema,
  roleSchema,
  futureDateSchema,
  pastDateSchema,
  adultDateOfBirthSchema,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
} from '../common.validators';

describe('Common Validators', () => {
  describe('uuidSchema', () => {
    it('should validate valid UUID', () => {
      const result = uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = uuidSchema.safeParse('not-a-uuid');
      expect(result.success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('should validate valid email', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse('invalid-email');
      expect(result.success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should validate valid phone number', () => {
      const result = phoneSchema.safeParse('+1 (555) 123-4567');
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const result = phoneSchema.safeParse('123');
      expect(result.success).toBe(false);
    });
  });

  describe('zipCodeSchema', () => {
    it('should validate valid zip code', () => {
      const result = zipCodeSchema.safeParse('12345');
      expect(result.success).toBe(true);
    });

    it('should validate zip code with extension', () => {
      const result = zipCodeSchema.safeParse('12345-6789');
      expect(result.success).toBe(true);
    });

    it('should reject invalid zip code', () => {
      const result = zipCodeSchema.safeParse('1234');
      expect(result.success).toBe(false);
    });
  });

  describe('stateCodeSchema', () => {
    it('should validate valid state code', () => {
      const result = stateCodeSchema.safeParse('CA');
      expect(result.success).toBe(true);
    });

    it('should reject invalid state code', () => {
      const result = stateCodeSchema.safeParse('CAL');
      expect(result.success).toBe(false);
    });
  });

  describe('dateSchema', () => {
    it('should validate valid date', () => {
      const result = dateSchema.safeParse('2026-05-12');
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = dateSchema.safeParse('05/12/2026');
      expect(result.success).toBe(false);
    });
  });

  describe('timeSchema', () => {
    it('should validate valid time', () => {
      const result = timeSchema.safeParse('14:30');
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format', () => {
      const result = timeSchema.safeParse('2:30 PM');
      expect(result.success).toBe(false);
    });
  });

  describe('urlSchema', () => {
    it('should validate valid URL', () => {
      const result = urlSchema.safeParse('https://example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = urlSchema.safeParse('not-a-url');
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong password', () => {
      const result = passwordSchema.safeParse('Password123');
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const result = passwordSchema.safeParse('weak');
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('password123');
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('PASSWORD123');
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = passwordSchema.safeParse('Password');
      expect(result.success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('should validate valid name', () => {
      const result = nameSchema.safeParse('John Doe');
      expect(result.success).toBe(true);
    });

    it('should reject name with numbers', () => {
      const result = nameSchema.safeParse('John123');
      expect(result.success).toBe(false);
    });

    it('should reject name that is too short', () => {
      const result = nameSchema.safeParse('J');
      expect(result.success).toBe(false);
    });
  });

  describe('descriptionSchema', () => {
    it('should validate valid description', () => {
      const result = descriptionSchema.safeParse('A valid description');
      expect(result.success).toBe(true);
    });

    it('should reject description that is too long', () => {
      const result = descriptionSchema.safeParse('A'.repeat(501));
      expect(result.success).toBe(false);
    });
  });

  describe('notesSchema', () => {
    it('should validate valid notes', () => {
      const result = notesSchema.safeParse('Some notes');
      expect(result.success).toBe(true);
    });

    it('should reject notes that are too long', () => {
      const result = notesSchema.safeParse('A'.repeat(1001));
      expect(result.success).toBe(false);
    });
  });

  describe('addressSchema', () => {
    it('should validate valid address', () => {
      const result = addressSchema.safeParse('123 Main St');
      expect(result.success).toBe(true);
    });

    it('should reject address that is too short', () => {
      const result = addressSchema.safeParse('123');
      expect(result.success).toBe(false);
    });
  });

  describe('citySchema', () => {
    it('should validate valid city', () => {
      const result = citySchema.safeParse('New York');
      expect(result.success).toBe(true);
    });

    it('should reject city that is too short', () => {
      const result = citySchema.safeParse('NY');
      expect(result.success).toBe(false);
    });
  });

  describe('priceSchema', () => {
    it('should validate valid price', () => {
      const result = priceSchema.safeParse(99.99);
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const result = priceSchema.safeParse(-10);
      expect(result.success).toBe(false);
    });
  });

  describe('quantitySchema', () => {
    it('should validate valid quantity', () => {
      const result = quantitySchema.safeParse(10);
      expect(result.success).toBe(true);
    });

    it('should reject negative quantity', () => {
      const result = quantitySchema.safeParse(-5);
      expect(result.success).toBe(false);
    });

    it('should reject decimal quantity', () => {
      const result = quantitySchema.safeParse(5.5);
      expect(result.success).toBe(false);
    });
  });

  describe('durationSchema', () => {
    it('should validate valid duration', () => {
      const result = durationSchema.safeParse(60);
      expect(result.success).toBe(true);
    });

    it('should reject duration that is too short', () => {
      const result = durationSchema.safeParse(4);
      expect(result.success).toBe(false);
    });

    it('should reject duration that is too long', () => {
      const result = durationSchema.safeParse(500);
      expect(result.success).toBe(false);
    });
  });

  describe('percentageSchema', () => {
    it('should validate valid percentage', () => {
      const result = percentageSchema.safeParse(50);
      expect(result.success).toBe(true);
    });

    it('should reject negative percentage', () => {
      const result = percentageSchema.safeParse(-10);
      expect(result.success).toBe(false);
    });

    it('should reject percentage over 100', () => {
      const result = percentageSchema.safeParse(150);
      expect(result.success).toBe(false);
    });
  });

  describe('ratingSchema', () => {
    it('should validate valid rating', () => {
      const result = ratingSchema.safeParse(5);
      expect(result.success).toBe(true);
    });

    it('should reject rating below 1', () => {
      const result = ratingSchema.safeParse(0);
      expect(result.success).toBe(false);
    });

    it('should reject rating above 5', () => {
      const result = ratingSchema.safeParse(6);
      expect(result.success).toBe(false);
    });
  });

  describe('Status Schemas', () => {
    it('should validate salon status', () => {
      expect(salonStatusSchema.safeParse('active').success).toBe(true);
      expect(salonStatusSchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate service status', () => {
      expect(serviceStatusSchema.safeParse('active').success).toBe(true);
      expect(serviceStatusSchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate booking status', () => {
      expect(bookingStatusSchema.safeParse('confirmed').success).toBe(true);
      expect(bookingStatusSchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate customer status', () => {
      expect(customerStatusSchema.safeParse('active').success).toBe(true);
      expect(customerStatusSchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate order status', () => {
      expect(orderStatusSchema.safeParse('pending').success).toBe(true);
      expect(orderStatusSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('roleSchema', () => {
    it('should validate valid role', () => {
      expect(roleSchema.safeParse('staff').success).toBe(true);
    });

    it('should reject invalid role', () => {
      expect(roleSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('Date Validators', () => {
    it('should validate future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      expect(futureDateSchema.safeParse(dateStr).success).toBe(true);
    });

    it('should reject past date for futureDateSchema', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const dateStr = pastDate.toISOString().split('T')[0];
      expect(futureDateSchema.safeParse(dateStr).success).toBe(false);
    });

    it('should validate past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const dateStr = pastDate.toISOString().split('T')[0];
      expect(pastDateSchema.safeParse(dateStr).success).toBe(true);
    });

    it('should reject future date for pastDateSchema', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      expect(pastDateSchema.safeParse(dateStr).success).toBe(false);
    });

    it('should validate adult date of birth', () => {
      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 20);
      const dateStr = adultDate.toISOString().split('T')[0];
      expect(adultDateOfBirthSchema.safeParse(dateStr).success).toBe(true);
    });

    it('should reject minor date of birth', () => {
      const minorDate = new Date();
      minorDate.setFullYear(minorDate.getFullYear() - 15);
      const dateStr = minorDate.toISOString().split('T')[0];
      expect(adultDateOfBirthSchema.safeParse(dateStr).success).toBe(false);
    });
  });

  describe('Sanitization Functions', () => {
    it('should sanitize string', () => {
      const result = sanitizeString('  hello   world  ');
      expect(result).toBe('hello world');
    });

    it('should sanitize email', () => {
      const result = sanitizeEmail('  TEST@EXAMPLE.COM  ');
      expect(result).toBe('test@example.com');
    });

    it('should sanitize phone', () => {
      const result = sanitizePhone('(555) 123-4567');
      expect(result).toBe('5551234567');
    });

    it('should sanitize URL', () => {
      const result = sanitizeUrl('example.com');
      expect(result).toBe('https://example.com');
    });

    it('should not modify URL with protocol', () => {
      const result = sanitizeUrl('https://example.com');
      expect(result).toBe('https://example.com');
    });
  });
});
