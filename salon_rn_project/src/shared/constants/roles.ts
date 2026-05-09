export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'STAFF'
  | 'CUSTOMER'
  | 'VENDOR';

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Salon Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
  CUSTOMER: 'Customer',
  VENDOR: 'Vendor',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: '#6f42c1',
  OWNER: '#007bff',
  MANAGER: '#28a745',
  STAFF: '#17a2b8',
  CUSTOMER: '#fd7e14',
  VENDOR: '#dc3545',
};

export const PERMISSIONS = {
  // System
  SYSTEM_CONFIG: 'system.config',

  // Salon
  SALON_VIEW: 'salon.view',
  SALON_EDIT: 'salon.edit',
  SALON_DELETE: 'salon.delete',

  // Staff
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_EDIT: 'staff.edit',
  STAFF_DELETE: 'staff.delete',
  STAFF_SCHEDULE: 'staff.schedule',

  // Services
  SERVICE_VIEW: 'service.view',
  SERVICE_CREATE: 'service.create',
  SERVICE_EDIT: 'service.edit',
  SERVICE_DELETE: 'service.delete',

  // Bookings
  BOOKING_VIEW: 'booking.view',
  BOOKING_VIEW_OWN: 'booking.view_own',
  BOOKING_CREATE: 'booking.create',
  BOOKING_EDIT: 'booking.edit',
  BOOKING_CANCEL: 'booking.cancel',
  BOOKING_COMPLETE: 'booking.complete',

  // Customers
  CUSTOMER_VIEW: 'customer.view',
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_EDIT: 'customer.edit',
  CUSTOMER_DELETE: 'customer.delete',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  // Profile
  PROFILE_EDIT: 'profile.edit',

  // Inventory (Vendor)
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_MANAGE: 'inventory.manage',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_EDIT: 'product.edit',
  ORDER_VIEW: 'order.view',
  ORDER_CREATE: 'order.create',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ['*'],
  OWNER: [
    'salon.view', 'salon.edit',
    'staff.view', 'staff.create', 'staff.edit', 'staff.delete', 'staff.schedule',
    'service.view', 'service.create', 'service.edit', 'service.delete',
    'booking.view', 'booking.create', 'booking.edit', 'booking.cancel', 'booking.complete',
    'customer.view', 'customer.create', 'customer.edit', 'customer.delete',
    'reports.view', 'reports.export',
    'profile.edit',
  ],
  MANAGER: [
    'salon.view',
    'staff.view', 'staff.schedule',
    'service.view',
    'booking.view', 'booking.edit', 'booking.complete',
    'customer.view',
    'reports.view',
    'profile.edit',
  ],
  STAFF: [
    'service.view',
    'booking.view_own', 'booking.create',
    'profile.edit',
  ],
  CUSTOMER: [
    'service.view',
    'booking.create', 'booking.view_own',
    'profile.edit',
  ],
  VENDOR: [
    'inventory.view', 'inventory.manage',
    'product.create', 'product.edit',
    'order.view', 'order.create',
    'profile.edit',
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes('*' as Permission) || perms.includes(permission);
};
