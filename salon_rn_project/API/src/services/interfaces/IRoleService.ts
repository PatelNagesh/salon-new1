/**
 * Role service interface
 */
export interface IRoleService {
  /**
   * Get user role
   */
  getUserRole(userId: string): Promise<string>;

  /**
   * Check if user has permission
   */
  hasPermission(userId: string, permission: string): Promise<boolean>;

  /**
   * Check if user can access resource
   */
  canAccessResource(userId: string, resourceType: string, action: string, resourceId?: string): Promise<boolean>;

  /**
   * Get user permissions
   */
  getUserPermissions(userId: string): Promise<string[]>;

  /**
   * Assign role to user
   */
  assignRole(userId: string, role: string): Promise<any>;

  /**
   * Remove role from user
   */
  removeRole(userId: string, role: string): Promise<any>;

  /**
   * Get all roles
   */
  getAllRoles(): Promise<any[]>;

  /**
   * Get role permissions
   */
  getRolePermissions(role: string): Promise<string[]>;

  /**
   * Update role permissions
   */
  updateRolePermissions(role: string, permissions: string[]): Promise<any>;
}
