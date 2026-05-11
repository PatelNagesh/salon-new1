/**
 * Error type definitions
 */

/**
 * Base error interface
 */
export interface BaseError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
}

/**
 * Authentication error
 */
export interface AuthError extends BaseError {
  type: 'auth';
  subType: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'insufficient_permissions' | 'session_expired';
}

/**
 * Validation error
 */
export interface ValidationError extends BaseError {
  type: 'validation';
  subType: 'invalid_input' | 'missing_field' | 'invalid_format' | 'invalid_length' | 'invalid_value';
  field?: string;
  value?: any;
}

/**
 * Not found error
 */
export interface NotFoundError extends BaseError {
  type: 'not_found';
  subType: 'user_not_found' | 'resource_not_found' | 'entity_not_found';
  entityType?: string;
  entityId?: string;
}

/**
 * Conflict error
 */
export interface ConflictError extends BaseError {
  type: 'conflict';
  subType: 'duplicate_resource' | 'concurrent_modification' | 'state_conflict';
  entityType?: string;
  entityId?: string;
}

/**
 * Forbidden error
 */
export interface ForbiddenError extends BaseError {
  type: 'forbidden';
  subType: 'access_denied' | 'resource_ownership' | 'insufficient_role';
  requiredPermission?: string;
  requiredRole?: string;
}

/**
 * Server error
 */
export interface ServerError extends BaseError {
  type: 'server';
  subType: 'internal_error' | 'database_error' | 'external_service_error' | 'timeout';
  service?: string;
}

/**
 * Rate limit error
 */
export interface RateLimitError extends BaseError {
  type: 'rate_limit';
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Error union type
 */
export type ApiError =
  | AuthError
  | ValidationError
  | NotFoundError
  | ConflictError
  | ForbiddenError
  | ServerError
  | RateLimitError;

/**
 * Error code constants
 */
export const ErrorCodes = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_TOKEN_INVALID: 'AUTH_003',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_004',
  AUTH_SESSION_EXPIRED: 'AUTH_005',

  // Validation errors
  VAL_INVALID_INPUT: 'VAL_001',
  VAL_MISSING_FIELD: 'VAL_002',
  VAL_INVALID_FORMAT: 'VAL_003',
  VAL_INVALID_LENGTH: 'VAL_004',
  VAL_INVALID_VALUE: 'VAL_005',

  // Not found errors
  NOT_FOUND_USER: 'NOT_FOUND_001',
  NOT_FOUND_RESOURCE: 'NOT_FOUND_002',
  NOT_FOUND_ENTITY: 'NOT_FOUND_003',

  // Conflict errors
  CONFLICT_DUPLICATE: 'CONFLICT_001',
  CONCURRENT_MODIFICATION: 'CONFLICT_002',
  STATE_CONFLICT: 'CONFLICT_003',

  // Forbidden errors
  FORBIDDEN_ACCESS_DENIED: 'FORBIDDEN_001',
  FORBIDDEN_RESOURCE_OWNERSHIP: 'FORBIDDEN_002',
  FORBIDDEN_INSUFFICIENT_ROLE: 'FORBIDDEN_003',

  // Server errors
  SERVER_INTERNAL_ERROR: 'SERVER_001',
  SERVER_DATABASE_ERROR: 'SERVER_002',
  SERVER_EXTERNAL_SERVICE_ERROR: 'SERVER_003',
  SERVER_TIMEOUT: 'SERVER_004',

  // Rate limit errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_001'
} as const;

/**
 * Error messages
 */
export const ErrorMessages = {
  // Authentication errors
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Invalid credentials provided',
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: 'Authentication token has expired',
  [ErrorCodes.AUTH_TOKEN_INVALID]: 'Invalid authentication token',
  [ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions to perform this action',
  [ErrorCodes.AUTH_SESSION_EXPIRED]: 'Session has expired, please login again',

  // Validation errors
  [ErrorCodes.VAL_INVALID_INPUT]: 'Invalid input provided',
  [ErrorCodes.VAL_MISSING_FIELD]: 'Required field is missing',
  [ErrorCodes.VAL_INVALID_FORMAT]: 'Invalid format for field',
  [ErrorCodes.VAL_INVALID_LENGTH]: 'Invalid length for field',
  [ErrorCodes.VAL_INVALID_VALUE]: 'Invalid value for field',

  // Not found errors
  [ErrorCodes.NOT_FOUND_USER]: 'User not found',
  [ErrorCodes.NOT_FOUND_RESOURCE]: 'Resource not found',
  [ErrorCodes.NOT_FOUND_ENTITY]: 'Entity not found',

  // Conflict errors
  [ErrorCodes.CONFLICT_DUPLICATE]: 'Resource already exists',
  [ErrorCodes.CONCURRENT_MODIFICATION]: 'Resource was modified by another user',
  [ErrorCodes.STATE_CONFLICT]: 'Resource state conflict',

  // Forbidden errors
  [ErrorCodes.FORBIDDEN_ACCESS_DENIED]: 'Access denied',
  [ErrorCodes.FORBIDDEN_RESOURCE_OWNERSHIP]: 'You do not have permission to access this resource',
  [ErrorCodes.FORBIDDEN_INSUFFICIENT_ROLE]: 'Insufficient role to perform this action',

  // Server errors
  [ErrorCodes.SERVER_INTERNAL_ERROR]: 'Internal server error',
  [ErrorCodes.SERVER_DATABASE_ERROR]: 'Database error occurred',
  [ErrorCodes.SERVER_EXTERNAL_SERVICE_ERROR]: 'External service error occurred',
  [ErrorCodes.SERVER_TIMEOUT]: 'Request timeout',

  // Rate limit errors
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded'
} as const;

/**
 * HTTP status codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error context
 */
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  id: string;
  code: string;
  message: string;
  severity: ErrorSeverity;
  context?: ErrorContext;
  stack?: string;
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
 * Field validation error
 */
export interface FieldValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Form validation errors
 */
export interface FormValidationErrors {
  errors: FieldValidationError[];
  message: string;
}
