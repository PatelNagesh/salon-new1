/**
 * API response type definitions
 */

/**
 * Success response
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  timestamp: string;
}

/**
 * API response (union type)
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse | PaginatedResponse<T>;

/**
 * Request context
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  role?: string;
  salonId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * Request metadata
 */
export interface RequestMetadata {
  method: string;
  path: string;
  query: Record<string, any>;
  headers: Record<string, string>;
  body?: any;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  statusCode: number;
  headers: Record<string, string>;
  duration: number;
}

/**
 * API endpoint definition
 */
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  authRequired: boolean;
  permissions?: string[];
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

/**
 * API version
 */
export interface ApiVersion {
  version: string;
  status: 'active' | 'deprecated' | 'beta';
  deprecatedAt?: string;
  sunsetAt?: string;
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Sort info
 */
export interface SortInfo {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter info
 */
export interface FilterInfo {
  field: string;
  operator: string;
  value: any;
}

/**
 * Query params
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: string;
  select?: string;
  relations?: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T> {
  results: T[];
  errors: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Field error
 */
export interface FieldError {
  field: string;
  errors: string[];
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  valid: boolean;
  errors: FieldError[];
}

/**
 * Search result
 */
export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  query: string;
}

/**
 * Autocomplete suggestion
 */
export interface AutocompleteSuggestion {
  id: string;
  label: string;
  value: any;
  type?: string;
}

/**
 * Statistics
 */
export interface Statistics {
  count: number;
  sum?: number;
  average?: number;
  min?: number;
  max?: number;
}

/**
 * Metric
 */
export interface Metric {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Chart data
 */
export interface ChartData {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataPoint[];
  xAxis?: string;
  yAxis?: string;
}

/**
 * Report data
 */
export interface ReportData {
  title: string;
  description?: string;
  generatedAt: string;
  period?: {
    start: string;
    end: string;
  };
  data: any;
  charts?: ChartData[];
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders?: boolean;
  filters?: Record<string, any>;
  fields?: string[];
}

/**
 * Import result
 */
export interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{
    row: number;
    field: string;
    error: string;
  }>;
}

/**
 * Webhook event
 */
export interface WebhookEvent {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

/**
 * Activity log
 */
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
