import { supabase } from './supabase';
import { CustomerService as DatabaseCustomerService } from './database';

export interface Customer {
  id: string;
  user_id: string;
  salon_id: string;
  total_spent: number;
  visit_count: number;
  last_visit?: string;
  notes?: string;
  birthday?: string;
  referral_source?: string;
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

export interface CustomerCreate {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthday?: string;
  referralSource?: string;
}

export class CustomerService {
  static async getSalonCustomers(salonId: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profiles(first_name, last_name, email, phone, avatar_url)
        `)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting salon customers:', error);
      throw error;
    }
  }

  static async getCustomerById(customerId: string): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profiles(first_name, last_name, email, phone, avatar_url)
        `)
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting customer by ID:', error);
      throw error;
    }
  }

  static async createCustomer(
    salonId: string,
    customerData: CustomerCreate
  ): Promise<Customer> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customerData.email,
        password: generateTempPassword(),
        options: {
          data: {
            first_name: customerData.firstName,
            last_name: customerData.lastName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create customer record
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: authData.user.id,
          salon_id: salonId,
          birthday: customerData.birthday,
          referral_source: customerData.referralSource,
          total_spent: 0,
          visit_count: 0,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Update role
      await supabase.rpc('update_user_role', {
        user_id: authData.user.id,
        new_role: 'CUSTOMER',
        salon_id: salonId,
      });

      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  static async updateCustomer(
    customerId: string,
    updates: Partial<Customer>
  ): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  static async addCustomerNote(
    customerId: string,
    note: string
  ): Promise<Customer> {
    try {
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('notes')
        .eq('id', customerId)
        .single();

      if (fetchError) throw fetchError;

      const newNotes = customer.notes ? `${customer.notes}\n${note}` : note;

      const { data, error } = await supabase
        .from('customers')
        .update({ notes: newNotes, updated_at: new Date().toISOString() })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding customer note:', error);
      throw error;
    }
  }

  static async getCustomerHistory(
    customerId: string,
    limit = 10
  ): Promise<{
    bookings: any[];
    totalSpent: number;
    visitCount: number;
  }> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(name, price, duration),
          staff:staff_members(profiles(first_name, last_name))
        `)
        .eq('customer_id', customerId)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const totalSpent = bookings
        ?.filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

      const visitCount =
        bookings?.filter((b) => b.status === 'completed').length || 0;

      return {
        bookings: bookings || [],
        totalSpent,
        visitCount,
      };
    } catch (error) {
      console.error('Error getting customer history:', error);
      throw error;
    }
  }

  static async deleteCustomer(customerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  static async getTopCustomers(
    salonId: string,
    limit = 10
  ): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profiles(first_name, last_name, email, phone)
        `)
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
}

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8) + 'A1!';
}
