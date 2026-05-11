import { z } from 'zod';

/**
 * Service request DTOs
 */

/**
 * Create service request DTO
 */
export interface CreateServiceRequestDto {
  salonId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
}

/**
 * Update service request DTO
 */
export interface UpdateServiceRequestDto {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  category?: string;
  image?: string;
  status?: 'active' | 'inactive' | 'archived';
}

/**
 * Service query DTO
 */
export interface ServiceQueryDto {
  salonId?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

/**
 * Validation schemas
 */
export const createServiceSchema = z.object({
  salonId: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(5).max(480),
  price: z.number().min(0),
  category: z.string().min(2).max(50),
  image: z.string().url().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(5).max(480).optional(),
  price: z.number().min(0).optional(),
  category: z.string().min(2).max(50).optional(),
  image: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

export const serviceQuerySchema = z.object({
  salonId: z.string().uuid().optional(),
  category: z.string().min(2).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().min(2).optional(),
});
