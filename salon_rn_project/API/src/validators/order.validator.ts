import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  uuidSchema,
  dateSchema,
  orderStatusSchema,
} from './common.validators';

/**
 * Order validator
 */

/**
 * Create order request schema
 */
export const createOrderSchema = z.object({
  salonId: uuidSchema,
  vendorId: uuidSchema,
  orderNumber: z.string().max(50).optional(),
  orderDate: dateSchema,
  expectedDeliveryDate: dateSchema.optional(),
  status: orderStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Update order request schema
 */
export const updateOrderSchema = z.object({
  vendorId: uuidSchema.optional(),
  orderNumber: z.string().max(50).optional(),
  orderDate: dateSchema.optional(),
  expectedDeliveryDate: dateSchema.optional(),
  actualDeliveryDate: dateSchema.optional(),
  status: orderStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Order query schema
 */
export const orderQuerySchema = z.object({
  salonId: uuidSchema.optional(),
  vendorId: uuidSchema.optional(),
  status: orderStatusSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  search: z.string().min(2).optional(),
});

/**
 * Order validator class
 */
export class OrderValidator extends BaseValidator<any> {
  constructor() {
    super(createOrderSchema);
  }

  validateCreate(data: unknown) {
    return createOrderSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateOrderSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return orderQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const orderValidator = new OrderValidator();
