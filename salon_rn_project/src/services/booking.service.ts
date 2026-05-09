import { supabase } from './supabase';

export interface Booking {
  id: string;
  salon_id: string;
  customer_id: string;
  service_id: string;
  staff_member_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  service?: {
    name: string;
    price: number;
    duration: number;
  };
  staff?: {
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
  customer?: {
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface BookingCreate {
  salon_id: string;
  customer_id: string;
  service_id: string;
  staff_member_id: string;
  start_time: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export class BookingService {
  static async getSalonBookings(salonId: string, date?: string): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(name, price, duration),
        staff:staff_members(profiles(first_name, last_name)),
        customer:customers(profiles(first_name, last_name, email))
      `)
      .eq('salon_id', salonId)
      .order('start_time', { ascending: true });

    if (date) {
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;
      query = query.gte('start_time', startOfDay).lte('start_time', endOfDay);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async getCustomerBookings(customerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(name, price, duration),
        staff:staff_members(profiles(first_name, last_name))
      `)
      .eq('customer_id', customerId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getStaffBookings(staffMemberId: string, date?: string): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(name, price, duration),
        customer:customers(profiles(first_name, last_name, email, phone))
      `)
      .eq('staff_member_id', staffMemberId)
      .order('start_time', { ascending: true });

    if (date) {
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;
      query = query.gte('start_time', startOfDay).lte('start_time', endOfDay);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async createBooking(booking: BookingCreate): Promise<Booking> {
    // Get service duration to calculate end_time
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('duration, price')
      .eq('id', booking.service_id)
      .single();

    if (serviceError) throw serviceError;

    const startTime = new Date(booking.start_time);
    const endTime = new Date(startTime.getTime() + serviceData.duration * 60000);

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        salon_id: booking.salon_id,
        customer_id: booking.customer_id,
        service_id: booking.service_id,
        staff_member_id: booking.staff_member_id,
        start_time: booking.start_time,
        end_time: endTime.toISOString(),
        status: 'scheduled',
        notes: booking.notes,
        total_price: serviceData.price,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateBookingStatus(
    bookingId: string,
    status: Booking['status']
  ): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async cancelBooking(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'cancelled');
  }

  static async completeBooking(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'completed');
  }

  static async markNoShow(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'no-show');
  }

  static async getAvailableTimeSlots(
    salonId: string,
    serviceId: string,
    staffMemberId: string,
    date: string
  ): Promise<TimeSlot[]> {
    // Get service duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single();

    if (serviceError) throw serviceError;

    // Get existing bookings for that staff on that date
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('staff_member_id', staffMemberId)
      .eq('status', 'scheduled')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay);

    if (bookingError) throw bookingError;

    // Generate time slots from 9 AM to 6 PM (salon hours)
    const slots: TimeSlot[] = [];
    const duration = service.duration;
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const slotTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`);
        const slotEndTime = new Date(slotTime.getTime() + duration * 60000);

        // Check if slot overlaps with any existing booking
        const isBooked = bookings?.some((booking) => {
          const bookedStart = new Date(booking.start_time);
          const bookedEnd = new Date(booking.end_time);
          return (slotTime >= bookedStart && slotTime < bookedEnd) ||
                 (slotEndTime > bookedStart && slotEndTime <= bookedEnd) ||
                 (slotTime <= bookedStart && slotEndTime >= bookedEnd);
        });

        slots.push({
          time: slotTime.toISOString(),
          available: !isBooked && slotEndTime.getHours() <= endHour,
        });
      }
    }

    return slots;
  }

  static async deleteBooking(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;
  }
}
