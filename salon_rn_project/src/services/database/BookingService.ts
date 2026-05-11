import { supabase, Database } from '../supabase';

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export class BookingService {
  // Get booking by ID
  static async getBookingById(id: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  // Get all bookings for a salon
  static async getBookingsBySalon(salonId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('salon_id', salonId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  }

  // Get bookings by customer
  static async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting customer bookings:', error);
      throw error;
    }
  }

  // Get bookings by staff member
  static async getBookingsByStaff(staffMemberId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('staff_member_id', staffMemberId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting staff bookings:', error);
      throw error;
    }
  }

  // Get booking with related data
  static async getBookingWithDetails(id: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*),
          service:services(*),
          staff_member:staff_members(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting booking with details:', error);
      throw error;
    }
  }

  // Create booking
  static async createBooking(booking: BookingInsert): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Update booking
  static async updateBooking(id: string, updates: BookingUpdate): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  // Delete booking
  static async deleteBooking(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }

  // Get available time slots
  static async getAvailableTimeSlots(salonId: string, serviceId: string, staffId: string, date: string) {
    try {
      const { data, error } = await supabase.rpc('get_available_time_slots', {
        target_salon_id: salonId,
        target_service_id: serviceId,
        target_staff_id: staffId,
        booking_date: date
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw error;
    }
  }

  // Check for booking conflicts
  static async checkBookingConflict(staffId: string, startTime: string, endTime: string, excludeBookingId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_booking_conflict', {
        target_staff_id: staffId,
        new_start_time: startTime,
        new_end_time: endTime,
        exclude_booking_id: excludeBookingId || null
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking booking conflict:', error);
      throw error;
    }
  }

  // Get bookings by date range
  static async getBookingsByDateRange(salonId: string, startDate: string, endDate: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('salon_id', salonId)
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting bookings by date range:', error);
      throw error;
    }
  }

  // Get bookings by status
  static async getBookingsByStatus(salonId: string, status: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('salon_id', salonId)
        .eq('status', status)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting bookings by status:', error);
      throw error;
    }
  }

  // Get today's bookings
  static async getTodayBookings(salonId: string): Promise<Booking[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('salon_id', salonId)
        .gte('start_time', today)
        .lt('start_time', new Date(Date.now() + 86400000).toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting today bookings:', error);
      throw error;
    }
  }
}
