import { supabase } from '../supabase';

export type UserRole = 'super_admin' | 'salon_owner' | 'staff' | 'customer';

export interface Permission {
  resource: string;
  action: string;
  condition?: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Role-based permission definitions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // System management
    { resource: 'system', action: 'manage' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'salons', action: 'create' },
    { resource: 'salons', action: 'read' },
    { resource: 'salons', action: 'update' },
    { resource: 'salons', action: 'delete' },
    { resource: 'analytics', action: 'read' },
    { resource: 'settings', action: 'manage' },
  ],
  salon_owner: [
    // Salon management
    { resource: 'salon', action: 'read', condition: 'own_salon' },
    { resource: 'salon', action: 'update', condition: 'own_salon' },
    { resource: 'staff', action: 'create', condition: 'own_salon' },
    { resource: 'staff', action: 'read', condition: 'own_salon' },
    { resource: 'staff', action: 'update', condition: 'own_salon' },
    { resource: 'staff', action: 'delete', condition: 'own_salon' },
    { resource: 'services', action: 'create', condition: 'own_salon' },
    { resource: 'services', action: 'read', condition: 'own_salon' },
    { resource: 'services', action: 'update', condition: 'own_salon' },
    { resource: 'services', action: 'delete', condition: 'own_salon' },
    { resource: 'bookings', action: 'read', condition: 'own_salon' },
    { resource: 'bookings', action: 'update', condition: 'own_salon' },
    { resource: 'bookings', action: 'delete', condition: 'own_salon' },
    { resource: 'customers', action: 'read', condition: 'own_salon' },
    { resource: 'customers', action: 'update', condition: 'own_salon' },
    { resource: 'customers', action: 'delete', condition: 'own_salon' },
    { resource: 'inventory', action: 'read', condition: 'own_salon' },
    { resource: 'inventory', action: 'update', condition: 'own_salon' },
    { resource: 'inventory', action: 'delete', condition: 'own_salon' },
    { resource: 'vendors', action: 'create', condition: 'own_salon' },
    { resource: 'vendors', action: 'read', condition: 'own_salon' },
    { resource: 'vendors', action: 'update', condition: 'own_salon' },
    { resource: 'vendors', action: 'delete', condition: 'own_salon' },
    { resource: 'products', action: 'create', condition: 'own_salon' },
    { resource: 'products', action: 'read', condition: 'own_salon' },
    { resource: 'products', action: 'update', condition: 'own_salon' },
    { resource: 'products', action: 'delete', condition: 'own_salon' },
    { resource: 'orders', action: 'read', condition: 'own_salon' },
    { resource: 'orders', action: 'update', condition: 'own_salon' },
    { resource: 'orders', action: 'delete', condition: 'own_salon' },
    { resource: 'analytics', action: 'read', condition: 'own_salon' },
    { resource: 'reports', action: 'read', condition: 'own_salon' },
  ],
  staff: [
    // Staff operations
    { resource: 'bookings', action: 'read', condition: 'own_bookings' },
    { resource: 'bookings', action: 'update', condition: 'own_bookings' },
    { resource: 'services', action: 'read', condition: 'own_salon' },
    { resource: 'customers', action: 'read', condition: 'own_salon' },
    { resource: 'schedule', action: 'read', condition: 'own_schedule' },
    { resource: 'schedule', action: 'update', condition: 'own_schedule' },
    { resource: 'profile', action: 'read', condition: 'own_profile' },
    { resource: 'profile', action: 'update', condition: 'own_profile' },
  ],
  customer: [
    // Customer operations
    { resource: 'bookings', action: 'create', condition: 'own_bookings' },
    { resource: 'bookings', action: 'read', condition: 'own_bookings' },
    { resource: 'bookings', action: 'update', condition: 'own_bookings' },
    { resource: 'bookings', action: 'delete', condition: 'own_bookings' },
    { resource: 'services', action: 'read', condition: 'own_salon' },
    { resource: 'salons', action: 'read' },
    { resource: 'profile', action: 'read', condition: 'own_profile' },
    { resource: 'profile', action: 'update', condition: 'own_profile' },
  ],
};

