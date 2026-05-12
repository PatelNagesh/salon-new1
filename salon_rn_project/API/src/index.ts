/**
 * API Layer - Main Entry Point
 *
 * This is the main entry point for the API layer.
 * All controllers, services, repositories, and types are exported here.
 *
 * @module API
 * @version 1.0.0
 * @description Salon Management System API Layer
 */

// ============================================================================
// Core Exports
// ============================================================================
export * from './core';

// ============================================================================
// Configuration Exports
// ============================================================================
export * from './config';

// ============================================================================
// Constants Exports
// ============================================================================
export * from './constants';

// ============================================================================
// Exception Exports
// ============================================================================
export * from './exceptions';

// ============================================================================
// Repository Exports
// ============================================================================
export * from './repositories';

// ============================================================================
// Service Exports
// ============================================================================
export * from './services';

// ============================================================================
// Controller Exports
// ============================================================================
export * from './controllers';

// ============================================================================
// Middleware Exports
// ============================================================================
export * from './middleware';

// ============================================================================
// Validator Exports
// ============================================================================
export * from './validators';

// ============================================================================
// DTO Exports
// ============================================================================
export * from './dto';

// ============================================================================
// Convenience Re-exports
// ============================================================================

// Configuration
export {
  getSupabaseClient,
  getSupabaseAdminClient,
  resetSupabaseClients,
  SupabaseTables,
  SupabaseStorageBuckets,
  SupabaseRealtimeChannels
} from './config/supabase.config';

export {
  getCacheConfig,
  validateCacheConfig,
  buildCacheKey,
  buildEntityCacheKey,
  buildListCacheKey,
  parseCacheKey
} from './config/cache.config';

export {
  getDatabaseConfig,
  validateDatabaseConfig,
  getDatabaseConnectionString
} from './config/database.config';

export {
  getApiConfig,
  validateApiConfig,
  ApiEndpoints,
  ApiPaginationDefaults,
  ApiSortingDefaults,
  ApiRateLimiting,
  ApiCorsConfig
} from './config/api.config';

export {
  getLoggerConfig,
  validateLoggerConfig,
  LogLevel,
  shouldLog,
  redactSensitiveData
} from './config/logger.config';

export {
  getValidationConfig,
  validateValidationConfig,
  ValidationRules,
  ValidationMessages,
  CustomValidatorsConfig
} from './config/validation.config';

export {
  getCurrentEnvironment,
  getEnvironmentConfig,
  isProduction,
  isDevelopment,
  isStaging,
  isTest,
  getFeatureFlags,
  isFeatureEnabled
} from './config/environment.config';

// Constants
export {
  ErrorCodes,
  ErrorMessages,
  HttpStatus
} from './constants/error.constants';

export {
  UserRole,
  RoleHierarchy,
  RoleDisplayNames,
  RolePermissions,
  hasPermission,
  canAccessResource,
  getRolePermissions,
  hasHigherOrEqualHierarchy
} from './constants/role.constants';

export {
  BookingStatus,
  ServiceStatus,
  StaffStatus,
  CustomerStatus,
  SalonStatus,
  InventoryStatus,
  OrderStatus,
  PaymentStatus,
  BookingStatusDisplay,
  ServiceStatusDisplay,
  StaffStatusDisplay,
  CustomerStatusDisplay,
  SalonStatusDisplay,
  InventoryStatusDisplay,
  OrderStatusDisplay,
  PaymentStatusDisplay,
  ValidStatusTransitions
} from './constants/status.constants';

export {
  CacheTTL,
  CacheKeyPrefix,
  CacheKeyPatterns,
  CacheStrategy,
  CacheInvalidationRules,
  CacheSizeLimits,
  CacheConfig
} from './constants/cache.constants';

// ============================================================================
// API Version Information
// ============================================================================

export const API_VERSION = '1.0.0';
export const API_NAME = 'Salon Management API';
export const API_DESCRIPTION = 'API for Salon Management System';

// ============================================================================
// API Information
// ============================================================================

export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  environment: string;
  timestamp: string;
}

/**
 * Get API information
 */
export function getApiInfo(): ApiInfo {
  return {
    name: API_NAME,
    version: API_VERSION,
    description: API_DESCRIPTION,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  version: API_VERSION,
  name: API_NAME,
  description: API_DESCRIPTION,
  getApiInfo
};
