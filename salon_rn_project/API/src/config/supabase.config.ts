import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase configuration
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  storageUrl?: string;
}

/**
 * Get Supabase configuration from environment variables
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('SUPABASE_URL environment variable is required');
  }

  if (!anonKey) {
    throw new Error('SUPABASE_ANON_KEY environment variable is required');
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
    storageUrl: process.env.SUPABASE_STORAGE_URL
  };
}

/**
 * Validate Supabase configuration
 */
export function validateSupabaseConfig(config: SupabaseConfig): boolean {
  if (!config.url) {
    throw new Error('Supabase URL is required');
  }

  if (!config.anonKey) {
    throw new Error('Supabase anon key is required');
  }

  try {
    new URL(config.url);
  } catch (error) {
    throw new Error('Invalid Supabase URL format');
  }

  return true;
}

/**
 * Create Supabase client with anon key
 */
export function createSupabaseClient(config?: SupabaseConfig): SupabaseClient {
  const supabaseConfig = config || getSupabaseConfig();
  validateSupabaseConfig(supabaseConfig);

  return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window?.localStorage // Use localStorage in browser
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'salon-api'
      }
    }
  });
}

/**
 * Create Supabase admin client with service role key
 */
export function createSupabaseAdminClient(config?: SupabaseConfig): SupabaseClient {
  const supabaseConfig = config || getSupabaseConfig();

  if (!supabaseConfig.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin client');
  }

  validateSupabaseConfig(supabaseConfig);

  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'salon-api-admin'
      }
    }
  });
}

/**
 * Global Supabase client instance
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

/**
 * Global Supabase admin client instance
 */
let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Get or create Supabase admin client
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createSupabaseAdminClient();
  }
  return supabaseAdminClient;
}

/**
 * Reset Supabase clients (useful for testing)
 */
export function resetSupabaseClients(): void {
  supabaseClient = null;
  supabaseAdminClient = null;
}

/**
 * Supabase configuration for different environments
 */
export const supabaseConfigs = {
  development: {
    url: process.env.DEV_SUPABASE_URL || 'http://localhost:54321',
    anonKey: process.env.DEV_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.DEV_SUPABASE_SERVICE_ROLE_KEY || ''
  },
  staging: {
    url: process.env.STAGING_SUPABASE_URL || '',
    anonKey: process.env.STAGING_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || ''
  },
  production: {
    url: process.env.PROD_SUPABASE_URL || '',
    anonKey: process.env.PROD_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || ''
  }
};

/**
 * Get Supabase configuration for current environment
 */
export function getSupabaseConfigForEnvironment(env?: string): SupabaseConfig {
  const environment = env || process.env.NODE_ENV || 'development';

  switch (environment) {
    case 'staging':
      return supabaseConfigs.staging;
    case 'production':
      return supabaseConfigs.production;
    default:
      return supabaseConfigs.development;
  }
}

/**
 * Supabase table names
 */
export const SupabaseTables = {
  PROFILES: 'profiles',
  SALONS: 'salons',
  SERVICES: 'services',
  STAFF: 'staff',
  CUSTOMERS: 'customers',
  BOOKINGS: 'bookings',
  VENDORS: 'vendors',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  ORDERS: 'orders'
} as const;

/**
 * Supabase storage buckets
 */
export const SupabaseStorageBuckets = {
  PROFILES: 'profiles',
  SERVICES: 'services',
  PRODUCTS: 'products',
  DOCUMENTS: 'documents'
} as const;

/**
 * Supabase realtime channels
 */
export const SupabaseRealtimeChannels = {
  BOOKINGS: 'bookings',
  INVENTORY: 'inventory',
  ORDERS: 'orders',
  NOTIFICATIONS: 'notifications'
} as const;
