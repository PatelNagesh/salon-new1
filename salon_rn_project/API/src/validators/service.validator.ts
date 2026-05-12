import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  uuidSchema,
  urlSchema,
  nameSchema,
  descriptionSchema,
  priceSchema,
  durationSchema,
  serviceStatusSchema,
} from './common.validators';

/**
 * Service validator
 */

/**
 * Create service request schema
 */
export const createServiceSchema = z.object({
  salonId: uuidSchema,
  name: nameSchema,
  description: descriptionSchema.optional(),
  duration: durationSchema,
  price: priceSchema,
  category: z.string().min(2).max(50),
  image: urlSchema.optional(),
});

/**
 * Update service request schema
 */
export const updateServiceSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  duration: durationSchema.optional(),
  price: priceSchema.optional(),
  category: z.string().min(2).max(50).optional(),
  image: urlSchema.optional(),
  status: serviceStatusSchema.optional(),
});

/**
 * Service query schema
 */
export const serviceQuerySchema = z.object({
  salonId: uuidSchema.optional(),
  category: z.string().min(2).optional(),
  status: serviceStatusSchema.optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  search: z.string().min(2).optional(),
});

/**
 * Service validator class
 */
export class ServiceValidator extends BaseValidator<any> {
  constructor() {
    super(createServiceSchema);
  }

  validateCreate(data: unknown) {
    return createServiceSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateServiceSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return serviceQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const serviceValidator = new ServiceValidator();
