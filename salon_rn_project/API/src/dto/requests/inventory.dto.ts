import { z } from 'zod';

/**
 * Inventory request DTOs
 */

/**
 * Create inventory request DTO
 */
export interface CreateInventoryRequestDto {
  salonId: string;
  productId: string;
  quantity: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

/**
 * Update inventory request DTO
 */
export interface UpdateInventoryRequestDto {
  quantity?: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

/**
 * Inventory query DTO
 */
export interface InventoryQueryDto {
  salonId?: string;
  productId?: string;
  location?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
  search?: string;
}

/**
 * Validation schemas
 */
export const createInventorySchema = z.object({
  salonId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().min(0),
  location: z.string().max(100).optional(),
  batchNumber: z.string().max(50).optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0).optional(),
  location: z.string().max(100).optional(),
  batchNumber: z.string().max(50).optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
});

export const inventoryQuerySchema = z.object({
  salonId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  location: z.string().min(2).optional(),
  lowStock: z.boolean().optional(),
  expiringSoon: z.boolean().optional(),
  search: z.string().min(2).optional(),
});
