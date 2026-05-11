import { z } from 'zod';

/**
 * Base pagination DTO
 */
export interface PaginationDto {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Base response DTO
 */
export interface BaseResponseDto<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Base paginated response DTO
 */
export interface PaginatedResponseDto<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

/**
 * Base error response DTO
 */
export interface ErrorResponseDto {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
