import { z } from 'zod';
import { BaseValidator } from './base.validator';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  uuidSchema,
} from './common.validators';

/**
 * Auth validator
 */

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

/**
 * Register request schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: phoneSchema.optional(),
});

/**
 * Refresh token request schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

/**
 * Forgot password request schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password request schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
);

/**
 * Change password request schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  confirmNewPassword: passwordSchema,
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  { message: 'Passwords do not match', path: ['confirmNewPassword'] }
);

/**
 * Verify email request schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

/**
 * Auth validator class
 */
export class AuthValidator extends BaseValidator<any> {
  constructor() {
    super(loginSchema);
  }

  validateLogin(data: unknown) {
    return loginSchema.parse(data);
  }

  validateRegister(data: unknown) {
    return registerSchema.parse(data);
  }

  validateRefreshToken(data: unknown) {
    return refreshTokenSchema.parse(data);
  }

  validateForgotPassword(data: unknown) {
    return forgotPasswordSchema.parse(data);
  }

  validateResetPassword(data: unknown) {
    return resetPasswordSchema.parse(data);
  }

  validateChangePassword(data: unknown) {
    return changePasswordSchema.parse(data);
  }

  validateVerifyEmail(data: unknown) {
    return verifyEmailSchema.parse(data);
  }
}

/**
 * Export validator instance
 */
export const authValidator = new AuthValidator();
