/**
 * Common type definitions used across the API layer
 */

/**
 * Generic entity with common fields
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Entity with soft delete support
 */
export interface SoftDeleteEntity extends BaseEntity {
  deleted_at: string | null;
}

/**
 * Entity with audit fields
 */
export interface AuditedEntity extends BaseEntity {
  created_by: string;
  updated_by: string;
}

/**
 * Entity with both soft delete and audit fields
 */
export interface FullEntity extends SoftDeleteEntity, AuditedEntity {}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Query filter
 */
export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'notIn';
  value: any;
}

/**
 * Query sort
 */
export interface QuerySort {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Query options
 */
export interface QueryOptions {
  filters?: QueryFilter[];
  sort?: QuerySort[];
  pagination?: {
    page: number;
    limit: number;
  };
  select?: string[];
  relations?: string[];
}

/**
 * Date range
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Numeric range
 */
export interface NumberRange {
  min: number;
  max: number;
}

/**
 * Status enum
 */
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

/**
 * Role enum
 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  SALON_OWNER = 'salon_owner',
  STAFF = 'staff',
  CUSTOMER = 'customer'
}

/**
 * Permission enum
 */
export enum Permission {
  // Profile permissions
  PROFILE_READ = 'profile:read',
  PROFILE_WRITE = 'profile:write',
  PROFILE_DELETE = 'profile:delete',

  // Salon permissions
  SALON_READ = 'salon:read',
  SALON_WRITE = 'salon:write',
  SALON_DELETE = 'salon:delete',

  // Service permissions
  SERVICE_READ = 'service:read',
  SERVICE_WRITE = 'service:write',
  SERVICE_DELETE = 'service:delete',

  // Staff permissions
  STAFF_READ = 'staff:read',
  STAFF_WRITE = 'staff:write',
  STAFF_DELETE = 'staff:delete',

  // Customer permissions
  CUSTOMER_READ = 'customer:read',
  CUSTOMER_WRITE = 'customer:write',
  CUSTOMER_DELETE = 'customer:delete',

  // Booking permissions
  BOOKING_READ = 'booking:read',
  BOOKING_WRITE = 'booking:write',
  BOOKING_DELETE = 'booking:delete',

  // Vendor permissions
  VENDOR_READ = 'vendor:read',
  VENDOR_WRITE = 'vendor:write',
  VENDOR_DELETE = 'vendor:delete',

  // Product permissions
  PRODUCT_READ = 'product:read',
  PRODUCT_WRITE = 'product:write',
  PRODUCT_DELETE = 'product:delete',

  // Inventory permissions
  INVENTORY_READ = 'inventory:read',
  INVENTORY_WRITE = 'inventory:write',
  INVENTORY_DELETE = 'inventory:delete',

  // Order permissions
  ORDER_READ = 'order:read',
  ORDER_WRITE = 'order:write',
  ORDER_DELETE = 'order:delete',

  // Analytics permissions
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_WRITE = 'analytics:write',

  // Settings permissions
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write'
}

/**
 * User context
 */
export interface UserContext {
  userId: string;
  role: Role;
  salonId?: string;
  permissions?: Permission[];
}

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * File upload
 */
export interface FileUpload {
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Address
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Contact info
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Business hours
 */
export interface BusinessHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

/**
 * Time slot
 */
export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

/**
 * Price
 */
export interface Price {
  amount: number;
  currency: string;
}

/**
 * Discount
 */
export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
}

/**
 * Rating
 */
export interface Rating {
  average: number;
  count: number;
  distribution: Record<number, number>;
}
