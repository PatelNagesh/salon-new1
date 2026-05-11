import { supabase } from '../supabase';
import { StaffService } from './StaffService';
import { BookingService } from './BookingService';

export interface StaffSchedule {
  staffId: string;
  dayOfWeek: number;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface StaffPerformance {
  staffId: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  completionRate: number;
  totalRevenue: number;
  averageRevenuePerBooking: number;
  topServiceId?: string;
  customerRating?: number;
}

export interface StaffCommission {
  staffId: string;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  bonusAmount: number;
  totalPayout: number;
}

export interface StaffAvailability {
  staffId: string;
  date: string;
  isAvailable: boolean;
  availableSlots: string[];
  bookedSlots: string[];
  workingHours: {
    start: string;
    end: string;
  };
}

export class StaffManagementService {
  // Get staff schedule for a specific day
  static async getStaffScheduleForDay(
    staffId: string,
    dayOfWeek: number
  ): Promise<StaffSchedule | null> {
    try {
      const { data, error } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', staffId)
        .eq('day_of_week', dayOfWeek)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        staffId: data.staff_id,
        dayOfWeek: data.day_of_week,
        isWorking: data.is_working,
        startTime: data.start_time,
        endTime: data.end_time,
        breakStartTime: data.break_start_time,
        breakEndTime: data.break_end_time,
      };
    } catch (error) {
      console.error('Error getting staff schedule for day:', error);
      throw error;
    }
  }

