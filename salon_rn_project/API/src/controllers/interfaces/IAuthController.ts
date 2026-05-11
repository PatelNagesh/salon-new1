import { IController } from '../../core/interfaces/IController';

/**
 * Auth controller interface
 */
export interface IAuthController extends IController {
  /**
   * Register a new user
   */
  register(req: any, res: any): Promise<void>;

  /**
   * Login user
   */
  login(req: any, res: any): Promise<void>;

  /**
   * Logout user
   */
  logout(req: any, res: any): Promise<void>;

  /**
   * Get current user
   */
  getCurrentUser(req: any, res: any): Promise<void>;

  /**
   * Refresh token
   */
  refreshToken(req: any, res: any): Promise<void>;

  /**
   * Reset password
   */
  resetPassword(req: any, res: any): Promise<void>;

  /**
   * Update password
   */
  updatePassword(req: any, res: any): Promise<void>;
}
