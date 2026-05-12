/**
 * Staff Repository Implementation
 * Handles all staff-related database operations
 */

import { BaseRepository } from '../../core/base/BaseRepository';
import { IStaffRepository } from '../interfaces/IStaffRepository';
import type { Staff, CreateStaffDto, UpdateStaffDto, QueryOptions } from '../../core/types/common.types';
import { DatabaseException, NotFoundException } from '../../exceptions';
import { getSupabaseClient } from '../../config/supabase.config';

export class StaffRepository extends BaseRepository<Staff> implements IStaffRepository {
  constructor() {
    super('staff');
  }

  async findBySalonId(salonId: string): Promise<Staff[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseException(`Failed to find staff for salon: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding staff for salon: ${error}`);
    }
  }

  async findByRole(role: string): Promise<Staff[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseException(`Failed to find staff by role: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding staff by role: ${error}`);
    }
  }

  async findBySpecialization(specialization: string): Promise<Staff[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .contains('specializations', [specialization])
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseException(`Failed to find staff by specialization: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding staff by specialization: ${error}`);
    }
  }

  async findActiveStaff(salonId: string): Promise<Staff[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new DatabaseException(`Failed to find active staff: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding active staff: ${error}`);
    }
  }

  async findByUserId(userId: string): Promise<Staff | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new DatabaseException(`Failed to find staff by user ID: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error finding staff by user ID: ${error}`);
    }
  }

  async updateAvailability(id: string, availability: any): Promise<Staff> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          availability,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new DatabaseException(`Failed to update staff availability: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundException(this.tableName, id);
      }

      // Invalidate cache
      if (this.cacheEnabled) {
        await this.invalidateCache(id);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseException || error instanceof NotFoundException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error updating staff availability: ${error}`);
    }
  }

  async getStaffPerformance(staffId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('bookings')
        .select('id, total_amount, service_id, services!inner(duration)')
        .eq('staff_id', staffId)
        .gte('appointment_date', startDate.toISOString())
        .lte('appointment_date', endDate.toISOString())
        .in('status', ['completed', 'confirmed']);

      if (error) {
        throw new DatabaseException(`Failed to get staff performance: ${error.message}`);
      }

      const bookings = data || [];
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const totalServices = bookings.length;
      const totalDuration = bookings.reduce((sum, b) => sum + (b.services?.duration || 0), 0);

      return {
        staffId,
        period: { startDate, endDate },
        totalBookings: totalServices,
        totalRevenue,
        totalDuration,
        averageRevenuePerBooking: totalServices > 0 ? totalRevenue / totalServices : 0,
        averageDurationPerBooking: totalServices > 0 ? totalDuration / totalServices : 0
      };
    } catch (error) {
      if (error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException(`Unexpected error getting staff performance: ${error}`);
    }
  }
}
