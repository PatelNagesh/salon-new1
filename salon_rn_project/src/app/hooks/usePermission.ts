import { useAuth } from './useAuth';
import { UserRole } from '../../types/auth.types';

/**
 * Permission Definition
 *
 * Defines the structure of a permission in the system.
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

/**
 * Role Permissions Mapping
 *
 * Maps each user role to their allowed permissions.
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    // System permissions
    'system.config',
    'system.monitor',
    'system.manage',

    // User management
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.roles.assign',

    // Salon management
    'salons.view',
    'salons.create',
    'salons.edit',
    'salons.delete',
    'salons.approve',

    // Reports
    'reports.view',
    'reports.export',
    'reports.advanced',

    // All other permissions
    '*',
  ],
  OWNER: [
    // Dashboard
    'dashboard.view',

    // Staff management
    'staff.view',
    'staff.create',
    'staff.edit',
    'staff.delete',
    'staff.schedule',
    'staff.payroll',

    // Services
    'services.view',
    'services.create',
    'services.edit',
    'services.delete',
    'services.pricing',

    // Bookings
    'booking.view',
    'booking.create',
    'booking.edit',
    'booking.delete',
    'booking.manage',
    'booking.cancel',

    // Customers
    'customers.view',
    'customers.create',
    'customers.edit',
    'customers.delete',

    // Reports
    'reports.view',
    'reports.export',

    // Settings
    'settings.view',
    'settings.edit',

    // Profile
    'profile.edit',
  ],
  MANAGER: [
    // Dashboard
    'dashboard.view',

    // Staff management
    'staff.view',
    'staff.schedule',

    // Services
    'services.view',
    'services.edit',

    // Bookings
    'booking.view',
    'booking.create',
    'booking.edit',
    'booking.manage',
    'booking.cancel',

    // Customers
    'customers.view',
    'customers.edit',

    // Reports
    'reports.view',

    // Profile
    'profile.edit',
  ],
  STAFF: [
    // Schedule
    'schedule.view',

    // Appointments
    'appointments.view',
    'appointments.create',

    // Customers
    'customers.view',

    // Services
    'services.view',

    // Profile
    'profile.edit',
  ],
  VENDOR: [
    // Inventory
    'inventory.view',
    'inventory.manage',
    'inventory.create',
    'inventory.edit',
    'inventory.delete',

    // Orders
    'orders.view',
    'orders.create',
    'orders.edit',
    'orders.cancel',

    // Products
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',

    // Profile
    'profile.edit',
  ],
  CUSTOMER: [
    // Bookings
    'booking.create',
    'booking.view',
    'booking.cancel',

    // Services
    'services.view',

    // Profile
    'profile.edit',
  ],
};

/**
 * usePermission Hook
 *
 * Provides permission checking functionality for role-based access control.
 *
 * @returns {Object} Permission checking methods
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * const { hasPermission, canView, canEdit, canDelete } = usePermission();
 *
 * if (hasPermission('staff.create')) {
 *   // Show create staff button
 * }
 *
 * if (canEdit('staff')) {
 *   // Show edit button for staff
 * }
 * ```
 */
