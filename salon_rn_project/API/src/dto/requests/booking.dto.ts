import { z } from 'zod';

/**
 * Booking request DTOs
 */

/**
 * Create booking request DTO
 */
export interface CreateBookingRequestDto {
  salonId: string;
  customerId: string;
  staffId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
}

/**
 * Update booking request DTO
 */
export interface UpdateBookingRequestDto {
  staffId?: string;
  serviceId?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
}

/**
 * Booking query DTO
 */
export interface BookingQueryDto {
  salonId?: string;
  customerId?: string;
  staffId?: string;
  serviceId?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  startDate?: string;
  endDate?: string;
}

/**
 * Validation schemas
 */
export const createBookingSchema = z.object({
  salonId: z.string().uuid(),
  customerId: z.string().uuid(),
  staffId: z.string().uuid(),
  serviceId: z.string().uuid(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
});

export const updateBookingSchema = z.object({
  staffId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
});

export const bookingQuerySchema = z.object({
  salonId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  staffId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
