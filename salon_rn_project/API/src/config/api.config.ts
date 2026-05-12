/**
 * API configuration
 */

export interface ApiConfig {
  version: string;
  name: string;
  description: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  enableCompression: boolean;
  enableLogging: boolean;
  enableMetrics: boolean;
}

/**
 * Get API configuration from environment variables
 */
export function getApiConfig(): ApiConfig {
  return {
    version: process.env.API_VERSION || '1.0.0',
    name: process.env.API_NAME || 'Salon Management API',
    description: process.env.API_DESCRIPTION || 'API for Salon Management System',
    baseUrl: process.env.API_BASE_URL || '/api/v1',
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.API_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000'),
    enableCompression: process.env.API_ENABLE_COMPRESSION !== 'false',
    enableLogging: process.env.API_ENABLE_LOGGING !== 'false',
    enableMetrics: process.env.API_ENABLE_METRICS !== 'false'
  };
}

/**
 * Validate API configuration
 */
export function validateApiConfig(config: ApiConfig): boolean {
  if (!config.version) {
    throw new Error('API version is required');
  }

  if (!config.name) {
    throw new Error('API name is required');
  }

  if (!config.baseUrl) {
    throw new Error('API base URL is required');
  }

  if (config.timeout < 0) {
    throw new Error('API timeout must be non-negative');
  }

  if (config.maxRetries < 0) {
    throw new Error('API max retries must be non-negative');
  }

  if (config.retryDelay < 0) {
    throw new Error('API retry delay must be non-negative');
  }

  return true;
}

/**
 * API configuration for different environments
 */
export const apiConfigs = {
  development: {
    version: '1.0.0',
    name: 'Salon Management API (Dev)',
    description: 'Development API for Salon Management System',
    baseUrl: '/api/v1',
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    enableCompression: true,
    enableLogging: true,
    enableMetrics: true
  },
  staging: {
    version: '1.0.0',
    name: 'Salon Management API (Staging)',
    description: 'Staging API for Salon Management System',
    baseUrl: '/api/v1',
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    enableCompression: true,
    enableLogging: true,
    enableMetrics: true
  },
  production: {
    version: '1.0.0',
    name: 'Salon Management API',
    description: 'Production API for Salon Management System',
    baseUrl: '/api/v1',
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    enableCompression: true,
    enableLogging: false,
    enableMetrics: true
  }
};

/**
 * Get API configuration for current environment
 */
export function getApiConfigForEnvironment(env?: string): ApiConfig {
  const environment = env || process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'staging':
      return apiConfigs.staging;
    case 'production':
      return apiConfigs.production;
    default:
      return apiConfigs.development;
  }
}

/**
 * API endpoint paths
 */
export const ApiEndpoints = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password'
  },

  // Profile endpoints
  PROFILES: {
    LIST: '/profiles',
    CREATE: '/profiles',
    GET: '/profiles/:id',
    UPDATE: '/profiles/:id',
    DELETE: '/profiles/:id',
    ME: '/profiles/me'
  },

  // Salon endpoints
  SALONS: {
    LIST: '/salons',
    CREATE: '/salons',
    GET: '/salons/:id',
    UPDATE: '/salons/:id',
    DELETE: '/salons/:id',
    STATS: '/salons/:id/stats'
  },

  // Service endpoints
  SERVICES: {
    LIST: '/services',
    CREATE: '/services',
    GET: '/services/:id',
    UPDATE: '/services/:id',
    DELETE: '/services/:id',
    BY_SALON: '/salons/:salonId/services'
  },

  // Staff endpoints
  STAFF: {
    LIST: '/staff',
    CREATE: '/staff',
    GET: '/staff/:id',
    UPDATE: '/staff/:id',
    DELETE: '/staff/:id',
    BY_SALON: '/salons/:salonId/staff',
    SCHEDULE: '/staff/:id/schedule'
  },

  // Customer endpoints
  CUSTOMERS: {
    LIST: '/customers',
    CREATE: '/customers',
    GET: '/customers/:id',
    UPDATE: '/customers/:id',
    DELETE: '/customers/:id',
    BY_SALON: '/salons/:salonId/customers',
    HISTORY: '/customers/:id/history'
  },

  // Booking endpoints
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    GET: '/bookings/:id',
    UPDATE: '/bookings/:id',
    DELETE: '/bookings/:id',
    BY_CUSTOMER: '/customers/:customerId/bookings',
    BY_STAFF: '/staff/:staffId/bookings',
    BY_SALON: '/salons/:salonId/bookings',
    AVAILABLE_SLOTS: '/bookings/available-slots',
    CANCEL: '/bookings/:id/cancel',
    CONFIRM: '/bookings/:id/confirm'
  },

  // Vendor endpoints
  VENDORS: {
    LIST: '/vendors',
    CREATE: '/vendors',
    GET: '/vendors/:id',
    UPDATE: '/vendors/:id',
    DELETE: '/vendors/:id',
    BY_SALON: '/salons/:salonId/vendors'
  },

  // Product endpoints
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    GET: '/products/:id',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    BY_SALON: '/salons/:salonId/products',
    BY_VENDOR: '/vendors/:vendorId/products',
    LOW_STOCK: '/products/low-stock'
  },

  // Inventory endpoints
  INVENTORY: {
    LIST: '/inventory',
    CREATE: '/inventory',
    GET: '/inventory/:id',
    UPDATE: '/inventory/:id',
    DELETE: '/inventory/:id',
    BY_SALON: '/salons/:salonId/inventory',
    BY_PRODUCT: '/products/:productId/inventory',
    ADJUST: '/inventory/:id/adjust',
    LOW_STOCK: '/inventory/low-stock',
    EXPIRING_SOON: '/inventory/expiring-soon'
  },

  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    GET: '/orders/:id',
    UPDATE: '/orders/:id',
    DELETE: '/orders/:id',
    BY_SALON: '/salons/:salonId/orders',
    BY_VENDOR: '/vendors/:vendorId/orders',
    STATUS: '/orders/:id/status',
    ITEMS: '/orders/:id/items'
  },

  // Analytics endpoints
  ANALYTICS: {
    SALON: '/analytics/salon/:id',
    STAFF: '/analytics/staff/:id',
    REVENUE: '/analytics/revenue',
    BOOKINGS: '/analytics/bookings',
    CUSTOMERS: '/analytics/customers',
    INVENTORY: '/analytics/inventory'
  },

  // Health check
  HEALTH: '/health'
} as const;

/**
 * API response codes
 */
export const ApiResponseCodes = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  SERVER_ERROR: 'SERVER_ERROR'
} as const;

/**
 * API pagination defaults
 */
export const ApiPaginationDefaults = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const;

/**
 * API sorting defaults
 */
export const ApiSortingDefaults = {
  DEFAULT_FIELD: 'created_at',
  DEFAULT_DIRECTION: 'desc' as const,
  VALID_DIRECTIONS: ['asc', 'desc'] as const
} as const;

/**
 * API rate limiting
 */
export const ApiRateLimiting = {
  ENABLED: true,
  WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS: 100,
  STANDARD_RATE_LIMIT: 100,
  AUTHENTICATED_RATE_LIMIT: 1000,
  ADMIN_RATE_LIMIT: 10000
} as const;

/**
 * API CORS configuration
 */
export const ApiCorsConfig = {
  enabled: true,
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
} as const;
