-- ============================================
-- 001_profiles.sql
-- User Profiles Table
-- ============================================
-- Description: Stores user profile information linked to Supabase auth.users
-- Relationships: One-to-many with user_roles, staff_members, customers, vendors
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),

  -- Profile Information
  avatar_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(last_name, first_name);

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information linked to Supabase auth.users';
COMMENT ON COLUMN public.profiles.id IS 'Primary key, matches auth.users.id';
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.email IS 'User email address (unique)';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.profiles.updated_at IS 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.profiles (id, first_name, last_name, email, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John', 'Doe', 'john.doe@example.com', '+1234567890'),
  ('00000000-0000-0000-0000-000000000002', 'Jane', 'Smith', 'jane.smith@example.com', '+1234567891'),
  ('00000000-0000-0000-0000-000000000003', 'Admin', 'User', 'admin@salon.com', '+1234567892');
*/
