import { z } from 'zod';

/**
 * Customer request DTOs
 */

/**
 * Create customer request DTO
 */
export interface CreateCustomerRequestDto {
  salonId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  notes?: string;
}

/**
 * Update customer request DTO
 */
export interface UpdateCustomerRequestDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'blacklisted';
}

/**
 * Customer query DTO
 */
export interface CustomerQueryDto {
  salonId?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'blacklisted';
  search?: string;
}

/**
 * Validation schemas
 */
export const createCustomerSchema = z.object({
  salonId: z.string().uuid(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateCustomerSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(['active', 'inactive', 'blacklisted']).optional(),
});

export const customerQuerySchema = z.object({
  salonId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  status: z.enum(['active', 'inactive', 'blacklisted']).optional(),
  search: z.string().min(2).optional(),
});
