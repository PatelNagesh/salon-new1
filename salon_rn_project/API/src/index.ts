/**
 * API Layer - Main Entry Point
 *
 * This is the main entry point for the API layer.
 * All controllers, services, repositories, and types are exported here.
 */

// Core exports
export * from './core';

// Configuration exports
export * from './config';

// Exception exports
export * from './exceptions';

// Re-export commonly used items for convenience
export { getSupabaseClient, getSupabaseAdminClient, resetSupabaseClients } from './config/supabase.config';
export { getCacheConfig, validateCacheConfig } from './config/cache.config';
export { getDatabaseConfig, validateDatabaseConfig } from './config/database.config';
