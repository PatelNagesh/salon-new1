import { supabase } from './supabase';

export interface Salon {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: Record<string, { open: string; close: string }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_id?: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  sort_order: number;
}

export class SalonService {
  static async getSalonById(salonId: string): Promise<Salon> {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getSalonsByOwner(ownerId: string): Promise<Salon[]> {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getAllActiveSalons(): Promise<Salon[]> {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createSalon(salon: Partial<Salon>): Promise<Salon> {
    const { data, error } = await supabase
      .from('salons')
      .insert(salon)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSalon(salonId: string, updates: Partial<Salon>): Promise<Salon> {
    const { data, error } = await supabase
      .from('salons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', salonId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSalon(salonId: string): Promise<void> {
    const { error } = await supabase
      .from('salons')
      .delete()
      .eq('id', salonId);

    if (error) throw error;
  }

  // Services CRUD
  static async getSalonServices(salonId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getServiceById(serviceId: string): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (error) throw error;
    return data;
  }

  static async createService(service: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteService(serviceId: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', serviceId);

    if (error) throw error;
  }

  // Service Categories
  static async getServiceCategories(salonId: string): Promise<ServiceCategory[]> {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('salon_id', salonId)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  static async createServiceCategory(
    category: Partial<ServiceCategory>
  ): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateServiceCategory(
    categoryId: string,
    updates: Partial<ServiceCategory>
  ): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteServiceCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  }

  // Analytics
  static async getSalonStats(salonId: string): Promise<{
    totalBookings: number;
    totalRevenue: number;
    activeCustomers: number;
    staffCount: number;
  }> {
    // Get booking count
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('status', 'completed');

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('salon_id', salonId)
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

    // Get active customers
    const { count: customerCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId);

    // Get staff count
    const { count: staffCount } = await supabase
      .from('staff_members')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true);

    return {
      totalBookings: bookingCount || 0,
      totalRevenue,
      activeCustomers: customerCount || 0,
      staffCount: staffCount || 0,
    };
  }
}
