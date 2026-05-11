import { BaseService } from '../../core/base/BaseService';
import { ICustomerManagementService } from '../interfaces/ICustomerManagementService';
import { ICustomerRepository } from '../../repositories/interfaces/ICustomerRepository';
import { IBookingRepository } from '../../repositories/interfaces/IBookingRepository';
import { Logger } from '../../core/utils/logger.util';
import { ValidationException } from '../../exceptions';

/**
 * Customer management service implementation
 */
export class CustomerManagementService extends BaseService implements ICustomerManagementService {
  constructor(
    private customerRepository: ICustomerRepository,
    private bookingRepository: IBookingRepository
  ) {
    super();
    this.logger = new Logger('CustomerManagementService');
  }

  async getCustomerProfile(customerId: string): Promise<any> {
    this.logger.info('Getting customer profile:', { customerId });

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new ValidationException('VAL_001', 'Customer not found');
    }

    return customer;
  }

  async updateCustomerProfile(customerId: string, profileData: any): Promise<any> {
    this.logger.info('Updating customer profile:', { customerId, profileData });

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new ValidationException('VAL_001', 'Customer not found');
    }

    return await this.customerRepository.update(customerId, profileData);
  }

  async getCustomerPreferences(customerId: string): Promise<any> {
    this.logger.info('Getting customer preferences:', { customerId });

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new ValidationException('VAL_001', 'Customer not found');
    }

    return customer.preferences || {};
  }

  async updateCustomerPreferences(customerId: string, preferences: any): Promise<any> {
    this.logger.info('Updating customer preferences:', { customerId, preferences });

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new ValidationException('VAL_001', 'Customer not found');
    }

    return await this.customerRepository.update(customerId, {
      preferences: { ...customer.preferences, ...preferences }
    });
  }

  async getCustomerBookingHistory(customerId: string, filters?: any): Promise<any[]> {
    this.logger.info('Getting customer booking history:', { customerId, filters });

    let bookings = await this.bookingRepository.findByCustomerId(customerId);

    if (filters?.status) {
      bookings = bookings.filter(b => b.status === filters.status);
    }

    if (filters?.startDate && filters?.endDate) {
      bookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= new Date(filters.startDate) && bookingDate <= new Date(filters.endDate);
      });
    }

    return bookings;
  }

  async getCustomerStatistics(customerId: string): Promise<any> {
    this.logger.info('Getting customer statistics:', { customerId });

    const bookings = await this.bookingRepository.findByCustomerId(customerId);

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const noShowBookings = bookings.filter(b => b.status === 'no_show').length;

    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings,
      totalSpent,
      averageSpent: completedBookings > 0 ? totalSpent / completedBookings : 0
    };
  }

  async searchCustomers(query: string, filters?: any): Promise<any[]> {
    this.logger.info('Searching customers:', { query, filters });

    const customers = await this.customerRepository.findAll();

    return customers.filter(customer => {
      const matchesQuery =
        customer.firstName.toLowerCase().includes(query.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone?.includes(query);

      if (!matchesQuery) return false;

      if (filters?.status && customer.status !== filters.status) {
        return false;
      }

      if (filters?.city && customer.city !== filters.city) {
        return false;
      }

      return true;
    });
  }

  async blockCustomer(customerId: string, reason: string): Promise<any> {
    this.logger.info('Blocking customer:', { customerId, reason });

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new ValidationException('VAL_001', 'Customer not found');
    }

    return await this.customerRepository.update(customerId, {
      status: 'blocked',
      notes: reason
    });
  }

  async unblockCustomer(customerId: string): Promise<any> {
    this.logger.info('Unblocking customer:', { customerId });

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new ValidationException('VAL_001', 'Customer not found');
    }

    return await this.customerRepository.update(customerId, {
      status: 'active'
    });
  }
}
