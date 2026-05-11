import { IController } from '../../core/interfaces/IController';

/**
 * Staff controller interface
 */
export interface IStaffController extends IController {
  /**
   * Get staff by ID
   */
  getStaff(req: any, res: any): Promise<void>;

  /**
   * Get all staff
   */
  getAllStaff(req: any, res: any): Promise<void>;

  /**
   * Create staff
   */
  createStaff(req: any, res: any): Promise<void>;

  /**
   * Update staff
   */
  updateStaff(req: any, res: any): Promise<void>;

  /**
   * Delete staff
   */
  deleteStaff(req: any, res: any): Promise<void>;

  /**
   * Get staff by salon
   */
  getStaffBySalon(req: any, res: any): Promise<void>;

  /**
   * Get staff schedule
   */
  getStaffSchedule(req: any, res: any): Promise<void>;
}
