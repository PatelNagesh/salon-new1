import { BaseRepository } from '../../core/base/BaseRepository';
import { IBookingRepository, Booking, CreateBookingDto, UpdateBookingDto } from '../interfaces/IBookingRepository';
import { supabase } from '../../config/supabase.config';
import { Logger } from '../../core/utils/logger.util';
import { NotFoundException, ConflictException } from '../../exceptions';

/**
 * Booking repository implementation
 */
export class BookingRepository extends BaseRepository<Booking, CreateBookingDto, UpdateBookingDto> implements IBookingRepository {
  protected tableName = 'bookings';
  private logger = new Logger('BookingRepository');

  async findById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error finding booking by id:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error finding all bookings:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        salon_id: dto.salonId,
        service_id: dto.serviceId,
        staff_id: dto.staffId,
        customer_id: dto.customerId,
        date: dto.date,
        time_slot: dto.timeSlot,
        duration: dto.duration,
        price: dto.price,
        notes: dto.notes
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating booking:', error);
      throw new ConflictException('Booking', dto.timeSlot);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const updateData: any = {};
    if (dto.serviceId !== undefined) updateData.service_id = dto.serviceId;
    if (dto.staffId !== undefined) updateData.staff_id = dto.staffId;
    if (dto.date !== undefined) updateData.date = dto.date;
    if (dto.timeSlot !== undefined) updateData.time_slot = dto.timeSlot;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating booking:', error);
      throw new NotFoundException('Booking', id);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting booking:', error);
      return false;
    }

    return true;
  }

  async findBySalonId(salonId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('salon_id', salonId);

    if (error) {
      this.logger.error('Error finding bookings by salon id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByServiceId(serviceId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('service_id', serviceId);

    if (error) {
      this.logger.error('Error finding bookings by service id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByStaffId(staffId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('staff_id', staffId);

    if (error) {
      this.logger.error('Error finding bookings by staff id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('customer_id', customerId);

    if (error) {
      this.logger.error('Error finding bookings by customer id:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByDate(date: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('date', date);

    if (error) {
      this.logger.error('Error finding bookings by date:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      this.logger.error('Error finding bookings by date range:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByStatus(status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status);

    if (error) {
      this.logger.error('Error finding bookings by status:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async findByStaffAndDate(staffId: string, date: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date);

    if (error) {
      this.logger.error('Error finding bookings by staff and date:', error);
      return [];
    }

    return data.map((item: any) => this.mapToEntity(item));
  }

  async existsConflict(staffId: string, date: string, timeSlot: string, duration: number, excludeId?: string): Promise<boolean> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date)
      .in('status', ['confirmed', 'in_progress']);

    if (excludeId) {
      query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error checking booking conflict:', error);
      return false;
    }

    const newStartTime = new Date(timeSlot).getTime();
    const newEndTime = newStartTime + duration * 60 * 1000;

    for (const booking of data) {
      const existingStartTime = new Date(booking.time_slot).getTime();
      const existingEndTime = existingStartTime + booking.duration * 60 * 1000;

      if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
        return true;
      }
    }

    return false;
  }

  private mapToEntity(data: any): Booking {
    return {
      id: data.id,
      salonId: data.salon_id,
      serviceId: data.service_id,
      staffId: data.staff_id,
      customerId: data.customer_id,
      date: data.date,
      timeSlot: data.time_slot,
      duration: data.duration,
      price: data.price,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
