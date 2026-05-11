import { BaseService } from '../../core/base/BaseService';
import { IAuthService } from '../interfaces/IAuthService';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { AuthException, ValidationException } from '../../exceptions';

/**
 * Auth service implementation
 */
export class AuthService extends BaseService implements IAuthService {
  private logger = new Logger('AuthService');

  async register(email: string, password: string, role: string): Promise<any> {
    this.logger.info('Registering user:', { email, role });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    });

    if (error) {
      this.logger.error('Registration error:', error);
      throw new AuthException('AUTH_001', 'Registration failed', error.message);
    }

    return {
      user: data.user,
      session: data.session
    };
  }

  async login(email: string, password: string): Promise<any> {
    this.logger.info('Logging in user:', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      this.logger.error('Login error:', error);
      throw new AuthException('AUTH_001', 'Invalid credentials', error.message);
    }

    return {
      user: data.user,
      session: data.session
    };
  }

  async logout(): Promise<void> {
    this.logger.info('Logging out user');

    const { error } = await supabase.auth.signOut();

    if (error) {
      this.logger.error('Logout error:', error);
      throw new AuthException('AUTH_005', 'Logout failed', error.message);
    }
  }

  async getCurrentUser(): Promise<any> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      this.logger.error('Get current user error:', error);
      throw new AuthException('AUTH_003', 'Failed to get current user', error.message);
    }

    return user;
  }

  async refreshToken(): Promise<any> {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      this.logger.error('Refresh token error:', error);
      throw new AuthException('AUTH_002', 'Failed to refresh token', error.message);
    }

    return {
      user: data.user,
      session: data.session
    };
  }

  async resetPassword(email: string): Promise<void> {
    this.logger.info('Resetting password for:', { email });

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      this.logger.error('Reset password error:', error);
      throw new AuthException('AUTH_001', 'Failed to reset password', error.message);
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    this.logger.info('Updating password');

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      this.logger.error('Update password error:', error);
      throw new ValidationException('VAL_001', 'Failed to update password', error.message);
    }
  }
}
