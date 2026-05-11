import { supabase, Database } from '../supabase';

export type Salon = Database['public']['Tables']['salons']['Row'];
export type SalonInsert = Database['public']['Tables']['salons']['Insert'];
export type SalonUpdate = Database['public']['Tables']['salons']['Update'];

export class SalonService {
  // Get salon by ID
  static async getSalonById(id: string): Promise<Salon | null> {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting salon:', error);
      throw error;
    }
  }

  // Get all salons
  static async getAllSalons(): Promise<Salon[]> {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting salons:', error);
      throw error;
    }
  }

  // Create salon
  static async createSalon(salon: SalonInsert): Promise<Salon> {
    try {
      const { data, error } = await supabase
        .from('salons')
        .insert(salon)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating salon:', error);
      throw error;
    }
  }

  // Update salon
  static async updateSalon(id: string, updates: SalonUpdate): Promise<Salon> {
    try {
      const { data, error } = await supabase
        .from('salons')
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
      console.error('Error updating salon:', error);
      throw error;
    }
  }

  // Delete salon
  static async deleteSalon(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('salons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting salon:', error);
      throw error;
    }
  }

  // Get salon with services
  static async getSalonWithServices(id: string) {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select(`
          *,
          services (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting salon with services:', error);
      throw error;
    }
  }

  // Get salon with staff
  static async getSalonWithStaff(id: string) {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select(`
          *,
          staff_members (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting salon with staff:', error);
      throw error;
    }
  }

  // Search salons
  static async searchSalons(query: string): Promise<Salon[]> {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching salons:', error);
      throw error;
    }
  }
}
