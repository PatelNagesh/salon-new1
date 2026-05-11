import { IController } from '../../core/interfaces/IController';

/**
 * Profile controller interface
 */
export interface IProfileController extends IController {
  /**
   * Get profile by ID
   */
  getProfile(req: any, res: any): Promise<void>;

  /**
   * Get current user's profile
   */
  getCurrentProfile(req: any, res: any): Promise<void>;

  /**
   * Create profile
   */
  createProfile(req: any, res: any): Promise<void>;

  /**
   * Update profile
   */
  updateProfile(req: any, res: any): Promise<void>;

  /**
   * Delete profile
   */
  deleteProfile(req: any, res: any): Promise<void>;

  /**
   * Upload profile image
   */
  uploadProfileImage(req: any, res: any): Promise<void>;

  /**
   * Update profile preferences
   */
  updatePreferences(req: any, res: any): Promise<void>;
}
