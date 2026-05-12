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
} from './common.validators';

/**
 * Vendor validator
 */

/**
 * Create vendor request schema
 */
export const createVendorSchema = z.object({
  salonId: uuidSchema,
  name: nameSchema,
  contactPerson: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  state: stateCodeSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  website: urlSchema.optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Update vendor request schema
 */
export const updateVendorSchema = z.object({
  name: nameSchema.optional(),
  contactPerson: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  state: stateCodeSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  website: urlSchema.optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Vendor query schema
 */
export const vendorQuerySchema = z.object({
  salonId: uuidSchema.optional(),
  email: emailSchema.optional(),
  city: citySchema.optional(),
  state: stateCodeSchema.optional(),
  search: z.string().min(2).optional(),
});

/**
 * Vendor validator class
 */
export class VendorValidator extends BaseValidator<any> {
  constructor() {
    super(createVendorSchema);
  }

  validateCreate(data: unknown) {
    return createVendorSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateVendorSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return vendorQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const vendorValidator = new VendorValidator();
