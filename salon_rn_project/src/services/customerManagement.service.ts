import { supabase } from '../supabase';
import { CustomerService } from './CustomerService';
import { BookingService } from './BookingService';

export interface CustomerStats {
  customerId: string;
  totalVisits: number;
  totalSpent: number;
  averageSpending: number;
  lastVisitDate?: string;
  favoriteServiceId?: string;
  loyaltyPoints?: number;
  referralCount?: number;
}

export interface VisitHistory {
  bookingId: string;
  date: string;
  service: string;
  staff: string;
  amount: number;
  status: string;
  notes?: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
  isPrivate: boolean;
}

export interface ReferralInfo {
  referralCode: string;
  referredBy?: string;
  referredCustomers: string[];
  referralBonusEarned: number;
}

export class CustomerManagementService {
  // Get customer statistics using database function
  static async getCustomerStats(customerId: string): Promise<CustomerStats> {
    try {
      const { data, error } = await supabase.rpc('get_customer_stats', {
        target_customer_id: customerId
      });

      if (error) throw error;

      return {
        customerId,
        totalVisits: data?.total_visits || 0,
        totalSpent: data?.total_spent || 0,
        averageSpending: data?.average_spending || 0,
        lastVisitDate: data?.last_visit_date,
        favoriteServiceId: data?.favorite_service_id,
        loyaltyPoints: data?.loyalty_points || 0,
        referralCount: data?.referral_count || 0,
      };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      throw error;
    }
  }

  // Get customer visit history
  static async getVisitHistory(customerId: string, limit: number = 20): Promise<VisitHistory[]> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          status,
          notes,
          services (name, price),
          staff_members (name)
        `)
        .eq('customer_id', customerId)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (bookings || []).map((booking: any) => ({
        bookingId: booking.id,
        date: booking.start_time,
        service: booking.services?.name || 'Unknown',
        staff: booking.staff_members?.name || 'Unknown',
        amount: booking.services?.price || 0,
        status: booking.status,
        notes: booking.notes,
      }));
    } catch (error) {
      console.error('Error getting visit history:', error);
      throw error;
    }
  }

  // Get customer notes
  static async getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
    try {
      const { data, error } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((note: any) => ({
        id: note.id,
        customerId: note.customer_id,
        note: note.note,
        createdBy: note.created_by,
        createdAt: note.created_at,
        isPrivate: note.is_private,
      }));
    } catch (error) {
      console.error('Error getting customer notes:', error);
      throw error;
    }
  }

  // Add customer note
  static async addCustomerNote(
    customerId: string,
    note: string,
    createdBy: string,
    isPrivate: boolean = false
  ): Promise<CustomerNote> {
    try {
      const { data, error } = await supabase
        .from('customer_notes')
        .insert({
          customer_id: customerId,
          note,
          created_by: createdBy,
          is_private: isPrivate,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        customerId: data.customer_id,
        note: data.note,
        createdBy: data.created_by,
        createdAt: data.created_at,
        isPrivate: data.is_private,
      };
    } catch (error) {
      console.error('Error adding customer note:', error);
      throw error;
    }
  }

  // Update customer note
  static async updateCustomerNote(
    noteId: string,
    note: string,
    isPrivate?: boolean
  ): Promise<CustomerNote> {
    try {
      const updateData: any = { note };
      if (isPrivate !== undefined) {
        updateData.is_private = isPrivate;
      }

      const { data, error } = await supabase
        .from('customer_notes')
        .update(updateData)
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        customerId: data.customer_id,
        note: data.note,
        createdBy: data.created_by,
        createdAt: data.created_at,
        isPrivate: data.is_private,
      };
    } catch (error) {
      console.error('Error updating customer note:', error);
      throw error;
    }
  }

  // Delete customer note
  static async deleteCustomerNote(noteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customer_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer note:', error);
      throw error;
    }
  }

  // Get referral information
  static async getReferralInfo(customerId: string): Promise<ReferralInfo> {
    try {
      // Get customer's referral code
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('referral_code, referred_by')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;

      // Get customers referred by this customer
      const { data: referredCustomers, error: referredError } = await supabase
        .from('customers')
        .select('id, referral_bonus_earned')
        .eq('referred_by', customerId);

      if (referredError) throw referredError;

      // Calculate total referral bonus
      const totalBonus = (referredCustomers || []).reduce(
        (sum: number, c: any) => sum + (c.referral_bonus_earned || 0),
        0
      );

      return {
        referralCode: customer?.referral_code || '',
        referredBy: customer?.referred_by,
        referredCustomers: (referredCustomers || []).map((c: any) => c.id),
        referralBonusEarned: totalBonus,
      };
    } catch (error) {
      console.error('Error getting referral info:', error);
      throw error;
    }
  }

  // Generate referral code for customer
  static async generateReferralCode(customerId: string): Promise<string> {
    try {
      const code = `REF${customerId.substring(0, 8).toUpperCase()}`;

      const { error } = await supabase
        .from('customers')
        .update({ referral_code: code })
        .eq('id', customerId);

      if (error) throw error;

      return code;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  }

  // Apply referral bonus
  static async applyReferralBonus(
    customerId: string,
    bonusAmount: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          referral_bonus_earned: bonusAmount,
        })
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error applying referral bonus:', error);
      throw error;
    }
  }

  // Get customer loyalty points
  static async getLoyaltyPoints(customerId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', customerId)
        .single();

      if (error) throw error;

      return data?.loyalty_points || 0;
    } catch (error) {
      console.error('Error getting loyalty points:', error);
      throw error;
    }
  }

  // Add loyalty points
  static async addLoyaltyPoints(customerId: string, points: number): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('add_loyalty_points', {
        target_customer_id: customerId,
        points_to_add: points
      });

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      throw error;
    }
  }

  // Redeem loyalty points
  static async redeemLoyaltyPoints(customerId: string, points: number): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('redeem_loyalty_points', {
        target_customer_id: customerId,
        points_to_redeem: points
      });

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      throw error;
    }
  }

  // Get customer summary with all details
  static async getCustomerSummary(customerId: string) {
    try {
      const [customer, stats, visitHistory, notes, referralInfo] = await Promise.all([
        CustomerService.getCustomerById(customerId),
        this.getCustomerStats(customerId),
        this.getVisitHistory(customerId, 10),
        this.getCustomerNotes(customerId),
        this.getReferralInfo(customerId),
      ]);

      return {
        customer,
        stats,
        visitHistory,
        notes,
        referralInfo,
      };
    } catch (error) {
      console.error('Error getting customer summary:', error);
      throw error;
    }
  }

  // Search customers by name, phone, or email
  static async searchCustomers(
    salonId: string,
    query: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salonId)
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // Get top customers by spending
  static async getTopCustomers(salonId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salonId)
        .order('total_spent', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting top customers:', error);
      throw error;
    }
  }

  // Get customers with upcoming appointments
  static async getCustomersWithUpcomingAppointments(
    salonId: string,
    days: number = 7
  ): Promise<any[]> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          customers (*),
          start_time
        `)
        .eq('salon_id', salonId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .in('status', ['scheduled', 'confirmed']);

      if (error) throw error;

      return (data || []).map((booking: any) => booking.customers);
    } catch (error) {
      console.error('Error getting customers with upcoming appointments:', error);
      throw error;
    }
  }
}
