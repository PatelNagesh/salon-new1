/**
 * Booking Service Implementation
 * Handles all booking-related business logic
 */

import { BaseService } from '../../core/base/BaseService';
import { IBookingService } from '../interfaces/IBookingService';
import { IBookingRepository } from '../../repositories/interfaces/IBookingRepository';
import { IStaffRepository } from '../../repositories/interfaces/IStaffRepository';
import { IServiceRepository } from '../../repositories/interfaces/IServiceRepository';
import type { Booking, CreateBookingDto, UpdateBookingDto, QueryOptions } from '../../core/types/common.types';
import { ValidationException, ConflictException, NotFoundException } from '../../exceptions';
import { Logger } from '../../core/utils/logger.util';

export class BookingService extends BaseService implements IBookingService {
  constructor(
    private bookingRepository: IBookingRepository,
    private staffRepository: IStaffRepository,
    private serviceRepository: IServiceRepository
  ) {
    super();
    this.logger = new Logger('BookingService');
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    // Validate business rules
    await this.validateBooking(dto);

    // Check availability
    const isAvailable = await this.checkAvailability(dto);
    if (!isAvailable) {
      throw new ConflictException('Time slot not available');
    }

    // Create booking
    const booking = await this.bookingRepository.create(dto);

    // Invalidate cache
    await this.invalidateCache(dto.staffId, dto.appointmentDate);

    this.logger.info('Booking created successfully:', booking.id);
    return booking;
  }

  async findById(id: string): Promise<Booking> {
    return await this.bookingRepository.findById(id);
  }

  async findAll(options?: QueryOptions): Promise<Booking[]> {
    return await this.bookingRepository.findAll(options);
  }

  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);

    // Validate status transition
    if (dto.status && !this.isValidStatusTransition(booking.status, dto.status)) {
      throw new ValidationException(`Invalid status transition from ${booking.status} to ${dto.status}`);
    }

    const updated = await this.bookingRepository.update(id, dto);

    // Invalidate cache
    await this.invalidateCache(booking.staffId, booking.appointmentDate);

    this.logger.info('Booking updated successfully:', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);
    await this.bookingRepository.delete(id);

    // Invalidate cache
    await this.invalidateCache(booking.staffId, booking.appointmentDate);

    this.logger.info('Booking deleted successfully:', id);
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    return await this.bookingRepository.findByCustomerId(customerId);
  }

  async findByStaffId(staffId: string): Promise<Booking[]> {
    return await this.bookingRepository.findByStaffId(staffId);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    return await this.bookingRepository.findByDateRange(startDate, endDate);
  }

  async findByStatus(status: string): Promise<Booking[]> {
    return await this.bookingRepository.findByStatus(status);
  }

  async getAvailableSlots(date: Date, serviceId: string): Promise<any[]> {
    return await this.bookingRepository.findAvailableSlots(date, serviceId);
  }

  async cancel(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);

    if (booking.status === 'cancelled') {
      throw new ValidationException('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new ValidationException('Cannot cancel completed booking');
    }

    await this.bookingRepository.update(id, { status: 'cancelled' });

    // Invalidate cache
    await this.invalidateCache(booking.staffId, booking.appointmentDate);

    this.logger.info('Booking cancelled successfully:', id);
  }

  async confirm(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);

    if (booking.status !== 'pending') {
      throw new ValidationException('Only pending bookings can be confirmed');
    }

    await this.bookingRepository.update(id, { status: 'confirmed' });

    // Invalidate cache
    await this.invalidateCache(booking.staffId, booking.appointmentDate);

    this.logger.info('Booking confirmed successfully:', id);
  }

  async complete(id: string): Promise<void> {
    const booking = await this.bookingRepository.findById(id);

    if (booking.status !== 'confirmed') {
      throw new ValidationException('Only confirmed bookings can be completed');
    }

    await this.bookingRepository.update(id, { status: 'completed' });

    // Invalidate cache
    await this.invalidateCache(booking.staffId, booking.appointmentDate);

    this.logger.info('Booking completed successfully:', id);
  }

  private async validateBooking(dto: CreateBookingDto): Promise<void> {
    // Validate staff exists
    const staff = await this.staffRepository.findById(dto.staffId);
    if (!staff) {
      throw new NotFoundException('Staff', dto.staffId);
    }

    // Validate service exists
    const service = await this.serviceRepository.findById(dto.serviceId);
    if (!service) {
      throw new NotFoundException('Service', dto.serviceId);
    }

    // Validate time range
    if (dto.startTime >= dto.endTime) {
      throw new ValidationException('Start time must be before end time');
    }

    // Validate duration matches service
    const bookingDuration = this.calculateDuration(dto.startTime, dto.endTime);
    if (bookingDuration !== service.duration) {
      throw new ValidationException(`Booking duration (${bookingDuration}min) must match service duration (${service.duration}min)`);
    }
  }

  private async checkAvailability(dto: CreateBookingDto): Promise<boolean> {
    const availableSlots = await this.bookingRepository.findAvailableSlots(
      new Date(dto.appointmentDate),
      dto.serviceId
    );

    return availableSlots.some(
      slot => slot.startTime === dto.startTime && slot.endTime === dto.endTime
    );
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return endTotalMinutes - startTotalMinutes;
  }

  private async invalidateCache(staffId: string, date: string): Promise<void> {
    // Cache invalidation logic would be implemented here
    // This would clear cache entries related to the staff and date
  }
}
