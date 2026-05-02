import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStore } from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Storage adapter for React Native
const ReactNativeAsyncStorage = {
  getItem: async (key: string) => {
    try {
      // Use SecureStore for sensitive data
      if (key.includes('token') || key.includes('session')) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Use SecureStore for sensitive data
      if (key.includes('token') || key.includes('session')) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (key.includes('token') || key.includes('session')) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ReactNativeAsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export type Database = {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'VENDOR' | 'CUSTOMER';
          salon_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'VENDOR' | 'CUSTOMER';
          salon_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'VENDOR' | 'CUSTOMER';
          salon_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      salons: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};