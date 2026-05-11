import { BaseService } from '../../core/base/BaseService';
import { IStaffManagementService } from '../interfaces/IStaffManagementService';
import { IStaffRepository } from '../../repositories/interfaces/IStaffRepository';
import { IBookingRepository } from '../../repositories/interfaces/IBookingRepository';
import { Logger } from '../../core/utils/logger.util';
import { ValidationException } from '../../exceptions';

/**
 * Staff management service implementation
 */
export class StaffManagementService extends BaseService implements IStaffManagementService {
  constructor(
    private staffRepository: IStaffRepository,
    private bookingRepository: IBookingRepository
  ) {
    super();
    this.logger = new Logger('StaffManagementService');
  }

  async getStaffProfile(staffId: string): Promise<any> {
    this.logger.info('Getting staff profile:', { staffId });

    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new ValidationException('VAL_001', 'Staff not found');
    }

    return staff;
  }

  async updateStaffProfile(staffId: string, profileData: any): Promise<any> {
    this.logger.info('Updating staff profile:', { staffId, profileData });

    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new ValidationException('VAL_001', 'Staff not found');
    }

    return await this.staffRepository.update(staffId, profileData);
  }

  async getStaffSchedule(staffId: string, startDate: string, endDate: string): Promise<any[]> {
    this.logger.info('Getting staff schedule:', { staffId, startDate, endDate });

    const bookings = await this.bookingRepository.findByDateRange(startDate, endDate);
    return bookings.filter(b => b.staffId === staffId);
  }

  async updateStaffSchedule(staffId: string, scheduleData: any): Promise<any> {
    this.logger.info('Updating staff schedule:', { staffId, scheduleData });

    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new ValidationException('VAL_001', 'Staff not found');
    }

    return await this.staffRepository.update(staffId, scheduleData);
  }

  async getStaffPerformance(staffId: string, startDate: string, endDate: string): Promise<any> {
    this.logger.info('Getting staff performance:', { staffId, startDate, endDate });

    const bookings = await this.bookingRepository.findByDateRange(startDate, endDate);
    const staffBookings = bookings.filter(b => b.staffId === staffId);

    const totalBookings = staffBookings.length;
    const completedBookings = staffBookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = staffBookings.filter(b => b.status === 'cancelled').length;

    const totalRevenue = staffBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0);

    const staff = await this.staffRepository.findById(staffId);
    const commission = staff?.commissionRate || 0;
    const totalCommission = totalRevenue * (commission / 100);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      totalRevenue,
      totalCommission,
      averageRevenuePerBooking: completedBookings > 0 ? totalRevenue / completedBookings : 0
    };
  }

  async getStaffBookings(staffId: string, date?: string): Promise<any[]> {
    this.logger.info('Getting staff bookings:', { staffId, date });

    if (date) {
      return await this.bookingRepository.findByStaffAndDate(staffId, date);
    }

    return await this.bookingRepository.findByStaffId(staffId);
  }

  async assignStaffToService(staffId: string, serviceId: string): Promise<any> {
    this.logger.info('Assigning staff to service:', { staffId, serviceId });

    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new ValidationException('VAL_001', 'Staff not found');
    }

    const specializations = staff.specializations || [];
    if (!specializations.includes(serviceId)) {
      specializations.push(serviceId);
      return await this.staffRepository.update(staffId, { specializations });
    }

    return staff;
  }

  async removeStaffFromService(staffId: string, serviceId: string): Promise<any> {
    this.logger.info('Removing staff from service:', { staffId, serviceId });

    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new ValidationException('VAL_001', 'Staff not found');
    }

    const specializations = (staff.specializations || []).filter(s => s !== serviceId);
    return await this.staffRepository.update(staffId, { specializations });
  }

  async getStaffSpecializations(staffId: string): Promise<string[]> {
    this.logger.info('Getting staff specializations:', { staffId });

    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new ValidationException('VAL_001', 'Staff not found');
    }

    return staff.specializations || [];
  }

  async updateStaffSpecializations(staffId: string, specializations: string[]): Promise<any> {
    this.logger.info('Updating staff specializations:', { staffId, specializations });

    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new ValidationException('VAL_001', 'Staff not found');
    }

    return await this.staffRepository.update(staffId, { specializations });
  }

  async calculateStaffCommission(staffId: string, startDate: string, endDate: string): Promise<any> {
    this.logger.info('Calculating staff commission:', { staffId, startDate, endDate });

    const performance = await this.getStaffPerformance(staffId, startDate, endDate);

    return {
      totalRevenue: performance.totalRevenue,
      commissionRate: performance.totalCommission / performance.totalRevenue * 100,
      totalCommission: performance.totalCommission,
      bookingCount: performance.completedBookings
    };
  }
}
