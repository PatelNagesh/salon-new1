/**
 * Status constants for various entities
 */

/**
 * Booking status
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

/**
 * Booking status display names
 */
export const BookingStatusDisplay: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Pending',
  [BookingStatus.CONFIRMED]: 'Confirmed',
  [BookingStatus.IN_PROGRESS]: 'In Progress',
  [BookingStatus.COMPLETED]: 'Completed',
  [BookingStatus.CANCELLED]: 'Cancelled',
  [BookingStatus.NO_SHOW]: 'No Show'
};

/**
 * Service status
 */
export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
};

/**
 * Service status display names
 */
export const ServiceStatusDisplay: Record<ServiceStatus, string> = {
  [ServiceStatus.ACTIVE]: 'Active',
  [ServiceStatus.INACTIVE]: 'Inactive',
  [ServiceStatus.ARCHIVED]: 'Archived'
};

/**
 * Staff status
 */
export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated'
};

/**
 * Staff status display names
 */
export const StaffStatusDisplay: Record<StaffStatus, string> = {
  [StaffStatus.ACTIVE]: 'Active',
  [StaffStatus.INACTIVE]: 'Inactive',
  [StaffStatus.ON_LEAVE]: 'On Leave',
  [StaffStatus.TERMINATED]: 'Terminated'
};

/**
 * Customer status
 */
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
};

/**
 * Customer status display names
 */
export const CustomerStatusDisplay: Record<CustomerStatus, string> = {
  [CustomerStatus.ACTIVE]: 'Active',
  [CustomerStatus.INACTIVE]: 'Inactive',
  [CustomerStatus.BLOCKED]: 'Blocked'
};

/**
 * Salon status
 */
export enum SalonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
};

/**
 * Salon status display names
 */
export const SalonStatusDisplay: Record<SalonStatus, string> = {
  [SalonStatus.ACTIVE]: 'Active',
  [SalonStatus.INACTIVE]: 'Inactive',
  [SalonStatus.SUSPENDED]: 'Suspended'
};

/**
 * Inventory status
 */
export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
};

/**
 * Inventory status display names
 */
export const InventoryStatusDisplay: Record<InventoryStatus, string> = {
  [InventoryStatus.IN_STOCK]: 'In Stock',
  [InventoryStatus.LOW_STOCK]: 'Low Stock',
  [InventoryStatus.OUT_OF_STOCK]: 'Out of Stock',
  [InventoryStatus.DISCONTINUED]: 'Discontinued'
};

/**
 * Order status
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
};

/**
 * Order status display names
 */
export const OrderStatusDisplay: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled'
};

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
};

/**
 * Payment status display names
 */
export const PaymentStatusDisplay: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.COMPLETED]: 'Completed',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.REFUNDED]: 'Refunded'
};

/**
 * Valid status transitions
 */
export const ValidStatusTransitions = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.NO_SHOW]: []
};
