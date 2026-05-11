import { z } from 'zod';

/**
 * Product request DTOs
 */

/**
 * Create product request DTO
 */
export interface CreateProductRequestDto {
  salonId: string;
  vendorId?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  image?: string;
}

/**
 * Update product request DTO
 */
export interface UpdateProductRequestDto {
  vendorId?: string;
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  costPrice?: number;
  sellingPrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unit?: string;
  image?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

/**
 * Product query DTO
 */
export interface ProductQueryDto {
  salonId?: string;
  vendorId?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  lowStock?: boolean;
  search?: string;
}

/**
 * Validation schemas
 */
export const createProductSchema = z.object({
  salonId: z.string().uuid(),
  vendorId: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  sku: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  category: z.string().min(2).max(50),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  minStockLevel: z.number().int().min(0),
  maxStockLevel: z.number().int().min(0),
  unit: z.string().min(1).max(20),
  image: z.string().url().optional(),
});

export const updateProductSchema = z.object({
  vendorId: z.string().uuid().optional(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  sku: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  category: z.string().min(2).max(50).optional(),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  minStockLevel: z.number().int().min(0).optional(),
  maxStockLevel: z.number().int().min(0).optional(),
  unit: z.string().min(1).max(20).optional(),
  image: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
});

export const productQuerySchema = z.object({
  salonId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  category: z.string().min(2).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
  lowStock: z.boolean().optional(),
  search: z.string().min(2).optional(),
});
