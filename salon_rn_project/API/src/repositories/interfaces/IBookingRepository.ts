import { IRepository } from '../../core/interfaces/IRepository';

/**
 * Booking entity interface
 */
export interface Booking {
  id: string;
  salonId: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  date: string;
  timeSlot: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create booking DTO
 */
export interface CreateBookingDto {
  salonId: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  date: string;
  timeSlot: string;
  duration: number;
  price: number;
  notes?: string;
}

/**
 * Update booking DTO
 */
export interface UpdateBookingDto {
  serviceId?: string;
  staffId?: string;
  date?: string;
  timeSlot?: string;
  duration?: number;
  price?: number;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

/**
 * Booking repository interface
 */
export interface IBookingRepository extends IRepository<Booking, CreateBookingDto, UpdateBookingDto> {
  findBySalonId(salonId: string): Promise<Booking[]>;
  findByServiceId(serviceId: string): Promise<Booking[]>;
  findByStaffId(staffId: string): Promise<Booking[]>;
  findByCustomerId(customerId: string): Promise<Booking[]>;
  findByDate(date: string): Promise<Booking[]>;
  findByDateRange(startDate: string, endDate: string): Promise<Booking[]>;
  findByStatus(status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'): Promise<Booking[]>;
  findByStaffAndDate(staffId: string, date: string): Promise<Booking[]>;
  existsConflict(staffId: string, date: string, timeSlot: string, duration: number, excludeId?: string): Promise<boolean>;
}
