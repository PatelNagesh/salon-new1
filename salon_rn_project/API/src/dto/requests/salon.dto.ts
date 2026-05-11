import { z } from 'zod';

/**
 * Salon request DTOs
 */

/**
 * Create salon request DTO
 */
export interface CreateSalonRequestDto {
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  openingHours?: Record<string, any>;
}

/**
 * Update salon request DTO
 */
export interface UpdateSalonRequestDto {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  openingHours?: Record<string, any>;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * Salon query DTO
 */
export interface SalonQueryDto {
  ownerId?: string;
  city?: string;
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
}

/**
 * Validation schemas
 */
export const createSalonSchema = z.object({
  ownerId: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/),
  email: z.string().email(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  openingHours: z.record(z.any()).optional(),
});

export const updateSalonSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  address: z.string().min(5).max(200).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  openingHours: z.record(z.any()).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const salonQuerySchema = z.object({
  ownerId: z.string().uuid().optional(),
  city: z.string().min(2).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  search: z.string().min(2).optional(),
});