export const usePermission = () => {
  const { role, hasPermission: authHasPermission } = useAuth();

  /**
   * Check if the current user has a specific permission.
   *
   * @param {string} permission - The permission to check
   * @returns {boolean} True if the user has the permission, false otherwise
   */
  const hasPermission = (permission: string): boolean => {
    if (!role) {
      return false;
    }

    const userRole = role as UserRole;

    // Check for wildcard permission (super admin)
    if (ROLE_PERMISSIONS[userRole].includes('*')) {
      return true;
    }

    // Check for exact permission match
    if (ROLE_PERMISSIONS[userRole].includes(permission)) {
      return true;
    }

    // Check for wildcard resource permission (e.g., 'staff.*')
    const [resource] = permission.split('.');
    const wildcardPermission = `${resource}.*`;
    if (ROLE_PERMISSIONS[userRole].includes(wildcardPermission)) {
      return true;
    }

    return false;
  };

  /**
   * Check if the current user can view a specific resource.
   *
   * @param {string} resource - The resource to check (e.g., 'staff', 'services')
   * @returns {boolean} True if the user can view the resource, false otherwise
   */
  const canView = (resource: string): boolean => {
    return hasPermission(`${resource}.view`) || hasPermission(`${resource}.*`);
  };

  /**
   * Check if the current user can create a specific resource.
   *
   * @param {string} resource - The resource to check (e.g., 'staff', 'services')
   * @returns {boolean} True if the user can create the resource, false otherwise
   */
  const canCreate = (resource: string): boolean => {
    return hasPermission(`${resource}.create`) || hasPermission(`${resource}.*`);
  };

  /**
   * Check if the current user can edit a specific resource.
   *
   * @param {string} resource - The resource to check (e.g., 'staff', 'services')
   * @returns {boolean} True if the user can edit the resource, false otherwise
   */
  const canEdit = (resource: string): boolean => {
    return hasPermission(`${resource}.edit`) || hasPermission(`${resource}.*`);
  };

  /**
   * Check if the current user can delete a specific resource.
   *
   * @param {string} resource - The resource to check (e.g., 'staff', 'services')
   * @returns {boolean} True if the user can delete the resource, false otherwise
   */
  const canDelete = (resource: string): boolean => {
    return hasPermission(`${resource}.delete`) || hasPermission(`${resource}.*`);
  };

  /**
   * Check if the current user can manage a specific resource.
   *
   * @param {string} resource - The resource to check (e.g., 'staff', 'services')
   * @returns {boolean} True if the user can manage the resource, false otherwise
   */
  const canManage = (resource: string): boolean => {
    return hasPermission(`${resource}.manage`) || hasPermission(`${resource}.*`);
  };

  /**
   * Get all permissions for the current user's role.
   *
   * @returns {string[]} Array of permission strings
   */
  const getPermissions = (): string[] => {
    if (!role) {
      return [];
    }
    return ROLE_PERMISSIONS[role as UserRole] || [];
  };

  /**
   * Check if the current user has any of the specified permissions.
   *
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean} True if the user has any of the permissions, false otherwise
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Check if the current user has all of the specified permissions.
   *
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean} True if the user has all of the permissions, false otherwise
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,
    getPermissions,
    hasAnyPermission,
    hasAllPermissions,
  };
};

/**
 * useRequirePermission Hook
 *
 * Throws an error if the current user doesn't have the required permission.
 * Useful for protecting routes or components.
 *
 * @param {string} permission - The required permission
 * @throws {Error} If the user doesn't have the required permission
 *
 * @example
 * ```tsx
 * useRequirePermission('staff.create');
 * // Will throw error if user doesn't have permission
 * ```
 */
export const useRequirePermission = (permission: string): void => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    throw new Error(`Permission denied: ${permission} required`);
  }
};

/**
 * useRequireRole Hook
 *
 * Throws an error if the current user doesn't have the required role.
 * Useful for protecting routes or components.
 *
 * @param {UserRole} requiredRole - The required role
 * @throws {Error} If the user doesn't have the required role
 *
 * @example
 * ```tsx
 * useRequireRole('OWNER');
 * // Will throw error if user is not an owner
 * ```
 */
export const useRequireRole = (requiredRole: UserRole): void => {
  const { role } = useAuth();

  if (role !== requiredRole) {
    throw new Error(`Role required: ${requiredRole}`);
  }
};

/**
 * useRequireAnyRole Hook
 *
 * Throws an error if the current user doesn't have any of the required roles.
 * Useful for protecting routes or components.
 *
 * @param {UserRole[]} requiredRoles - Array of required roles
 * @throws {Error} If the user doesn't have any of the required roles
 *
 * @example
 * ```tsx
 * useRequireAnyRole(['OWNER', 'MANAGER']);
 * // Will throw error if user is not an owner or manager
 * ```
 */
export const useRequireAnyRole = (requiredRoles: UserRole[]): void => {
  const { role } = useAuth();

  if (!role || !requiredRoles.includes(role)) {
    throw new Error(`One of these roles required: ${requiredRoles.join(', ')}`);
  }
};
