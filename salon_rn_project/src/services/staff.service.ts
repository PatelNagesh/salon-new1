import { supabase } from './supabase';

export interface StaffMember {
  id: string;
  user_id: string;
  salon_id: string;
  role: 'STAFF' | 'MANAGER' | 'LEAD_STYLIST';
  hourly_rate: number;
  commission_rate: number;
  is_active: boolean;
  hire_date: string;
  termination_date?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar_url?: string;
  };
}

export interface StaffSchedule {
  id: string;
  staff_member_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
}

export interface CreateStaffInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: StaffMember['role'];
  hourlyRate: number;
  commissionRate: number;
}

export class StaffService {
  static async getSalonStaff(salonId: string): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from('staff_members')
      .select(`
        *,
        profiles(first_name, last_name, email, phone, avatar_url)
      `)
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('hire_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getStaffById(staffId: string): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff_members')
      .select(`
        *,
        profiles(first_name, last_name, email, phone, avatar_url)
      `)
      .eq('id', staffId)
      .single();

    if (error) throw error;
    return data;
  }

  static async createStaff(
    salonId: string,
    ownerId: string,
    staffData: CreateStaffInput
  ): Promise<StaffMember> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: staffData.email,
      password: generateTempPassword(),
      options: {
        data: {
          first_name: staffData.firstName,
          last_name: staffData.lastName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Create staff member record
    const { data: staffMember, error: staffError } = await supabase
      .from('staff_members')
      .insert({
        user_id: authData.user.id,
        salon_id: salonId,
        role: staffData.role,
        hourly_rate: staffData.hourlyRate,
        commission_rate: staffData.commissionRate,
        is_active: true,
        hire_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (staffError) throw staffError;

    // Update role
    await supabase.rpc('update_user_role', {
      user_id: authData.user.id,
      new_role: staffData.role,
      salon_id: salonId,
    });

    return staffMember;
  }

  static async updateStaff(
    staffId: string,
    updates: Partial<StaffMember>
  ): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff_members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', staffId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deactivateStaff(staffId: string): Promise<StaffMember> {
    const { data, error } = await supabase
      .from('staff_members')
      .update({
        is_active: false,
        termination_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', staffId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getStaffSchedule(staffId: string): Promise<StaffSchedule[]> {
    const { data, error } = await supabase
      .from('staff_schedule')
      .select('*')
      .eq('staff_member_id', staffId)
      .order('day_of_week');

    if (error) throw error;
    return data || [];
  }

  static async updateStaffSchedule(
    staffId: string,
    schedule: Partial<StaffSchedule>[]
  ): Promise<StaffSchedule[]> {
    // Delete existing schedule
    await supabase
      .from('staff_schedule')
      .delete()
      .eq('staff_member_id', staffId);

    // Insert new schedule
    const scheduleWithStaff = schedule.map((s) => ({
      ...s,
      staff_member_id: staffId,
    }));

    const { data, error } = await supabase
      .from('staff_schedule')
      .insert(scheduleWithStaff)
      .select();

    if (error) throw error;
    return data || [];
  }

  static async getStaffPerformance(
    staffId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    averageRating: number;
  }> {
    // Get bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_price, status')
      .eq('staff_member_id', staffId)
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    const totalBookings = bookings?.length || 0;
    const completedBookings =
      bookings?.filter((b) => b.status === 'completed').length || 0;
    const totalRevenue = bookings
      ?.filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

    return {
      totalBookings,
      completedBookings,
      totalRevenue,
      averageRating: 0, // Would come from reviews table
    };
  }
}

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8) + 'A1!';
}
