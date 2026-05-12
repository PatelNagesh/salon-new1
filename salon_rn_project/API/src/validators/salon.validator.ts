import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
  addressSchema,
  citySchema,
  stateCodeSchema,
  zipCodeSchema,
  nameSchema,
  descriptionSchema,
  salonStatusSchema,
  openingHoursSchema,
} from './common.validators';

/**
 * Salon validator
 */

/**
 * Create salon request schema
 */
export const createSalonSchema = z.object({
  ownerId: uuidSchema,
  name: nameSchema,
  description: descriptionSchema.optional(),
  address: addressSchema,
  city: citySchema,
  state: stateCodeSchema,
  zipCode: zipCodeSchema,
  phone: phoneSchema,
  email: emailSchema,
  website: urlSchema.optional(),
  logo: urlSchema.optional(),
  openingHours: openingHoursSchema.optional(),
});

/**
 * Update salon request schema
 */
export const updateSalonSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  state: stateCodeSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: urlSchema.optional(),
  logo: urlSchema.optional(),
  openingHours: openingHoursSchema.optional(),
  status: salonStatusSchema.optional(),
});

/**
 * Salon query schema
 */
export const salonQuerySchema = z.object({
  ownerId: uuidSchema.optional(),
  city: citySchema.optional(),
  status: salonStatusSchema.optional(),
  search: z.string().min(2).optional(),
});

/**
 * Salon validator class
 */
export class SalonValidator extends BaseValidator<any> {
  constructor() {
    super(createSalonSchema);
  }

  validateCreate(data: unknown) {
    return createSalonSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateSalonSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return salonQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const salonValidator = new SalonValidator();
