-- ============================================
-- 002_user_roles.sql
-- User Roles Table
-- ============================================
-- Description: Stores role assignments for users across salons
-- Relationships: Many-to-one with profiles, Many-to-one with salons
-- ============================================

-- Create user_role enum type
CREATE TYPE user_role_enum AS ENUM (
  'SUPER_ADMIN',
  'OWNER',
  'MANAGER',
  'STAFF',
  'VENDOR',
  'CUSTOMER'
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Role Information
  role user_role_enum NOT NULL DEFAULT 'CUSTOMER',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT user_roles_unique_user_salon UNIQUE (user_id, salon_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_salon_id ON public.user_roles(salon_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Add comments for documentation
COMMENT ON TABLE public.user_roles IS 'User role assignments across salons';
COMMENT ON COLUMN public.user_roles.id IS 'Primary key';
COMMENT ON COLUMN public.user_roles.user_id IS 'Foreign key to profiles table';
COMMENT ON COLUMN public.user_roles.salon_id IS 'Foreign key to salons table (nullable for SUPER_ADMIN)';
COMMENT ON COLUMN public.user_roles.role IS 'User role (SUPER_ADMIN, OWNER, MANAGER, STAFF, VENDOR, CUSTOMER)';
COMMENT ON COLUMN public.user_roles.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.user_roles.updated_at IS 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_roles_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'CUSTOMER'),
  ('00000000-0000-0000-0000-000000000002', 'STAFF'),
  ('00000000-0000-0000-0000-000000000003', 'SUPER_ADMIN');
*/
