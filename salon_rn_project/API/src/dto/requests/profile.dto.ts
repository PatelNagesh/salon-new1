import { z } from 'zod';

/**
 * Profile request DTOs
 */

/**
 * Create profile request DTO
 */
export interface CreateProfileRequestDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferences?: Record<string, any>;
}

/**
 * Update profile request DTO
 */
export interface UpdateProfileRequestDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferences?: Record<string, any>;
}

/**
 * Profile query DTO
 */
export interface ProfileQueryDto {
  userId?: string;
  email?: string;
  phone?: string;
  search?: string;
}

/**
 * Validation schemas
 */
export const createProfileSchema = z.object({
  userId: z.string().uuid(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  avatar: z.string().url().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  preferences: z.record(z.any()).optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  avatar: z.string().url().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  preferences: z.record(z.any()).optional(),
});

export const profileQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  search: z.string().min(2).optional(),
});
