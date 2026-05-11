/**
 * Cache configuration constants
 */

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CacheTTL = {
  // Static data - 1 hour
  STATIC_DATA: 3600,

  // User data - 15 minutes
  USER_DATA: 900,

  // Dynamic data - 5 minutes
  DYNAMIC_DATA: 300,

  // Real-time data - no cache
  REALTIME_DATA: 0,

  // Short-term cache - 1 minute
  SHORT_TERM: 60,

  // Long-term cache - 24 hours
  LONG_TERM: 86400
} as const;

/**
 * Cache key prefixes
 */
export const CacheKeyPrefix = {
  ENTITY: 'entity',
  ENTITY_LIST: 'entity:list',
  USER_DATA: 'user',
  SALON_DATA: 'salon',
  SERVICE_DATA: 'service',
  BOOKING_DATA: 'booking',
  STAFF_DATA: 'staff',
  CUSTOMER_DATA: 'customer',
  INVENTORY_DATA: 'inventory',
  VENDOR_DATA: 'vendor',
  PRODUCT_DATA: 'product',
  ORDER_DATA: 'order'
} as const;

/**
 * Cache key patterns
 */
export const CacheKeyPatterns = {
  // Single entity
  ENTITY: (entityType: string, id: string): string =>
    `${CacheKeyPrefix.ENTITY}:${entityType}:${id}`,

  // Entity list
  ENTITY_LIST: (entityType: string): string =>
    `${CacheKeyPrefix.ENTITY_LIST}:${entityType}`,

  // Filtered entity list
  FILTERED_LIST: (entityType: string, query: string): string =>
    `${CacheKeyPrefix.ENTITY_LIST}:${entityType}:${query}`,

  // User specific data
  USER_DATA: (userId: string, dataType: string): string =>
    `${CacheKeyPrefix.USER_DATA}:${userId}:${dataType}`,

  // Salon specific data
  SALON_DATA: (salonId: string, dataType: string): string =>
    `${CacheKeyPrefix.SALON_DATA}:${salonId}:${dataType}`,

  // Service data
  SERVICE_DATA: (serviceId: string): string =>
    `${CacheKeyPrefix.SERVICE_DATA}:${serviceId}`,

  // Booking data
  BOOKING_DATA: (bookingId: string): string =>
    `${CacheKeyPrefix.BOOKING_DATA}:${bookingId}`,

  // Staff data
  STAFF_DATA: (staffId: string): string =>
    `${CacheKeyPrefix.STAFF_DATA}:${staffId}`,

  // Customer data
  CUSTOMER_DATA: (customerId: string): string =>
    `${CacheKeyPrefix.CUSTOMER_DATA}:${customerId}`,

  // Inventory data
  INVENTORY_DATA: (inventoryId: string): string =>
    `${CacheKeyPrefix.INVENTORY_DATA}:${inventoryId}`,

  // Vendor data
  VENDOR_DATA: (vendorId: string): string =>
    `${CacheKeyPrefix.VENDOR_DATA}:${vendorId}`,

  // Product data
  PRODUCT_DATA: (productId: string): string =>
    `${CacheKeyPrefix.PRODUCT_DATA}:${productId}`,

  // Order data
  ORDER_DATA: (orderId: string): string =>
    `${CacheKeyPrefix.ORDER_DATA}:${orderId}`
};

/**
 * Cache strategy for different entity types
 */
export const CacheStrategy = {
  // Static entities (services, salon info)
  STATIC: {
    ttl: CacheTTL.STATIC_DATA,
    invalidateOnUpdate: true
  },

  // User entities (profiles, preferences)
  USER: {
    ttl: CacheTTL.USER_DATA,
    invalidateOnUpdate: true
  },

  // Dynamic entities (bookings, inventory)
  DYNAMIC: {
    ttl: CacheTTL.DYNAMIC_DATA,
    invalidateOnUpdate: true
  },

  // Real-time entities (live bookings, notifications)
  REALTIME: {
    ttl: CacheTTL.REALTIME_DATA,
    invalidateOnUpdate: false
  }
};

/**
 * Cache invalidation rules
 */
export const CacheInvalidationRules = {
  // When a booking is created/updated, invalidate related caches
  BOOKING: [
    'entity:list:booking',
    'user:*:bookings',
    'salon:*:bookings',
    'staff:*:bookings'
  ],

  // When a service is updated, invalidate service caches
  SERVICE: [
    'entity:service:*',
    'entity:list:service',
    'salon:*:services'
  ],

  // When a staff member is updated, invalidate staff caches
  STAFF: [
    'entity:staff:*',
    'entity:list:staff',
    'salon:*:staff'
  ],

  // When inventory is updated, invalidate inventory caches
  INVENTORY: [
    'entity:inventory:*',
    'entity:list:inventory',
    'salon:*:inventory'
  ]
};

/**
 * Cache size limits (in bytes)
 */
export const CacheSizeLimits = {
  MAX_ENTITY_SIZE: 1024 * 1024, // 1MB
  MAX_LIST_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 100 * 1024 * 1024 // 100MB
};

/**
 * Cache configuration
 */
export const CacheConfig = {
  enabled: process.env.CACHE_ENABLED !== 'false',
  defaultTTL: CacheTTL.DYNAMIC_DATA,
  maxSize: CacheSizeLimits.MAX_TOTAL_SIZE,
  maxSizePerItem: CacheSizeLimits.MAX_ENTITY_SIZE,
  checkPeriod: 600, // Check for expired items every 10 minutes
  deleteOnExpire: true
};
