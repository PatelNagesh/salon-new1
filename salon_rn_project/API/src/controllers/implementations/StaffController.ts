import { BaseController } from '../../core/base/BaseController';
import { IStaffController } from '../interfaces/IStaffController';
import { IStaffManagementService } from '../../services/interfaces/IStaffManagementService';
import { IStaffRepository } from '../../repositories/interfaces/IStaffRepository';
import { Logger } from '../../core/utils/logger.util';
import { HttpStatus } from '../../constants/error.constants';

/**
 * Staff controller implementation
 */
export class StaffController extends BaseController implements IStaffController {
  constructor(
    private staffManagementService: IStaffManagementService,
    private staffRepository: IStaffRepository
  ) {
    super();
    this.logger = new Logger('StaffController');
  }

  async getStaff(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      const staff = await this.staffManagementService.getStaffProfile(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: staff,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAllStaff(req: any, res: any): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;

      const staff = await this.staffRepository.findAll();

      res.status(HttpStatus.OK).json({
        success: true,
        data: staff,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: staff.length,
          totalPages: Math.ceil(staff.length / Number(limit))
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createStaff(req: any, res: any): Promise<void> {
    try {
      const staffData = req.body;

      const staff = await this.staffRepository.create(staffData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: staff,
        message: 'Staff created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateStaff(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const staffData = req.body;

      const staff = await this.staffManagementService.updateStaffProfile(id, staffData);

      res.status(HttpStatus.OK).json({
        success: true,
        data: staff,
        message: 'Staff updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteStaff(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;

      await this.staffRepository.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Staff deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getStaffBySalon(req: any, res: any): Promise<void> {
    try {
      const { salonId } = req.params;

      const staff = await this.staffRepository.findBySalonId(salonId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: staff,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getStaffSchedule(req: any, res: any): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const schedule = await this.staffManagementService.getStaffSchedule(id, startDate, endDate);

      res.status(HttpStatus.OK).json({
        success: true,
        data: schedule,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
