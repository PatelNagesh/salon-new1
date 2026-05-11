import { z } from 'zod';

/**
 * Vendor request DTOs
 */

/**
 * Create vendor request DTO
 */
export interface CreateVendorRequestDto {
  salonId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  notes?: string;
}

/**
 * Update vendor request DTO
 */
export interface UpdateVendorRequestDto {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  notes?: string;
}

/**
 * Vendor query DTO
 */
export interface VendorQueryDto {
  salonId?: string;
  email?: string;
  city?: string;
  state?: string;
  search?: string;
}

/**
 * Validation schemas
 */
export const createVendorSchema = z.object({
  salonId: z.string().uuid(),
  name: z.string().min(2).max(100),
  contactPerson: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  website: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateVendorSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  contactPerson: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  website: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
});

export const vendorQuerySchema = z.object({
  salonId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  city: z.string().min(2).optional(),
  state: z.string().length(2).optional(),
  search: z.string().min(2).optional(),
});
