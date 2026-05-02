import { supabase, Database } from './supabase';
import { UserRole, LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

export class AuthService {
  // Sign up with email and password
  static async signUp(credentials: RegisterCredentials) {
    const { email, password, role } = credentials;

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

    // Create user role entry
    if (data.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role,
        });

      if (roleError) throw roleError;

      // If owner, create salon
      if (role === 'OWNER' && credentials.salonName) {
        const { data: salonData, error: salonError } = await supabase
          .from('salons')
          .insert({
            name: credentials.salonName,
            owner_id: data.user.id,
          })
          .select()
          .single();

        if (salonError) throw salonError;

        // Update user role with salon_id
        await supabase
          .from('user_roles')
          .update({ salon_id: salonData.id })
          .eq('user_id', data.user.id);
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

  // Get user role from JWT
  static getUserRole(session?: any): UserRole | null {
    if (!session?.access_token) return null;

    try {
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));
      return payload.user_role || null;
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  // Get salon ID from JWT
  static getSalonId(session?: any): string | null {
    if (!session?.access_token) return null;

    try {
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));
      return payload.salon_id || null;
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

  // Check if user has specific permission
  static async hasPermission(permission: string, userId?: string) {
    const session = await this.getSession();
    const role = this.getUserRole(session);

    if (!role) return false;

    // For now, implement basic role checks
    // In production, this would query the role_permissions table
    switch (role) {
      case 'SUPER_ADMIN':
        return true;
      case 'OWNER':
        return !['system.config'].includes(permission);
      case 'MANAGER':
        return ['staff.view', 'booking.manage', 'reports.view', 'profile.edit'].includes(permission);
      case 'STAFF':
        return ['booking.create', 'profile.edit'].includes(permission);
      case 'VENDOR':
        return ['inventory.manage', 'profile.edit'].includes(permission);
      case 'CUSTOMER':
        return ['booking.create', 'profile.edit'].includes(permission);
      default:
        return false;
    }
  }
}