import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  dateSchema,
  addressSchema,
  citySchema,
  stateCodeSchema,
  zipCodeSchema,
  nameSchema,
  adultDateOfBirthSchema,
  customerStatusSchema,
} from './common.validators';

/**
 * Customer validator
 */

/**
 * Create customer request schema
 */
export const createCustomerSchema = z.object({
  salonId: uuidSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  state: stateCodeSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  dateOfBirth: adultDateOfBirthSchema.optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Update customer request schema
 */
export const updateCustomerSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  state: stateCodeSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  dateOfBirth: adultDateOfBirthSchema.optional(),
  notes: z.string().max(1000).optional(),
  status: customerStatusSchema.optional(),
});

/**
 * Customer query schema
 */
export const customerQuerySchema = z.object({
  salonId: uuidSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  status: customerStatusSchema.optional(),
  search: z.string().min(2).optional(),
});

/**
 * Customer validator class
 */
export class CustomerValidator extends BaseValidator<any> {
  constructor() {
    super(createCustomerSchema);
  }

  validateCreate(data: unknown) {
    return createCustomerSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateCustomerSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return customerQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const customerValidator = new CustomerValidator();
