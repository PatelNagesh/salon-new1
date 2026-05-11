import { Logger } from './logger.util';
import { SuccessResponse, ErrorResponse, PaginatedResponse, PaginationInfo } from '../types/api.types';

/**
 * Response formatter utility for consistent API responses
 */
export class ResponseFormatter {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ResponseFormatter');
  }

  /**
   * Format success response
   */
  success<T>(data: T, message?: string): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format error response
   */
  error(code: string, message: string, details?: any): ErrorResponse {
    this.logger.error(`Error response: ${code} - ${message}`, details);

    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format paginated response
   */
  paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };

    return {
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format created response
   */
  created<T>(data: T, message: string = 'Resource created successfully'): SuccessResponse<T> {
    return this.success(data, message);
  }

  /**
   * Format updated response
   */
  updated<T>(data: T, message: string = 'Resource updated successfully'): SuccessResponse<T> {
    return this.success(data, message);
  }

  /**
   * Format deleted response
   */
  deleted(message: string = 'Resource deleted successfully'): SuccessResponse<null> {
    return this.success(null, message);
  }

  /**
   * Format not found response
   */
  notFound(resource: string = 'Resource'): ErrorResponse {
    return this.error(
      'NOT_FOUND',
      `${resource} not found`
    );
  }

  /**
   * Format bad request response
   */
  badRequest(message: string = 'Bad request', details?: any): ErrorResponse {
    return this.error('BAD_REQUEST', message, details);
  }

  /**
   * Format unauthorized response
   */
  unauthorized(message: string = 'Unauthorized'): ErrorResponse {
    return this.error('UNAUTHORIZED', message);
  }

  /**
   * Format forbidden response
   */
  forbidden(message: string = 'Forbidden'): ErrorResponse {
    return this.error('FORBIDDEN', message);
  }

  /**
   * Format conflict response
   */
  conflict(message: string = 'Conflict', details?: any): ErrorResponse {
    return this.error('CONFLICT', message, details);
  }

  /**
   * Format validation error response
   */
  validationError(message: string = 'Validation failed', details?: any): ErrorResponse {
    return this.error('VALIDATION_ERROR', message, details);
  }

  /**
   * Format internal server error response
   */
  internalServerError(message: string = 'Internal server error', details?: any): ErrorResponse {
    return this.error('INTERNAL_ERROR', message, details);
  }

  /**
   * Format service unavailable response
   */
  serviceUnavailable(message: string = 'Service unavailable'): ErrorResponse {
    return this.error('SERVICE_UNAVAILABLE', message);
  }

  /**
   * Format rate limit exceeded response
   */
  rateLimitExceeded(limit: number, reset: number): ErrorResponse {
    return this.error(
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded',
      { limit, reset }
    );
  }

  /**
   * Format bulk operation response
   */
  bulkOperation(
    success: number,
    failed: number,
    errors: Array<{ id: string; error: string }>
  ): SuccessResponse<{
    success: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    return this.success(
      { success, failed, errors },
      `Bulk operation completed: ${success} succeeded, ${failed} failed`
    );
  }

  /**
   * Format batch operation response
   */
  batchOperation<T>(
    results: T[],
    errors: Array<{ index: number; error: string }>
  ): SuccessResponse<{
    results: T[];
    errors: Array<{ index: number; error: string }>;
  }> {
    return this.success(
      { results, errors },
      `Batch operation completed: ${results.length} succeeded, ${errors.length} failed`
    );
  }

  /**
   * Format search response
   */
  search<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    query: string
  ): SuccessResponse<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    query: string;
  }> {
    return this.success(
      { items, total, page, limit, query },
      `Found ${total} results for "${query}"`
    );
  }

  /**
   * Format autocomplete response
   */
  autocomplete<T>(
    suggestions: T[]
  ): SuccessResponse<{
    suggestions: T[];
  }> {
    return this.success(
      { suggestions },
      `Found ${suggestions.length} suggestions`
    );
  }

  /**
   * Format statistics response
   */
  statistics<T>(
    stats: T
  ): SuccessResponse<T> {
    return this.success(stats);
  }

  /**
   * Format export response
   */
  export<T>(
    data: T,
    format: string,
    filename: string
  ): SuccessResponse<{
    data: T;
    format: string;
    filename: string;
  }> {
    return this.success(
      { data, format, filename },
      `Export completed: ${filename}`
    );
  }

  /**
   * Format import response
   */
  import(
    success: number,
    failed: number,
    skipped: number,
    errors: Array<{ row: number; field: string; error: string }>
  ): SuccessResponse<{
    success: number;
    failed: number;
    skipped: number;
    errors: Array<{ row: number; field: string; error: string }>;
  }> {
    return this.success(
      { success, failed, skipped, errors },
      `Import completed: ${success} succeeded, ${failed} failed, ${skipped} skipped`
    );
  }

  /**
   * Format webhook response
   */
  webhook(
    eventId: string,
    event: string,
    data: any
  ): SuccessResponse<{
    eventId: string;
    event: string;
    data: any;
  }> {
    return this.success(
      { eventId, event, data },
      `Webhook event processed: ${event}`
    );
  }

  /**
   * Format notification response
   */
  notification(
    notificationId: string,
    userId: string,
    type: string,
    title: string,
    message: string
  ): SuccessResponse<{
    notificationId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
  }> {
    return this.success(
      { notificationId, userId, type, title, message },
      'Notification sent successfully'
    );
  }

  /**
   * Format activity log response
   */
  activityLog(
    activityId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    description: string
  ): SuccessResponse<{
    activityId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
  }> {
    return this.success(
      { activityId, userId, action, entityType, entityId, description },
      'Activity logged successfully'
    );
  }

  /**
   * Format health check response
   */
  healthCheck(status: 'healthy' | 'unhealthy' | 'degraded', details?: any): SuccessResponse<{
    status: string;
    details?: any;
  }> {
    return this.success(
      { status, details },
      `System is ${status}`
    );
  }

  /**
   * Format metrics response
   */
  metrics(metrics: Record<string, any>): SuccessResponse<Record<string, any>> {
    return this.success(metrics);
  }

  /**
   * Format config response
   */
  config(config: Record<string, any>): SuccessResponse<Record<string, any>> {
    return this.success(config);
  }

  /**
   * Format version response
   */
  version(version: string, build?: string, commit?: string): SuccessResponse<{
    version: string;
    build?: string;
    commit?: string;
  }> {
    return this.success({ version, build, commit });
  }
}

/**
 * Global response formatter instance
 */
export const responseFormatter = new ResponseFormatter();
