import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  uuidSchema,
  dateSchema,
  timeSchema,
  bookingStatusSchema,
} from './common.validators';

/**
 * Booking validator
 */

/**
 * Create booking request schema
 */
export const createBookingSchema = z.object({
  salonId: uuidSchema,
  customerId: uuidSchema,
  staffId: uuidSchema,
  serviceId: uuidSchema,
  appointmentDate: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  notes: z.string().max(500).optional(),
  status: bookingStatusSchema.optional(),
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

/**
 * Update booking request schema
 */
export const updateBookingSchema = z.object({
  staffId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  appointmentDate: dateSchema.optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  notes: z.string().max(500).optional(),
  status: bookingStatusSchema.optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      const start = data.startTime.split(':').map(Number);
      const end = data.endTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      return endMinutes > startMinutes;
    }
    return true;
  },
  { message: 'End time must be after start time' }
);

/**
 * Booking query schema
 */
export const bookingQuerySchema = z.object({
  salonId: uuidSchema.optional(),
  customerId: uuidSchema.optional(),
  staffId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  status: bookingStatusSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

/**
 * Booking validator class
 */
export class BookingValidator extends BaseValidator<any> {
  constructor() {
    super(createBookingSchema);
  }

  validateCreate(data: unknown) {
    return createBookingSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateBookingSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return bookingQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const bookingValidator = new BookingValidator();
