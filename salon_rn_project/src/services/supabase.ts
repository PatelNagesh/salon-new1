import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fvukfkwsmeyojjppyjjv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dWtma3dzbWV5b2pqcHB5amp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjI1NjQsImV4cCI6MjA5MzkzODU2NH0.SWj-v5h0-lfGRzSYy-HsMOlyo1dP-hac8-DPMWsII8o';

// Secure storage adapter for React Native
const SecureStorageAdapter = {
  getItem: async (key: string) => {
    try {
      // Use Keychain for all authentication data
      if (key.startsWith('supabase.auth.') || key.includes('token') || key.includes('refresh')) {
        const result = await Keychain.getGenericPassword({ service: key });
        if (result) {
          return result.password;
        }
        return null;
      }
      // Use AsyncStorage for non-sensitive data
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Use Keychain for all authentication data
      if (key.startsWith('supabase.auth.') || key.includes('token') || key.includes('refresh')) {
        await Keychain.setGenericPassword(key, value, { service: key });
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (key.startsWith('supabase.auth.') || key.includes('token') || key.includes('refresh')) {
        await Keychain.resetGenericPassword({ service: key });
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types matching the new schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      salons: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          opening_hours: Record<string, any> | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          opening_hours?: Record<string, any> | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          opening_hours?: Record<string, any> | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          salon_id: string | null;
          role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'VENDOR' | 'CUSTOMER';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          salon_id?: string | null;
          role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'VENDOR' | 'CUSTOMER';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          salon_id?: string | null;
          role?: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'VENDOR' | 'CUSTOMER';
          created_at?: string;
          updated_at?: string;
        };
      };
      service_categories: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          description: string | null;
          duration: number;
          price: number;
          category: string | null;
          is_active: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          description?: string | null;
          duration: number;
          price: number;
          category?: string | null;
          is_active?: boolean;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          description?: string | null;
          duration?: number;
          price?: number;
          category?: string | null;
          is_active?: boolean;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff_members: {
        Row: {
          id: string;
          user_id: string | null;
          salon_id: string;
          role: 'STAFF' | 'MANAGER' | 'LEAD_STYLIST';
          hourly_rate: number | null;
          commission_rate: number | null;
          is_active: boolean;
          hire_date: string;
          termination_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          salon_id: string;
          role: 'STAFF' | 'MANAGER' | 'LEAD_STYLIST';
          hourly_rate?: number | null;
          commission_rate?: number | null;
          is_active?: boolean;
          hire_date?: string;
          termination_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          salon_id?: string;
          role?: 'STAFF' | 'MANAGER' | 'LEAD_STYLIST';
          hourly_rate?: number | null;
          commission_rate?: number | null;
          is_active?: boolean;
          hire_date?: string;
          termination_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff_schedule: {
        Row: {
          id: string;
          staff_member_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working: boolean;
        };
        Insert: {
          id?: string;
          staff_member_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working?: boolean;
        };
        Update: {
          id?: string;
          staff_member_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_working?: boolean;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string | null;
          salon_id: string;
          total_spent: number;
          visit_count: number;
          last_visit: string | null;
          notes: string | null;
          birthday: string | null;
          referral_source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          salon_id: string;
          total_spent?: number;
          visit_count?: number;
          last_visit?: string | null;
          notes?: string | null;
          birthday?: string | null;
          referral_source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          salon_id?: string;
          total_spent?: number;
          visit_count?: number;
          last_visit?: string | null;
          notes?: string | null;
          birthday?: string | null;
          referral_source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          salon_id: string;
          customer_id: string;
          service_id: string;
          staff_member_id: string;
          start_time: string;
          end_time: string;
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          notes: string | null;
          total_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          customer_id: string;
          service_id: string;
          staff_member_id: string;
          start_time: string;
          end_time: string;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          notes?: string | null;
          total_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          customer_id?: string;
          service_id?: string;
          staff_member_id?: string;
          start_time?: string;
          end_time?: string;
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
          notes?: string | null;
          total_price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          user_id: string | null;
          salon_id: string;
          company_name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          salon_id: string;
          company_name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          salon_id?: string;
          company_name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          vendor_id: string;
          salon_id: string;
          name: string;
          description: string | null;
          sku: string | null;
          category: string | null;
          price: number;
          cost: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          salon_id: string;
          name: string;
          description?: string | null;
          sku?: string | null;
          category?: string | null;
          price: number;
          cost: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          salon_id?: string;
          name?: string;
          description?: string | null;
          sku?: string | null;
          category?: string | null;
          price?: number;
          cost?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          salon_id: string;
          quantity: number;
          reorder_level: number;
          last_restocked: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          salon_id: string;
          quantity?: number;
          reorder_level?: number;
          last_restocked?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          salon_id?: string;
          quantity?: number;
          reorder_level?: number;
          last_restocked?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          vendor_id: string;
          salon_id: string;
          order_date: string;
          expected_delivery: string | null;
          status: 'pending' | 'ordered' | 'delivered' | 'cancelled';
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          salon_id: string;
          order_date?: string;
          expected_delivery?: string | null;
          status?: 'pending' | 'ordered' | 'delivered' | 'cancelled';
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          salon_id?: string;
          order_date?: string;
          expected_delivery?: string | null;
          status?: 'pending' | 'ordered' | 'delivered' | 'cancelled';
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
    };
  };
};