export class RoleService {
  // Get user role from auth
  static async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data?.role as UserRole || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
  }

  // Get user salon ID
  static async getUserSalonId(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('salon_id')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data?.salon_id || null;
    } catch (error) {
      console.error('Error getting user salon ID:', error);
      throw error;
    }
  }

  // Check if user has specific permission
  static async hasPermission(
    userId: string,
    resource: string,
    action: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      // Get user role
      const role = await this.getUserRole(userId);
      if (!role) return false;

      // Get role permissions
      const permissions = ROLE_PERMISSIONS[role] || [];

      // Check for matching permission
      const hasPermission = permissions.some(
        (p) =>
          p.resource === resource &&
          p.action === action &&
          this.checkCondition(p.condition, userId, resourceId)
      );

      return hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Check permission condition
  private static checkCondition(
    condition: string | undefined,
    userId: string,
    resourceId?: string
  ): boolean {
    if (!condition) return true;

    switch (condition) {
      case 'own_salon':
        // Check if resource belongs to user's salon
        return this.checkOwnSalon(userId, resourceId);
      case 'own_bookings':
        // Check if booking belongs to user
        return this.checkOwnBooking(userId, resourceId);
      case 'own_schedule':
        // Check if schedule belongs to user
        return this.checkOwnSchedule(userId, resourceId);
      case 'own_profile':
        // Check if profile belongs to user
        return resourceId === userId;
      default:
        return true;
    }
  }

  // Check if resource belongs to user's salon
  private static async checkOwnSalon(userId: string, resourceId?: string): Promise<boolean> {
    if (!resourceId) return false;

    try {
      const salonId = await this.getUserSalonId(userId);
      if (!salonId) return false;

      // Check if resource belongs to salon
      const { data, error } = await supabase
        .from('salons')
        .select('id')
        .eq('id', resourceId)
        .eq('id', salonId)
        .single();

      if (error) return false;

      return !!data;
    } catch (error) {
      return false;
    }
  }

  // Check if booking belongs to user
  private static async checkOwnBooking(userId: string, resourceId?: string): Promise<boolean> {
    if (!resourceId) return false;

    try {
      const role = await this.getUserRole(userId);

      if (role === 'customer') {
        // Check if booking belongs to customer
        const { data, error } = await supabase
          .from('bookings')
          .select('customer_id')
          .eq('id', resourceId)
          .eq('customer_id', userId)
          .single();

        if (error) return false;

        return !!data;
      } else if (role === 'staff') {
        // Check if booking is assigned to staff
        const { data, error } = await supabase
          .from('bookings')
          .select('staff_member_id')
          .eq('id', resourceId)
          .eq('staff_member_id', userId)
          .single();

        if (error) return false;

        return !!data;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  // Check if schedule belongs to user
  private static async checkOwnSchedule(userId: string, resourceId?: string): Promise<boolean> {
    if (!resourceId) return false;

    try {
      const { data, error } = await supabase
        .from('staff_schedules')
        .select('staff_id')
        .eq('id', resourceId)
        .eq('staff_id', userId)
        .single();

      if (error) return false;

      return !!data;
    } catch (error) {
      return false;
    }
  }

  // Get all permissions for a role
  static getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  // Check if user can access a specific screen/route
  static async canAccessRoute(userId: string, route: string): Promise<boolean> {
    try {
      const role = await this.getUserRole(userId);
      if (!role) return false;

      // Route to permission mapping
      const routePermissions: Record<string, { resource: string; action: string }> = {
        '/dashboard': { resource: 'analytics', action: 'read' },
        '/salons': { resource: 'salons', action: 'read' },
        '/salons/create': { resource: 'salons', action: 'create' },
        '/staff': { resource: 'staff', action: 'read' },
        '/staff/create': { resource: 'staff', action: 'create' },
        '/services': { resource: 'services', action: 'read' },
        '/services/create': { resource: 'services', action: 'create' },
        '/bookings': { resource: 'bookings', action: 'read' },
        '/bookings/create': { resource: 'bookings', action: 'create' },
        '/customers': { resource: 'customers', action: 'read' },
        '/customers/create': { resource: 'customers', action: 'create' },
        '/inventory': { resource: 'inventory', action: 'read' },
        '/inventory/create': { resource: 'inventory', action: 'create' },
        '/vendors': { resource: 'vendors', action: 'read' },
        '/vendors/create': { resource: 'vendors', action: 'create' },
        '/products': { resource: 'products', action: 'read' },
        '/products/create': { resource: 'products', action: 'create' },
        '/orders': { resource: 'orders', action: 'read' },
        '/orders/create': { resource: 'orders', action: 'create' },
        '/analytics': { resource: 'analytics', action: 'read' },
        '/reports': { resource: 'reports', action: 'read' },
        '/settings': { resource: 'settings', action: 'manage' },
        '/profile': { resource: 'profile', action: 'read' },
        '/schedule': { resource: 'schedule', action: 'read' },
      };

      const permission = routePermissions[route];
      if (!permission) return true; // Allow access if no specific permission required

      return await this.hasPermission(userId, permission.resource, permission.action);
    } catch (error) {
      console.error('Error checking route access:', error);
      return false;
    }
  }

  // Get accessible routes for a user
  static async getAccessibleRoutes(userId: string): Promise<string[]> {
    try {
      const role = await this.getUserRole(userId);
      if (!role) return [];

      const permissions = this.getRolePermissions(role);
      const accessibleRoutes: string[] = [];

      // Route to permission mapping
      const routePermissions: Record<string, { resource: string; action: string }> = {
        '/dashboard': { resource: 'analytics', action: 'read' },
        '/salons': { resource: 'salons', action: 'read' },
        '/salons/create': { resource: 'salons', action: 'create' },
        '/staff': { resource: 'staff', action: 'read' },
        '/staff/create': { resource: 'staff', action: 'create' },
        '/services': { resource: 'services', action: 'read' },
        '/services/create': { resource: 'services', action: 'create' },
        '/bookings': { resource: 'bookings', action: 'read' },
        '/bookings/create': { resource: 'bookings', action: 'create' },
        '/customers': { resource: 'customers', action: 'read' },
        '/customers/create': { resource: 'customers', action: 'create' },
        '/inventory': { resource: 'inventory', action: 'read' },
        '/inventory/create': { resource: 'inventory', action: 'create' },
        '/vendors': { resource: 'vendors', action: 'read' },
        '/vendors/create': { resource: 'vendors', action: 'create' },
        '/products': { resource: 'products', action: 'read' },
        '/products/create': { resource: 'products', action: 'create' },
        '/orders': { resource: 'orders', action: 'read' },
        '/orders/create': { resource: 'orders', action: 'create' },
        '/analytics': { resource: 'analytics', action: 'read' },
        '/reports': { resource: 'reports', action: 'read' },
        '/settings': { resource: 'settings', action: 'manage' },
        '/profile': { resource: 'profile', action: 'read' },
        '/schedule': { resource: 'schedule', action: 'read' },
      };

      for (const [route, permission] of Object.entries(routePermissions)) {
        const hasPermission = permissions.some(
          (p) =>
            p.resource === permission.resource &&
            p.action === permission.action
        );

        if (hasPermission) {
          accessibleRoutes.push(route);
        }
      }

      return accessibleRoutes;
    } catch (error) {
      console.error('Error getting accessible routes:', error);
      return [];
    }
  }

  // Update user role (admin only)
  static async updateUserRole(
    userId: string,
    newRole: UserRole,
    adminUserId: string
  ): Promise<void> {
    try {
      // Check if admin has permission
      const hasPermission = await this.hasPermission(adminUserId, 'users', 'update');
      if (!hasPermission) {
        throw new Error('Insufficient permissions to update user role');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Get user profile with role and salon info
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}
