import { BaseService } from '../../core/base/BaseService';
import { IBookingFlowService } from '../interfaces/IBookingFlowService';
import { IBookingRepository } from '../../repositories/interfaces/IBookingRepository';
import { IServiceRepository } from '../../repositories/interfaces/IServiceRepository';
import { IStaffRepository } from '../../repositories/interfaces/IStaffRepository';
import { Logger } from '../../core/utils/logger.util';
import { ValidationException, ConflictException } from '../../exceptions';

/**
 * Booking flow service implementation
 */
export class BookingFlowService extends BaseService implements IBookingFlowService {
  constructor(
    private bookingRepository: IBookingRepository,
    private serviceRepository: IServiceRepository,
    private staffRepository: IStaffRepository
  ) {
    super();
    this.logger = new Logger('BookingFlowService');
  }

  async getAvailableTimeSlots(serviceId: string, staffId: string, date: string): Promise<string[]> {
    this.logger.info('Getting available time slots:', { serviceId, staffId, date });

    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new ValidationException('VAL_001', 'Service not found');
    }

    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new ValidationException('VAL_001', 'Staff not found');
    }

    const existingBookings = await this.bookingRepository.findByStaffAndDate(staffId, date);

    const allTimeSlots = this.generateTimeSlots(service.duration);
    const bookedTimeSlots = existingBookings.map(b => b.timeSlot);

    return allTimeSlots.filter(slot => !this.isSlotBooked(slot, bookedTimeSlots, service.duration));
  }

  async checkAvailability(staffId: string, date: string, timeSlot: string, duration: number): Promise<boolean> {
    const hasConflict = await this.bookingRepository.existsConflict(staffId, date, timeSlot, duration);
    return !hasConflict;
  }

  async createBooking(bookingData: any): Promise<any> {
    this.logger.info('Creating booking:', bookingData);

    const isAvailable = await this.checkAvailability(
      bookingData.staffId,
      bookingData.date,
      bookingData.timeSlot,
      bookingData.duration
    );

    if (!isAvailable) {
      throw new ConflictException('Booking', bookingData.timeSlot);
    }

    return await this.bookingRepository.create(bookingData);
  }

  async confirmBooking(bookingId: string): Promise<any> {
    this.logger.info('Confirming booking:', { bookingId });

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new ValidationException('VAL_001', 'Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new ValidationException('VAL_001', 'Booking cannot be confirmed');
    }

    return await this.bookingRepository.update(bookingId, { status: 'confirmed' });
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    this.logger.info('Cancelling booking:', { bookingId, reason });

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new ValidationException('VAL_001', 'Booking not found');
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      throw new ValidationException('VAL_001', 'Booking cannot be cancelled');
    }

    return await this.bookingRepository.update(bookingId, {
      status: 'cancelled',
      notes: reason
    });
  }

  async rescheduleBooking(bookingId: string, newDate: string, newTimeSlot: string): Promise<any> {
    this.logger.info('Rescheduling booking:', { bookingId, newDate, newTimeSlot });

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new ValidationException('VAL_001', 'Booking not found');
    }

    const isAvailable = await this.checkAvailability(
      booking.staffId,
      newDate,
      newTimeSlot,
      booking.duration,
      bookingId
    );

    if (!isAvailable) {
      throw new ConflictException('Booking', newTimeSlot);
    }

    return await this.bookingRepository.update(bookingId, {
      date: newDate,
      timeSlot: newTimeSlot
    });
  }

  async getBookingHistory(customerId: string, limit: number = 10): Promise<any[]> {
    this.logger.info('Getting booking history:', { customerId, limit });

    const bookings = await this.bookingRepository.findByCustomerId(customerId);
    return bookings.slice(0, limit);
  }

  async getUpcomingBookings(customerId: string): Promise<any[]> {
    this.logger.info('Getting upcoming bookings:', { customerId });

    const bookings = await this.bookingRepository.findByCustomerId(customerId);
    const now = new Date();

    return bookings.filter(booking => {
      const bookingDate = new Date(`${booking.date}T${booking.timeSlot}`);
      return bookingDate >= now && booking.status !== 'cancelled';
    });
  }

  async getStaffBookings(staffId: string, date?: string): Promise<any[]> {
    this.logger.info('Getting staff bookings:', { staffId, date });

    if (date) {
      return await this.bookingRepository.findByStaffAndDate(staffId, date);
    }

    return await this.bookingRepository.findByStaffId(staffId);
  }

  private generateTimeSlots(duration: number): string[] {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    return slots;
  }

  private isSlotBooked(slot: string, bookedSlots: string[], duration: number): boolean {
    const slotTime = new Date(`2000-01-01T${slot}`).getTime();
    const slotEndTime = slotTime + duration * 60 * 1000;

    for (const bookedSlot of bookedSlots) {
      const bookedTime = new Date(`2000-01-01T${bookedSlot}`).getTime();
      const bookedEndTime = bookedTime + duration * 60 * 1000;

      if (slotTime < bookedEndTime && slotEndTime > bookedTime) {
        return true;
      }
    }

    return false;
  }
}
