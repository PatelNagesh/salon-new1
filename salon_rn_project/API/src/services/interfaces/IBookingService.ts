/**
 * Booking Service Interface
 * Defines the contract for booking-related business operations
 */

import type { Booking, CreateBookingDto, UpdateBookingDto, QueryOptions } from '../../core/types/common.types';

export interface IBookingService {
  create(dto: CreateBookingDto): Promise<Booking>;
  findById(id: string): Promise<Booking>;
  findAll(options?: QueryOptions): Promise<Booking[]>;
  update(id: string, dto: UpdateBookingDto): Promise<Booking>;
  delete(id: string): Promise<void>;
  findByCustomerId(customerId: string): Promise<Booking[]>;
  findByStaffId(staffId: string): Promise<Booking[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Booking[]>;
  findByStatus(status: string): Promise<Booking[]>;
  getAvailableSlots(date: Date, serviceId: string): Promise<any[]>;
  cancel(id: string): Promise<void>;
  confirm(id: string): Promise<void>;
  complete(id: string): Promise<void>;
}
