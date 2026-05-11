import { z } from 'zod';

/**
 * Staff request DTOs
 */

/**
 * Create staff request DTO
 */
export interface CreateStaffRequestDto {
  salonId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specializations?: string[];
  commissionRate?: number;
  hourlyRate?: number;
  hireDate: string;
}

/**
 * Update staff request DTO
 */
export interface UpdateStaffRequestDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specializations?: string[];
  commissionRate?: number;
  hourlyRate?: number;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
}

/**
 * Staff query DTO
 */
export interface StaffQueryDto {
  salonId?: string;
  userId?: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  specialization?: string;
  search?: string;
}

/**
 * Validation schemas
 */
export const createStaffSchema = z.object({
  salonId: z.string().uuid(),
  userId: z.string().uuid(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  specializations: z.array(z.string()).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  hourlyRate: z.number().min(0).optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateStaffSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/).optional(),
  specializations: z.array(z.string()).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  hourlyRate: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
});

export const staffQuerySchema = z.object({
  salonId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
  specialization: z.string().min(2).optional(),
  search: z.string().min(2).optional(),
});