  // Update staff schedule
  static async updateStaffSchedule(
    staffId: string,
    dayOfWeek: number,
    schedule: Partial<StaffSchedule>
  ): Promise<StaffSchedule> {
    try {
      const updateData: any = {
        is_working: schedule.isWorking ?? true,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
      };

      if (schedule.breakStartTime !== undefined) {
        updateData.break_start_time = schedule.breakStartTime;
      }
      if (schedule.breakEndTime !== undefined) {
        updateData.break_end_time = schedule.breakEndTime;
      }

      const { data, error } = await supabase
        .from('staff_schedules')
        .upsert({
          staff_id: staffId,
          day_of_week: dayOfWeek,
          ...updateData,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        staffId: data.staff_id,
        dayOfWeek: data.day_of_week,
        isWorking: data.is_working,
        startTime: data.start_time,
        endTime: data.end_time,
        breakStartTime: data.break_start_time,
        breakEndTime: data.break_end_time,
      };
    } catch (error) {
      console.error('Error updating staff schedule:', error);
      throw error;
    }
  }

  // Get staff weekly schedule
  static async getStaffWeeklySchedule(staffId: string): Promise<StaffSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', staffId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      return (data || []).map((schedule: any) => ({
        staffId: schedule.staff_id,
        dayOfWeek: schedule.day_of_week,
        isWorking: schedule.is_working,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        breakStartTime: schedule.break_start_time,
        breakEndTime: schedule.break_end_time,
      }));
    } catch (error) {
      console.error('Error getting staff weekly schedule:', error);
      throw error;
    }
  }

  // Get staff performance metrics
  static async getStaffPerformance(
    staffId: string,
    startDate?: string,
    endDate?: string
  ): Promise<StaffPerformance> {
    try {
      const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
      const end = endDate || new Date().toISOString();

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('staff_member_id', staffId)
        .gte('start_time', start)
        .lte('start_time', end);

      if (error) throw error;

      const totalBookings = bookings?.length || 0;
      const completedBookings = bookings?.filter((b: any) => b.status === 'completed').length || 0;
      const cancelledBookings = bookings?.filter((b: any) => b.status === 'cancelled').length || 0;
      const noShowBookings = bookings?.filter((b: any) => b.status === 'no-show').length || 0;

      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      // Get service details for revenue calculation
      const bookingIds = bookings?.map((b: any) => b.id) || [];
      let totalRevenue = 0;

      if (bookingIds.length > 0) {
        const { data: services } = await supabase
          .from('services')
          .select('price')
          .in('id', bookingIds);

        totalRevenue = services?.reduce((sum: number, s: any) => sum + (s.price || 0), 0) || 0;
      }

      const averageRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Find top service
      const serviceCounts: Record<string, number> = {};
      bookings?.forEach((booking: any) => {
        serviceCounts[booking.service_id] = (serviceCounts[booking.service_id] || 0) + 1;
      });

      const topServiceId = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

      return {
        staffId,
        totalBookings,
        completedBookings,
        cancelledBookings,
        noShowBookings,
        completionRate,
        totalRevenue,
        averageRevenuePerBooking,
        topServiceId,
      };
    } catch (error) {
      console.error('Error getting staff performance:', error);
      throw error;
    }
  }

  // Calculate staff commission
  static async calculateStaffCommission(
    staffId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<StaffCommission> {
    try {
      const { data: staff, error: staffError } = await supabase
        .from('staff_members')
        .select('commission_rate')
        .eq('id', staffId)
        .single();

      if (staffError) throw staffError;

      const commissionRate = staff?.commission_rate || 0;

      // Get bookings in period
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('service_id')
        .eq('staff_member_id', staffId)
        .eq('status', 'completed')
        .gte('start_time', periodStart)
        .lte('start_time', periodEnd);

      if (error) throw error;

      // Calculate total revenue
      const serviceIds = bookings?.map((b: any) => b.service_id) || [];
      let totalRevenue = 0;

      if (serviceIds.length > 0) {
        const { data: services } = await supabase
          .from('services')
          .select('price')
          .in('id', serviceIds);

        totalRevenue = services?.reduce((sum: number, s: any) => sum + (s.price || 0), 0) || 0;
      }

      const commissionAmount = totalRevenue * (commissionRate / 100);

      // Calculate bonus based on performance
      const performance = await this.getStaffPerformance(staffId, periodStart, periodEnd);
      let bonusAmount = 0;

      if (performance.completionRate >= 95) {
        bonusAmount = commissionAmount * 0.1; // 10% bonus for 95%+ completion
      } else if (performance.completionRate >= 90) {
        bonusAmount = commissionAmount * 0.05; // 5% bonus for 90%+ completion
      }

      const totalPayout = commissionAmount + bonusAmount;

      return {
        staffId,
        periodStart,
        periodEnd,
        totalRevenue,
        commissionRate,
        commissionAmount,
        bonusAmount,
        totalPayout,
      };
    } catch (error) {
      console.error('Error calculating staff commission:', error);
      throw error;
    }
  }

  // Check staff availability for a specific date and time
  static async checkStaffAvailability(
    staffId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<StaffAvailability> {
    try {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();

      // Get staff schedule for the day
      const schedule = await this.getStaffScheduleForDay(staffId, dayOfWeek);

      if (!schedule || !schedule.isWorking) {
        return {
          staffId,
          date,
          isAvailable: false,
          availableSlots: [],
          bookedSlots: [],
          workingHours: { start: '', end: '' },
        };
      }

      // Check if requested time is within working hours
      const requestedStart = new Date(`${date}T${startTime}`);
      const requestedEnd = new Date(`${date}T${endTime}`);
      const scheduleStart = new Date(`${date}T${schedule.startTime}`);
      const scheduleEnd = new Date(`${date}T${schedule.endTime}`);

      if (requestedStart < scheduleStart || requestedEnd > scheduleEnd) {
        return {
          staffId,
          date,
          isAvailable: false,
          availableSlots: [],
          bookedSlots: [],
          workingHours: {
            start: schedule.startTime,
            end: schedule.endTime,
          },
        };
      }

      // Check for existing bookings
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('staff_member_id', staffId)
        .eq('status', 'scheduled')
        .gte('start_time', `${date}T00:00:00`)
        .lte('start_time', `${date}T23:59:59`);

      if (error) throw error;

      const bookedSlots = (bookings || []).map((b: any) => ({
        start: new Date(b.start_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        end: new Date(b.end_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      // Check if requested time conflicts with existing bookings
      const hasConflict = bookings?.some((booking: any) => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        return (
          (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
          (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
          (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
        );
      });

      return {
        staffId,
        date,
        isAvailable: !hasConflict,
        availableSlots: hasConflict ? [] : [startTime],
        bookedSlots: bookedSlots.map((slot: any) => `${slot.start} - ${slot.end}`),
        workingHours: {
          start: schedule.startTime,
          end: schedule.endTime,
        },
      };
    } catch (error) {
      console.error('Error checking staff availability:', error);
      throw error;
    }
  }

  // Get all available staff for a service and time slot
  static async getAvailableStaffForService(
    salonId: string,
    serviceId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<any[]> {
    try {
      // Get all staff for the salon
      const { data: staff, error: staffError } = await supabase
        .from('staff_members')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (staffError) throw staffError;

      // Filter staff who can perform the service
      const availableStaff = [];

      for (const staffMember of staff || []) {
        // Check if staff can perform the service
        const { data: staffService, error: serviceError } = await supabase
          .from('staff_services')
          .select('*')
          .eq('staff_id', staffMember.id)
          .eq('service_id', serviceId)
          .single();

        if (serviceError || !staffService) continue;

        // Check availability
        const availability = await this.checkStaffAvailability(
          staffMember.id,
          date,
          startTime,
          endTime
        );

        if (availability.isAvailable) {
          availableStaff.push(staffMember);
        }
      }

      return availableStaff;
    } catch (error) {
      console.error('Error getting available staff for service:', error);
      throw error;
    }
  }

  // Get staff ranking by performance
  static async getStaffRanking(salonId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data: staff, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (error) throw error;

      const staffWithPerformance = [];

      for (const staffMember of staff || []) {
        const performance = await this.getStaffPerformance(staffMember.id);
        staffWithPerformance.push({
          ...staffMember,
          performance,
        });
      }

      // Sort by completion rate and total revenue
      return staffWithPerformance.sort((a, b) => {
        if (b.performance.completionRate !== a.performance.completionRate) {
          return b.performance.completionRate - a.performance.completionRate;
        }
        return b.performance.totalRevenue - a.performance.totalRevenue;
      }).slice(0, limit);
    } catch (error) {
      console.error('Error getting staff ranking:', error);
      throw error;
    }
  }

  // Update staff commission rate
  static async updateStaffCommissionRate(
    staffId: string,
    commissionRate: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('staff_members')
        .update({ commission_rate: commissionRate })
        .eq('id', staffId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating staff commission rate:', error);
      throw error;
    }
  }

  // Get staff summary with all details
  static async getStaffSummary(staffId: string) {
    try {
      const [staff, schedule, performance, commission] = await Promise.all([
        StaffService.getStaffById(staffId),
        this.getStaffWeeklySchedule(staffId),
        this.getStaffPerformance(staffId),
        this.calculateStaffCommission(
          staffId,
          new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
          new Date().toISOString()
        ),
      ]);

      return {
        staff,
        schedule,
        performance,
        commission,
      };
    } catch (error) {
      console.error('Error getting staff summary:', error);
      throw error;
    }
  }
}
