/**
 * Cache configuration
 */

export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}

/**
 * Get cache configuration from environment variables
 */
export function getCacheConfig(): CacheConfig {
  return {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300'),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
    cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || '60000'),
    strategy: (process.env.CACHE_STRATEGY as 'lru' | 'fifo' | 'lfu') || 'lru'
  };
}

/**
 * Validate cache configuration
 */
export function validateCacheConfig(config: CacheConfig): boolean {
  if (config.defaultTTL < 0) {
    throw new Error('Cache default TTL must be non-negative');
  }

  if (config.maxSize < 1) {
    throw new Error('Cache max size must be at least 1');
  }

  if (config.cleanupInterval < 1000) {
    throw new Error('Cache cleanup interval must be at least 1000ms');
  }

  if (!['lru', 'fifo', 'lfu'].includes(config.strategy)) {
    throw new Error('Cache strategy must be one of: lru, fifo, lfu');
  }

  return true;
}

/**
 * Cache configuration for different environments
 */
export const cacheConfigs = {
  development: {
    enabled: true,
    defaultTTL: 300,
    maxSize: 100,
    cleanupInterval: 60000,
    strategy: 'lru' as const
  },
  staging: {
    enabled: true,
    defaultTTL: 600,
    maxSize: 500,
    cleanupInterval: 60000,
    strategy: 'lru' as const
  },
  production: {
    enabled: true,
    defaultTTL: 3600,
    maxSize: 1000,
    cleanupInterval: 60000,
    strategy: 'lru' as const
  }
};

/**
 * Get cache configuration for current environment
 */
export function getCacheConfigForEnvironment(env?: string): CacheConfig {
  const environment = env || process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'staging':
      return cacheConfigs.staging;
    case 'production':
      return cacheConfigs.production;
    default:
      return cacheConfigs.development;
  }
}

/**
 * Cache TTL presets
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  NEVER: 0 // Never expire
} as const;

/**
 * Cache key prefixes
 */
export const CacheKeyPrefixes = {
  ENTITY: 'entity',
  LIST: 'list',
  USER: 'user',
  SALON: 'salon',
  SERVICE: 'service',
  BOOKING: 'booking',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  INVENTORY: 'inventory',
  PRODUCT: 'product',
  ORDER: 'order',
  VENDOR: 'vendor',
  STATS: 'stats',
  SEARCH: 'search',
  AUTOCOMPLETE: 'autocomplete'
} as const;

/**
 * Build cache key
 */
export function buildCacheKey(prefix: string, identifier: string, ...parts: string[]): string {
  const keyParts = [prefix, identifier, ...parts].filter(Boolean);
  return keyParts.join(':');
}

/**
 * Build entity cache key
 */
export function buildEntityCacheKey(entityType: string, entityId: string): string {
  return buildCacheKey(CacheKeyPrefixes.ENTITY, entityType, entityId);
}

/**
 * Build list cache key
 */
export function buildListCacheKey(entityType: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return buildCacheKey(CacheKeyPrefixes.LIST, entityType, paramString);
}

/**
 * Build user cache key
 */
export function buildUserCacheKey(userId: string, dataType: string): string {
  return buildCacheKey(CacheKeyPrefixes.USER, userId, dataType);
}

/**
 * Build salon cache key
 */
export function buildSalonCacheKey(salonId: string, dataType: string): string {
  return buildCacheKey(CacheKeyPrefixes.SALON, salonId, dataType);
}

/**
 * Build service cache key
 */
export function buildServiceCacheKey(serviceId: string, dataType?: string): string {
  return buildCacheKey(CacheKeyPrefixes.SERVICE, serviceId, dataType || '');
}

/**
 * Build booking cache key
 */
export function buildBookingCacheKey(bookingId: string, dataType?: string): string {
  return buildCacheKey(CacheKeyPrefixes.BOOKING, bookingId, dataType || '');
}

/**
 * Build customer cache key
 */
export function buildCustomerCacheKey(customerId: string, dataType?: string): string {
  return buildCacheKey(CacheKeyPrefixes.CUSTOMER, customerId, dataType || '');
}

/**
 * Build staff cache key
 */
export function buildStaffCacheKey(staffId: string, dataType?: string): string {
  return buildCacheKey(CacheKeyPrefixes.STAFF, staffId, dataType || '');
}

/**
 * Build inventory cache key
 */
export function buildInventoryCacheKey(inventoryId: string, dataType?: string): string {
  return buildCacheKey(CacheKeyPrefixes.INVENTORY, inventoryId, dataType || '');
}

/**
 * Build product cache key
 */
export function buildProductCacheKey(productId: string, dataType?: string): string {
  return buildCacheKey(CacheKeyPrefixes.PRODUCT, productId, dataType || '');
}

/**
 * Build order cache key
 */
export function buildOrderCacheKey(orderId: string, dataType?: string): string {
  return buildCacheKey(CacheKeyPrefixes.ORDER, orderId, dataType || '');
}

/**
 * Build vendor cache key
 */
export function buildVendorCacheKey(vendorId: string, dataType?: string): string {
  return buildCacheKey(CacheKeyPrefixes.VENDOR, vendorId, dataType || '');
}

/**
 * Build stats cache key
 */
export function buildStatsCacheKey(statsType: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return buildCacheKey(CacheKeyPrefixes.STATS, statsType, paramString);
}

/**
 * Build search cache key
 */
export function buildSearchCacheKey(searchType: string, query: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return buildCacheKey(CacheKeyPrefixes.SEARCH, searchType, query, paramString);
}

/**
 * Build autocomplete cache key
 */
export function buildAutocompleteCacheKey(autocompleteType: string, query: string): string {
  return buildCacheKey(CacheKeyPrefixes.AUTOCOMPLETE, autocompleteType, query);
}

/**
 * Parse cache key
 */
export function parseCacheKey(key: string): {
  prefix: string;
  identifier: string;
  parts: string[];
} {
  const parts = key.split(':');
  const prefix = parts[0] || '';
  const identifier = parts[1] || '';
  const remainingParts = parts.slice(2);

  return {
    prefix,
    identifier,
    parts: remainingParts
  };
}

/**
 * Check if cache key matches pattern
 */
export function matchesCachePattern(key: string, pattern: string): boolean {
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  return regex.test(key);
}

/**
 * Get cache key type
 */
export function getCacheKeyType(key: string): string {
  const parsed = parseCacheKey(key);
  return parsed.prefix;
}
