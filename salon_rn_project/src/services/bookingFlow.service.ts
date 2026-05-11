import { supabase } from './supabase';
import { BookingService } from './booking.service';
import { ServiceService } from './database/ServiceService';
import { StaffService } from './database/StaffService';
import { CustomerService } from './database/CustomerService';

export interface BookingFlowData {
  salonId: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  date: string;
  timeSlot: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
}

export interface BookingConflict {
  hasConflict: boolean;
  conflictingBookings?: any[];
}

export class BookingFlowService {
  // Get available time slots using database function
  static async getAvailableTimeSlots(
    salonId: string,
    serviceId: string,
    staffId: string,
    date: string
  ): Promise<TimeSlot[]> {
    try {
      const { data, error } = await supabase.rpc('get_available_time_slots', {
        target_salon_id: salonId,
        target_service_id: serviceId,
        target_staff_id: staffId,
        booking_date: date
      });

      if (error) throw error;

      // Transform database result to TimeSlot format
      return (data || []).map((slot: any) => ({
        time: slot.time,
        available: slot.available,
        staffId: slot.staff_id || staffId,
      }));
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw error;
    }
  }

  // Check for booking conflicts using database function
  static async checkBookingConflict(
    staffId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<BookingConflict> {
    try {
      const { data, error } = await supabase.rpc('check_booking_conflict', {
        target_staff_id: staffId,
        new_start_time: startTime,
        new_end_time: endTime,
        exclude_booking_id: excludeBookingId || null
      });

      if (error) throw error;

      return {
        hasConflict: data || false,
        conflictingBookings: [],
      };
    } catch (error) {
      console.error('Error checking booking conflict:', error);
      throw error;
    }
  }

  // Calculate booking price from service
  static async calculateBookingPrice(serviceId: string): Promise<number> {
    try {
      const service = await ServiceService.getServiceById(serviceId);
      if (!service) throw new Error('Service not found');

      return service.price;
    } catch (error) {
      console.error('Error calculating booking price:', error);
      throw error;
    }
  }

  // Create booking with automatic price calculation
  static async createBookingWithPrice(bookingData: BookingFlowData): Promise<any> {
    try {
      // Get service details
      const service = await ServiceService.getServiceById(bookingData.serviceId);
      if (!service) throw new Error('Service not found');

      // Calculate end time based on service duration
      const startTime = new Date(bookingData.timeSlot);
      const endTime = new Date(startTime.getTime() + service.duration * 60000);

      // Check for conflicts
      const conflictCheck = await this.checkBookingConflict(
        bookingData.staffId,
        startTime.toISOString(),
        endTime.toISOString()
      );

      if (conflictCheck.hasConflict) {
        throw new Error('Time slot is already booked');
      }

      // Create booking
      const booking = await BookingService.createBooking({
        salon_id: bookingData.salonId,
        customer_id: bookingData.customerId,
        service_id: bookingData.serviceId,
        staff_member_id: bookingData.staffId,
        start_time: bookingData.timeSlot,
        notes: bookingData.notes,
      });

      return booking;
    } catch (error) {
      console.error('Error creating booking with price:', error);
      throw error;
    }
  }

  // Update booking status
  static async updateBookingStatus(
    bookingId: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ): Promise<any> {
    try {
      return await BookingService.updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Cancel booking
  static async cancelBooking(bookingId: string): Promise<any> {
    try {
      return await BookingService.cancelBooking(bookingId);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Complete booking and update customer stats
  static async completeBooking(bookingId: string): Promise<any> {
    try {
      // Get booking details first
      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) throw new Error('Booking not found');

      // Update booking status
      const updatedBooking = await BookingService.completeBooking(bookingId);

      // Update customer statistics
      if (booking.customer_id) {
        await supabase.rpc('update_customer_stats', {
          target_customer_id: booking.customer_id
        });
      }

      return updatedBooking;
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }

  // Mark booking as no-show
  static async markNoShow(bookingId: string): Promise<any> {
    try {
      return await BookingService.markNoShow(bookingId);
    } catch (error) {
      console.error('Error marking booking as no-show:', error);
      throw error;
    }
  }

  // Get available staff for a service and time slot
  static async getAvailableStaff(
    salonId: string,
    serviceId: string,
    startTime: string,
    endTime: string
  ): Promise<any[]> {
    try {
      const service = await ServiceService.getServiceById(serviceId);
      if (!service) throw new Error('Service not found');

      const duration = service.duration;
      const start = new Date(startTime);
      const end = new Date(endTime);

      // Get all active staff
      const staff = await StaffService.getStaffBySalon(salonId);

      // Filter staff who are available at this time
      const availableStaff = [];

      for (const staffMember of staff) {
        // Check if staff has schedule for this day
        const dayOfWeek = start.getDay();
        const schedule = await StaffService.getStaffSchedule(staffMember.id);
        const daySchedule = schedule.find(s => s.day_of_week === dayOfWeek);

        if (daySchedule && daySchedule.is_working) {
          const scheduleStart = new Date(`${start.toISOString().split('T')[0]}T${daySchedule.start_time}`);
          const scheduleEnd = new Date(`${start.toISOString().split('T')[0]}T${daySchedule.end_time}`);

          // Check if time slot falls within schedule
          if (start >= scheduleStart && end <= scheduleEnd) {
            // Check for existing bookings
            const conflictCheck = await this.checkBookingConflict(
              staffMember.id,
              start.toISOString(),
              end.toISOString()
            );

            if (!conflictCheck.hasConflict) {
              availableStaff.push(staffMember);
            }
          }
        }
      }

      return availableStaff;
    } catch (error) {
      console.error('Error getting available staff:', error);
      throw error;
    }
  }

  // Get booking summary
  static async getBookingSummary(bookingId: string) {
    try {
      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const service = await ServiceService.getServiceById(booking.service_id);
      const staff = await StaffService.getStaffById(booking.staff_member_id);
      const customer = await CustomerService.getCustomerById(booking.customer_id);

      return {
        booking,
        service,
        staff,
        customer,
      };
    } catch (error) {
      console.error('Error getting booking summary:', error);
      throw error;
    }
  }
}
