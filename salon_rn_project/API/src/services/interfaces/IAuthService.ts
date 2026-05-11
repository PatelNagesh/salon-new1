import { IService } from '../../core/interfaces/IService';

/**
 * Auth service interface
 */
export interface IAuthService {
  /**
   * Register a new user
   */
  register(email: string, password: string, role: string): Promise<any>;

  /**
   * Login user
   */
  login(email: string, password: string): Promise<any>;

  /**
   * Logout user
   */
  logout(): Promise<void>;

  /**
   * Get current user
   */
  getCurrentUser(): Promise<any>;

  /**
   * Refresh token
   */
  refreshToken(): Promise<any>;

  /**
   * Reset password
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Update password
   */
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
}
