import { supabase, Database } from '../supabase';

export type Service = Database['public']['Tables']['services']['Row'];
export type ServiceInsert = Database['public']['Tables']['services']['Insert'];
export type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export class ServiceService {
  // Get service by ID
  static async getServiceById(id: string): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting service:', error);
      throw error;
    }
  }

  // Get all services for a salon
  static async getServicesBySalon(salonId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting services:', error);
      throw error;
    }
  }

  // Get services by category
  static async getServicesByCategory(salonId: string, category: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('category', category)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting services by category:', error);
      throw error;
    }
  }

  // Create service
  static async createService(service: ServiceInsert): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  // Update service
  static async updateService(id: string, updates: ServiceUpdate): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('services')
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
      console.error('Error updating service:', error);
      throw error;
    }
  }

  // Delete service
  static async deleteService(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Search services
  static async searchServices(salonId: string, query: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  }

  // Get service categories for a salon
  static async getServiceCategories(salonId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('category')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (error) throw error;

      const categories = [...new Set(data?.map(s => s.category).filter(Boolean) || [])];
      return categories;
    } catch (error) {
      console.error('Error getting service categories:', error);
      throw error;
    }
  }
}
