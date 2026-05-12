import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
  dateSchema,
  addressSchema,
  citySchema,
  stateCodeSchema,
  zipCodeSchema,
  nameSchema,
  adultDateOfBirthSchema,
  roleSchema,
} from './common.validators';

/**
 * Staff validator
 */

/**
 * Create staff request schema
 */
export const createStaffSchema = z.object({
  salonId: uuidSchema,
  userId: uuidSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  avatar: urlSchema.optional(),
  dateOfBirth: adultDateOfBirthSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  state: stateCodeSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  role: roleSchema,
  specialization: z.array(z.string()).optional(),
  hireDate: dateSchema.optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Update staff request schema
 */
export const updateStaffSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  avatar: urlSchema.optional(),
  dateOfBirth: adultDateOfBirthSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  state: stateCodeSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  role: roleSchema.optional(),
  specialization: z.array(z.string()).optional(),
  hireDate: dateSchema.optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Staff query schema
 */
export const staffQuerySchema = z.object({
  salonId: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  email: emailSchema.optional(),
  role: roleSchema.optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  search: z.string().min(2).optional(),
});

/**
 * Staff validator class
 */
export class StaffValidator extends BaseValidator<any> {
  constructor() {
    super(createStaffSchema);
  }

  validateCreate(data: unknown) {
    return createStaffSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateStaffSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return staffQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const staffValidator = new StaffValidator();
