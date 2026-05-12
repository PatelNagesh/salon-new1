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
  preferencesSchema,
} from './common.validators';

/**
 * Profile validator
 */

/**
 * Create profile request schema
 */
export const createProfileSchema = z.object({
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
  preferences: preferencesSchema.optional(),
});

/**
 * Update profile request schema
 */
export const updateProfileSchema = z.object({
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
  preferences: preferencesSchema.optional(),
});

/**
 * Profile query schema
 */
export const profileQuerySchema = z.object({
  userId: uuidSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  search: z.string().min(2).optional(),
});

/**
 * Profile validator class
 */
export class ProfileValidator extends BaseValidator<any> {
  constructor() {
    super(createProfileSchema);
  }

  validateCreate(data: unknown) {
    return createProfileSchema.parse(data);
  }

  validateUpdate(data: unknown) {
    return updateProfileSchema.parse(data);
  }

  validateQuery(data: unknown) {
    return profileQuerySchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const profileValidator = new ProfileValidator();
