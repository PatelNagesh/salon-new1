/**
 * Role constants for role-based access control
 */

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SALON_OWNER = 'salon_owner',
  STAFF_MEMBER = 'staff_member',
  CUSTOMER = 'customer'
}

/**
 * Role hierarchy - higher roles have more permissions
 */
export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.SALON_OWNER]: 75,
  [UserRole.STAFF_MEMBER]: 50,
  [UserRole.CUSTOMER]: 25
};

/**
 * Role display names
 */
export const RoleDisplayNames: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.SALON_OWNER]: 'Salon Owner',
  [UserRole.STAFF_MEMBER]: 'Staff Member',
  [UserRole.CUSTOMER]: 'Customer'
};

/**
 * Role permissions
 */
export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'manage_all_salons',
    'manage_all_users',
    'view_global_analytics',
    'configure_system',
    'manage_roles',
    'view_all_data'
  ],
  [UserRole.SALON_OWNER]: [
    'manage_own_salon',
    'manage_staff',
    'manage_customers',
    'manage_services',
    'manage_bookings',
    'manage_inventory',
    'manage_vendors',
    'view_salon_analytics',
    'manage_finances'
  ],
  [UserRole.STAFF_MEMBER]: [
    'view_own_schedule',
    'manage_own_bookings',
    'view_customer_history',
    'execute_services',
    'update_service_status'
  ],
  [UserRole.CUSTOMER]: [
    'book_appointments',
    'view_own_bookings',
    'view_own_profile',
    'browse_services',
    'cancel_own_bookings'
  ]
};

/**
 * Check if role has permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return RolePermissions[role]?.includes(permission) || false;
}

/**
 * Check if role can access resource
 */
export function canAccessResource(role: UserRole, resourceType: string, action: string): boolean {
  const permission = `${action}_${resourceType}`;
  return hasPermission(role, permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): string[] {
  return RolePermissions[role] || [];
}

/**
 * Check if role1 has higher or equal hierarchy than role2
 */
export function hasHigherOrEqualHierarchy(role1: UserRole, role2: UserRole): boolean {
  return RoleHierarchy[role1] >= RoleHierarchy[role2];
}
