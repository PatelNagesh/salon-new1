import { supabase, Database } from '../supabase';

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export class CustomerService {
  // Get customer by ID
  static async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

  // Get all customers for a salon
  static async getCustomersBySalon(salonId: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salonId)
        .order('last_visit', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  }

  // Get customer with profile
  static async getCustomerWithProfile(id: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting customer with profile:', error);
      throw error;
    }
  }

  // Create customer
  static async createCustomer(customer: CustomerInsert): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Update customer
  static async updateCustomer(id: string, updates: CustomerUpdate): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
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
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete customer
  static async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Update customer statistics
  static async updateCustomerStats(customerId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_customer_stats', {
        target_customer_id: customerId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating customer stats:', error);
      throw error;
    }
  }

  // Search customers
  static async searchCustomers(salonId: string, query: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('salon_id', salonId)
        .or(`profile.first_name.ilike.%${query}%,profile.last_name.ilike.%${query}%,profile.email.ilike.%${query}%,profile.phone.ilike.%${query}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // Get top customers by spending
  static async getTopCustomers(salonId: string, limit: number = 10): Promise<Customer[]> {
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

  // Get recent customers
  static async getRecentCustomers(salonId: string, limit: number = 10): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('salon_id', salonId)
        .order('last_visit', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent customers:', error);
      throw error;
    }
  }
}
