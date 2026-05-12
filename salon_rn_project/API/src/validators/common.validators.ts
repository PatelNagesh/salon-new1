import { z } from 'zod';

/**
 * Custom validators for common validation scenarios
 */

/**
 * UUID validator
 */
export const uuidSchema = z.string().uuid();

/**
 * Email validator
 */
export const emailSchema = z.string().email();

/**
 * Phone number validator (US format)
 */
export const phoneSchema = z.string().regex(/^\+?[\d\s-()]{10,20}$/);

/**
 * US Zip code validator
 */
export const zipCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/);

/**
 * US State code validator (2 letters)
 */
export const stateCodeSchema = z.string().length(2);

/**
 * Date validator (YYYY-MM-DD format)
 */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Time validator (HH:MM format)
 */
export const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);

/**
 * URL validator
 */
export const urlSchema = z.string().url();

/**
 * Password validator (min 8 chars, at least one uppercase, one lowercase, one number)
 */
export const passwordSchema = z
  .string()
  .min(8)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);

/**
 * Name validator (2-100 characters, letters and spaces only)
 */
export const nameSchema = z.string().min(2).max(100).regex(/^[a-zA-Z\s]+$/);

/**
 * Description validator (max 500 characters)
 */
export const descriptionSchema = z.string().max(500);

/**
 * Notes validator (max 1000 characters)
 */
export const notesSchema = z.string().max(1000);

/**
 * Address validator (5-200 characters)
 */
export const addressSchema = z.string().min(5).max(200);

/**
 * City validator (2-100 characters)
 */
export const citySchema = z.string().min(2).max(100);

/**
 * Price validator (non-negative number)
 */
export const priceSchema = z.number().min(0);

/**
 * Quantity validator (non-negative integer)
 */
export const quantitySchema = z.number().int().min(0);

/**
 * Duration validator (5-480 minutes)
 */
export const durationSchema = z.number().int().min(5).max(480);

/**
 * Percentage validator (0-100)
 */
export const percentageSchema = z.number().min(0).max(100);

/**
 * Rating validator (1-5)
 */
export const ratingSchema = z.number().min(1).max(5);

/**
 * Status validators
 */
export const salonStatusSchema = z.enum(['active', 'inactive', 'suspended']);
export const serviceStatusSchema = z.enum(['active', 'inactive', 'archived']);
export const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
]);
export const customerStatusSchema = z.enum(['active', 'inactive', 'blacklisted']);
export const orderStatusSchema = z.enum(['pending', 'ordered', 'received', 'cancelled']);

/**
 * Role validators
 */
export const roleSchema = z.enum(['super_admin', 'salon_owner', 'staff', 'customer']);

/**
 * Custom validator for future dates
 */
export const futureDateSchema = dateSchema.refine(
  (date) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
  },
  { message: 'Date must be in the future' }
);

/**
 * Custom validator for past dates
 */
export const pastDateSchema = dateSchema.refine(
  (date) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
  },
  { message: 'Date must be in the past' }
);

/**
 * Custom validator for age (must be at least 18 years old)
 */
export const adultDateOfBirthSchema = dateSchema.refine(
  (date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  },
  { message: 'Must be at least 18 years old' }
);

/**
 * Custom validator for time range (end time must be after start time)
 */
export function createTimeRangeSchema() {
  return z.object({
    startTime: timeSchema,
    endTime: timeSchema,
  }).refine(
    (data) => {
      const start = data.startTime.split(':').map(Number);
      const end = data.endTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      return endMinutes > startMinutes;
    },
    { message: 'End time must be after start time' }
  );
}

/**
 * Custom validator for opening hours
 */
export const openingHoursSchema = z.record(
  z.object({
    open: timeSchema,
    close: timeSchema,
    isOpen: z.boolean().optional(),
  })
);

/**
 * Custom validator for coordinates (latitude, longitude)
 */
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Custom validator for pagination
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Custom validator for sorting
 */
export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Custom validator for search query
 */
export const searchSchema = z.object({
  query: z.string().min(2),
  fields: z.array(z.string()).optional(),
});

/**
 * Custom validator for file upload
 */
export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
  type: z.string().regex(/^(image\/|application\/pdf)/),
});

/**
 * Custom validator for array of UUIDs
 */
export const uuidArraySchema = z.array(uuidSchema).min(1);

/**
 * Custom validator for tags
 */
export const tagsSchema = z.array(z.string().min(1).max(50)).max(10);

/**
 * Custom validator for preferences
 */
export const preferencesSchema = z.record(z.any());

/**
 * Sanitize string (remove extra whitespace)
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize email (lowercase and trim)
 */
export function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Sanitize phone (remove all non-digit characters except +)
 */
export function sanitizePhone(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

/**
 * Sanitize URL (ensure protocol)
 */
export function sanitizeUrl(value: string): string {
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return `https://${value}`;
  }
  return value;
}
