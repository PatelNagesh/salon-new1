import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  uuidSchema,
  urlSchema,
  nameSchema,
  descriptionSchema,
  priceSchema,
} from './common.validators';

/**
 * Product validator
 */

/**
 * Create product request schema
 */
export const createProductSchema = z.object({
  salonId: uuidSchema,
  vendorId: uuidSchema,
  name: nameSchema,
  description: descriptionSchema.optional(),
  sku: z.string().min(1).max(50),
  price: priceSchema,
  cost: priceSchema.optional(),
  image: urlSchema.optional(),
  category: z.string().min(2).max(50),
  unit: z.string().min(1).max(20),
  minStockLevel: z.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
});

/**
 * Update product request schema
 */
export const updateProductSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  sku: z.string().min(1).max(50).optional(),
  price: priceSchema.optional(),
  cost: priceSchema.optional(),
  image: urlSchema.optional(),
  category: z.string().min(2).max(50).optional(),
  unit: z.string().min(1).max(20).optional(),
  minStockLevel: z.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
});

/**
 * Product query schema
 */
export const productQuerySchema = z.object({
  salonId: uuidSchema.optional(),
  vendorId: uuidSchema.optional(),
  category: z.string().min(2).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  lowStock: z.boolean().optional(),
  search: z.string().min(2).optional(),
});

/**
 * Product validator class
 */
export class ProductValidator extends BaseValidator<any> {
  constructor() {
    super(createProductSchema);
  }

  validateCreate(data: unknown) {
    return createProductSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateProductSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return productQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const productValidator = new ProductValidator();
