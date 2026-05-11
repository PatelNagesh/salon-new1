import { z } from 'zod';

/**
 * Order request DTOs
 */

/**
 * Create order request DTO
 */
export interface CreateOrderRequestDto {
  salonId: string;
  vendorId: string;
  orderNumber?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
}

/**
 * Update order request DTO
 */
export interface UpdateOrderRequestDto {
  vendorId?: string;
  orderNumber?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
}

/**
 * Order query DTO
 */
export interface OrderQueryDto {
  salonId?: string;
  vendorId?: string;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled';
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Validation schemas
 */
export const createOrderSchema = z.object({
  salonId: z.string().uuid(),
  vendorId: z.string().uuid(),
  orderNumber: z.string().max(50).optional(),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expectedDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateOrderSchema = z.object({
  vendorId: z.string().uuid().optional(),
  orderNumber: z.string().max(50).optional(),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  expectedDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  actualDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']).optional(),
  notes: z.string().max(1000).optional(),
});

export const orderQuerySchema = z.object({
  salonId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  search: z.string().min(2).optional(),
});
