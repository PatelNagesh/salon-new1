import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from './useAuth';

/**
 * Salon Interface
 *
 * Defines the structure of a salon in the system.
 */
export interface Salon {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  business_hours?: BusinessHours;
  created_at: string;
  updated_at: string;
}

/**
 * Business Hours Interface
 *
 * Defines the business hours for a salon.
 */
export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

/**
 * Day Hours Interface
 *
 * Defines the hours for a specific day.
 */
export interface DayHours {
  open: string; // Format: "HH:mm"
  close: string; // Format: "HH:mm"
  closed: boolean;
}

/**
 * Salon Staff Interface
 *
 * Defines the structure of a staff member in a salon.
 */
export interface SalonStaff {
  id: string;
  salon_id: string;
  user_id: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

/**
 * Salon Service Interface
 *
 * Defines the structure of a service offered by a salon.
 */
export interface SalonService {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category?: string;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * useSalon Hook
 *
 * Provides salon-related functionality including fetching salon data,
 * managing salon information, and handling salon-specific operations.
 *
 * @returns {Object} Salon data and methods
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * const { salon, loading, error, updateSalon, fetchSalon } = useSalon();
 *
 * if (loading) return <ActivityIndicator />;
 * if (error) return <Error message={error} />;
 *
 * return <SalonProfile salon={salon} onUpdate={updateSalon} />;
 * ```
 */
export const useSalon = () => {
  const { salonId, user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the current user's salon data.
   */
  const fetchSalon = useCallback(async () => {
    if (!salonId) {
      setError('No salon ID found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (fetchError) throw fetchError;

      setSalon(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch salon';
      setError(errorMessage);
      console.error('Error fetching salon:', err);
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  /**
   * Update salon information.
   *
   * @param {Partial<Salon>} updates - The salon data to update
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const updateSalon = useCallback(async (updates: Partial<Salon>): Promise<boolean> => {
    if (!salonId) {
      setError('No salon ID found');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('salons')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', salonId);

      if (updateError) throw updateError;

      // Refresh salon data
      await fetchSalon();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update salon';
      setError(errorMessage);
      console.error('Error updating salon:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [salonId, fetchSalon]);

  /**
   * Fetch all staff members for the current salon.
   *
   * @returns {Promise<SalonStaff[]>} Array of staff members
   */
  const fetchStaff = useCallback(async (): Promise<SalonStaff[]> => {
    if (!salonId) {
      setError('No salon ID found');
      return [];
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('salon_staff')
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url)
        `)
        .eq('salon_id', salonId)
        .eq('status', 'active');

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff';
      setError(errorMessage);
      console.error('Error fetching staff:', err);
      return [];
    }
  }, [salonId]);

  /**
   * Fetch all services for the current salon.
   *
   * @returns {Promise<SalonService[]>} Array of services
   */
  const fetchServices = useCallback(async (): Promise<SalonService[]> => {
    if (!salonId) {
      setError('No salon ID found');
      return [];
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('active', true)
        .order('name');

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      setError(errorMessage);
      console.error('Error fetching services:', err);
      return [];
    }
  }, [salonId]);

  /**
   * Create a new service for the salon.
   *
   * @param {Partial<SalonService>} serviceData - The service data to create
   * @returns {Promise<SalonService | null>} The created service or null if failed
   */
  const createService = useCallback(async (
    serviceData: Partial<SalonService>
  ): Promise<SalonService | null> => {
    if (!salonId) {
      setError('No salon ID found');
      return null;
    }

    try {
      const { data, error: createError } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          salon_id: salonId,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service';
      setError(errorMessage);
      console.error('Error creating service:', err);
      return null;
    }
  }, [salonId]);

  /**
   * Update an existing service.
   *
   * @param {string} serviceId - The ID of the service to update
   * @param {Partial<SalonService>} updates - The service data to update
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const updateService = useCallback(async (
    serviceId: string,
    updates: Partial<SalonService>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('services')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update service';
      setError(errorMessage);
      console.error('Error updating service:', err);
      return false;
    }
  }, []);

  /**
   * Delete a service.
   *
   * @param {string} serviceId - The ID of the service to delete
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const deleteService = useCallback(async (serviceId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('services')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', serviceId);

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service';
      setError(errorMessage);
      console.error('Error deleting service:', err);
      return false;
    }
  }, []);

  // Fetch salon data on mount
  useEffect(() => {
    if (salonId) {
      fetchSalon();
    }
  }, [salonId, fetchSalon]);

  return {
    salon,
    loading,
    error,
    fetchSalon,
    updateSalon,
    fetchStaff,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
};

/**
 * useSalonStaff Hook
 *
 * Provides staff management functionality for a salon.
 *
 * @returns {Object} Staff data and methods
 *
 * @example
 * ```tsx
 * const { staff, loading, error, addStaff, removeStaff, updateStaffStatus } = useSalonStaff();
 * ```
 */
export const useSalonStaff = () => {
  const { salonId } = useAuth();
  const [staff, setStaff] = useState<SalonStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all staff members for the salon.
   */
  const fetchStaff = useCallback(async () => {
    if (!salonId) {
      setError('No salon ID found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('salon_staff')
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url)
        `)
        .eq('salon_id', salonId);

      if (fetchError) throw fetchError;

      setStaff(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff';
      setError(errorMessage);
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  /**
   * Add a new staff member to the salon.
   *
   * @param {string} userId - The user ID to add as staff
   * @param {string} role - The role for the staff member
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const addStaff = useCallback(async (
    userId: string,
    role: string
  ): Promise<boolean> => {
    if (!salonId) {
      setError('No salon ID found');
      return false;
    }

    try {
      const { error: addError } = await supabase
        .from('salon_staff')
        .insert({
          salon_id: salonId,
          user_id: userId,
          role,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (addError) throw addError;

      // Refresh staff list
      await fetchStaff();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add staff';
      setError(errorMessage);
      console.error('Error adding staff:', err);
      return false;
    }
  }, [salonId, fetchStaff]);

  /**
   * Remove a staff member from the salon.
   *
   * @param {string} staffId - The staff ID to remove
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const removeStaff = useCallback(async (staffId: string): Promise<boolean> => {
    try {
      const { error: removeError } = await supabase
        .from('salon_staff')
        .delete()
        .eq('id', staffId);

      if (removeError) throw removeError;

      // Refresh staff list
      await fetchStaff();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove staff';
      setError(errorMessage);
      console.error('Error removing staff:', err);
      return false;
    }
  }, [fetchStaff]);

  /**
   * Update a staff member's status.
   *
   * @param {string} staffId - The staff ID to update
   * @param {'active' | 'inactive' | 'pending'} status - The new status
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const updateStaffStatus = useCallback(async (
    staffId: string,
    status: 'active' | 'inactive' | 'pending'
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('salon_staff')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', staffId);

      if (updateError) throw updateError;

      // Refresh staff list
      await fetchStaff();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff status';
      setError(errorMessage);
      console.error('Error updating staff status:', err);
      return false;
    }
  }, [fetchStaff]);

  // Fetch staff on mount
  useEffect(() => {
    if (salonId) {
      fetchStaff();
    }
  }, [salonId, fetchStaff]);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    addStaff,
    removeStaff,
    updateStaffStatus,
  };
};
