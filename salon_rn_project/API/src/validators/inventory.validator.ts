import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  uuidSchema,
  dateSchema,
  quantitySchema,
} from './common.validators';

/**
 * Inventory validator
 */

/**
 * Create inventory request schema
 */
export const createInventorySchema = z.object({
  salonId: uuidSchema,
  productId: uuidSchema,
  quantity: quantitySchema,
  location: z.string().max(100).optional(),
  batchNumber: z.string().max(50).optional(),
  expiryDate: dateSchema.optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Update inventory request schema
 */
export const updateInventorySchema = z.object({
  quantity: quantitySchema.optional(),
  location: z.string().max(100).optional(),
  batchNumber: z.string().max(50).optional(),
  expiryDate: dateSchema.optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Inventory query schema
 */
export const inventoryQuerySchema = z.object({
  salonId: uuidSchema.optional(),
  productId: uuidSchema.optional(),
  location: z.string().min(2).optional(),
  lowStock: z.boolean().optional(),
  expiringSoon: z.boolean().optional(),
  search: z.string().min(2).optional(),
});

/**
 * Inventory validator class
 */
export class InventoryValidator extends BaseValidator<any> {
  constructor() {
    super(createInventorySchema);
  }

  validateCreate(data: unknown) {
    return createInventorySchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateInventorySchema.parse(data);
  }

  validateQuery(data: unknown) {
    return inventoryQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const inventoryValidator = new InventoryValidator();
