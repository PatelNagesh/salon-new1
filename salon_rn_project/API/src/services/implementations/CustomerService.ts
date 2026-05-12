/**
 * Customer Service Implementation
 * Handles all customer-related business logic
 */

import { BaseService } from '../../core/base/BaseService';
import { ICustomerService } from '../interfaces/ICustomerService';
import { ICustomerRepository } from '../../repositories/interfaces/ICustomerRepository';
import { IBookingRepository } from '../../repositories/interfaces/IBookingRepository';
import type { Customer, CreateCustomerDto, UpdateCustomerDto, QueryOptions } from '../../core/types/common.types';
import { ValidationException, NotFoundException } from '../../exceptions';
import { Logger } from '../../core/utils/logger.util';

export class CustomerService extends BaseService implements ICustomerService {
  constructor(
    private customerRepository: ICustomerRepository,
    private bookingRepository: IBookingRepository
  ) {
    super();
    this.logger = new Logger('CustomerService');
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    // Validate business rules
    await this.validateCustomer(dto);

    const customer = await this.customerRepository.create(dto);

    this.logger.info('Customer created successfully:', customer.id);
    return customer;
  }

  async findById(id: string): Promise<Customer> {
    return await this.customerRepository.findById(id);
  }

  async findAll(options?: QueryOptions): Promise<Customer[]> {
    return await this.customerRepository.findAll(options);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);

    // Validate email uniqueness if being updated
    if (dto.email && dto.email !== customer.email) {
      const existing = await this.customerRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ValidationException('Email already in use');
      }
    }

    const updated = await this.customerRepository.update(id, dto);

    this.logger.info('Customer updated successfully:', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    // Check if customer has active bookings
    const bookings = await this.bookingRepository.findByCustomerId(id);
    const activeBookings = bookings.filter(b =>
      ['pending', 'confirmed'].includes(b.status)
    );

    if (activeBookings.length > 0) {
      throw new ValidationException('Cannot delete customer with active bookings');
    }

    await this.customerRepository.delete(id);

    this.logger.info('Customer deleted successfully:', id);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await this.customerRepository.findByEmail(email);
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return await this.customerRepository.findByPhone(phone);
  }

  async findByUserId(userId: string): Promise<Customer | null> {
    return await this.customerRepository.findByUserId(userId);
  }

  async getBookingHistory(customerId: string): Promise<any[]> {
    const bookings = await this.bookingRepository.findByCustomerId(customerId);

    return bookings.map(booking => ({
      id: booking.id,
      serviceId: booking.serviceId,
      staffId: booking.staffId,
      appointmentDate: booking.appointmentDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt
    }));
  }

  async getActiveBookings(customerId: string): Promise<any[]> {
    const bookings = await this.bookingRepository.findByCustomerId(customerId);

    return bookings
      .filter(b => ['pending', 'confirmed'].includes(b.status))
      .map(booking => ({
        id: booking.id,
        serviceId: booking.serviceId,
        staffId: booking.staffId,
        appointmentDate: booking.appointmentDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      }));
  }

  private async validateCustomer(dto: CreateCustomerDto): Promise<void> {
    // Validate email uniqueness
    if (dto.email) {
      const existing = await this.customerRepository.findByEmail(dto.email);
      if (existing) {
        throw new ValidationException('Email already in use');
      }
    }

    // Validate phone uniqueness
    if (dto.phone) {
      const existing = await this.customerRepository.findByPhone(dto.phone);
      if (existing) {
        throw new ValidationException('Phone number already in use');
      }
    }

    // Validate date of birth (must be at least 18 years old)
    if (dto.dateOfBirth) {
      const dob = new Date(dto.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (age < 18 || (age === 18 && monthDiff < 0)) {
        throw new ValidationException('Customer must be at least 18 years old');
      }
    }
  }
}
