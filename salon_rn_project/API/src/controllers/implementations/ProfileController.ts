import { BaseController } from '../../core/base/BaseController';
import { IProfileController } from '../interfaces/IProfileController';
import { IProfileRepository } from '../../repositories/interfaces/IProfileRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Profile controller implementation
 */
export class ProfileController extends BaseController implements IProfileController {
  constructor(
    private profileRepository: IProfileRepository
  ) {
    super();
    this.logger = new Logger('ProfileController');
  }

  async getProfile(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const profile = await this.profileRepository.findById(id);

      if (!profile) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            code: 'NOT_FOUND_002',
            message: 'Profile not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateProfile(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const profileData = req.body;

      const profile = await this.profileRepository.update(id, profileData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: profile,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getCurrentProfile(req: any, res: any): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'AUTH_001',
            message: 'User not authenticated'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const profile = await this.profileRepository.findByUserId(userId);

      if (!profile) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            code: 'NOT_FOUND_002',
            message: 'Profile not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createProfile(req: any, res: any): Promise<void> {
    try {
      const profileData = req.body;

      const profile = await this.profileRepository.create(profileData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: profile,
        message: 'Profile created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteProfile(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.profileRepository.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Profile deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async uploadProfileImage(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;

      const profile = await this.profileRepository.update(id, { avatar_url: imageUrl });

      res.status(HttpStatus.OK).json({
        success: true,
        data: profile,
        message: 'Profile image uploaded successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updatePreferences(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { preferences } = req.body;

      const profile = await this.profileRepository.update(id, { preferences });

      res.status(HttpStatus.OK).json({
        success: true,
        data: profile,
        message: 'Preferences updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
