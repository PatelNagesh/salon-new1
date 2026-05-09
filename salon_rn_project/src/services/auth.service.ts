import { supabase, Database } from './supabase';
import { UserRole, LoginCredentials, RegisterCredentials, User } from '../types/auth.types';
import { decode as atob } from 'base-64';

export class AuthService {
  // Sign up with email and password
  static async signUp(credentials: RegisterCredentials) {
    const { email, password, role, salonName } = credentials;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_role: role,
        },
      },
    });

    if (error) throw error;

    // Wait for the trigger to create the profile and default role
    if (data.user) {
      // Update the user role using our secure function
      let salonId = null;

      // If owner, create salon first
      if (role === 'OWNER' && salonName) {
        const { data: salonData, error: salonError } = await supabase.rpc('create_owner_salon', {
          salon_name: salonName,
          owner_user_id: data.user.id
        });

        if (salonError) throw salonError;
        salonId = salonData;
      }

      // Update user role
      if (role !== 'CUSTOMER') {
        const { error: updateError } = await supabase.rpc('update_user_role', {
          user_id: data.user.id,
          new_role: role,
          salon_id: salonId
        });

        if (updateError) throw updateError;
      }
    }

    return data;
  }

  // Sign in with email and password
  static async signIn(credentials: LoginCredentials) {
    const { email, password, role } = credentials;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Update role if different
    if (role && data.user) {
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', data.user.id);

      if (updateError) console.warn('Role update failed:', updateError);
    }

    return data;
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current session
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  // Get user role from JWT with better parsing
  static getUserRole(session?: any): UserRole | null {
    if (!session?.access_token) return null;

    try {
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));

      // Check multiple possible locations for role
      const role =
        payload.app_metadata?.user_role ||
        payload.user_role ||
        payload.user?.app_metadata?.user_role ||
        payload.aud === 'authenticated' ? 'CUSTOMER' : null;

      return role as UserRole || null;
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  // Get salon ID from JWT with better parsing
  static getSalonId(session?: any): string | null {
    if (!session?.access_token) return null;

    try {
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));

      // Check multiple possible locations for salon_id
      const salonId =
        payload.app_metadata?.salon_id ||
        payload.salon_id ||
        payload.user?.app_metadata?.salon_id;

      return salonId || null;
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        salon: salons(id, name)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Check if user has specific permission using database function
  static async hasPermission(permission: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_permission', {
        permission_name: permission
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      // Fallback to role-based checks if RPC fails
      const session = await this.getSession();
      const role = this.getUserRole(session);

      if (!role) return false;

      switch (role) {
        case 'SUPER_ADMIN':
          return true;
        case 'OWNER':
          return !['system.config'].includes(permission);
        case 'MANAGER':
          return ['staff.view', 'booking.manage', 'reports.view', 'profile.edit'].includes(permission);
        case 'STAFF':
          return ['booking.create', 'booking.view_own', 'profile.edit'].includes(permission);
        case 'VENDOR':
          return ['inventory.manage', 'profile.edit', 'product.create'].includes(permission);
        case 'CUSTOMER':
          return ['booking.create', 'booking.view_own', 'profile.edit', 'service.view'].includes(permission);
        default:
          return false;
      }
    }
  }

  // Get all user salons with role information
  static async getUserSalons() {
    try {
      const { data, error } = await supabase.rpc('get_user_salons');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user salons:', error);
      return [];
    }
  }

  // Create salon for owner
  static async createOwnerSalon(salonName: string) {
    try {
      const { data, error } = await supabase.rpc('create_owner_salon', {
        salon_name: salonName
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating owner salon:', error);
      throw error;
    }
  }

  // Update user role using secure function
  static async updateUserRole(role: UserRole, salonId?: string) {
    try {
      const { error } = await supabase.rpc('update_user_role', {
        new_role: role,
        salon_id: salonId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Check if user is salon manager
  static async isSalonManager(salonId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_salon_manager', {
        salon_uuid: salonId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking salon manager status:', error);
      return false;
    }
  }
}