import { BaseController } from '../../core/base/BaseController';
import { IAuthController } from '../interfaces/IAuthController';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Auth controller implementation
 */
export class AuthController extends BaseController implements IAuthController {
  constructor(
    private authService: IAuthService
  ) {
    super();
    this.logger = new Logger('AuthController');
  }

  async register(req: any, res: any): Promise<void> {
    try {
      const { email, password, role } = req.body;

      const result = await this.authService.register(email, password, role);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
        message: 'User registered successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async login(req: any, res: any): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Login successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async logout(req: any, res: any): Promise<void> {
    try {
      await this.authService.logout();

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getCurrentUser(req: any, res: any): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();

      res.status(HttpStatus.OK).json({
        success: true,
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async refreshToken(req: any, res: any): Promise<void> {
    try {
      const result = await this.authService.refreshToken();

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async resetPassword(req: any, res: any): Promise<void> {
    try {
      const { email } = req.body;

      await this.authService.resetPassword(email);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Password reset email sent',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updatePassword(req: any, res: any): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      await this.authService.updatePassword(currentPassword, newPassword);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Password updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
