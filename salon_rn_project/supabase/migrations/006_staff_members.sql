-- ============================================
-- 006_staff_members.sql
-- Staff Members Table
-- ============================================
-- Description: Stores staff member information and employment details
-- Relationships: Many-to-one with profiles, Many-to-one with salons, One-to-many with staff_schedule, bookings
-- ============================================

-- Create staff_role enum type
CREATE TYPE staff_role_enum AS ENUM (
  'STAFF',
  'MANAGER',
  'LEAD_STYLIST'
);

-- Create staff_members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Staff Information
  role staff_role_enum NOT NULL DEFAULT 'STAFF',
  hourly_rate NUMERIC(10, 2) DEFAULT 0 CHECK (hourly_rate >= 0),
  commission_rate NUMERIC(5, 2) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100),

  -- Employment Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  hire_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  termination_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT staff_members_unique_user_salon UNIQUE (user_id, salon_id),
  CONSTRAINT staff_members_termination_date CHECK (
    (is_active = true AND termination_date IS NULL) OR
    (is_active = false AND termination_date IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON public.staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_salon_id ON public.staff_members(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON public.staff_members(role);
CREATE INDEX IF NOT EXISTS idx_staff_members_is_active ON public.staff_members(is_active);

-- Add comments for documentation
COMMENT ON TABLE public.staff_members IS 'Staff member information and employment details';
COMMENT ON COLUMN public.staff_members.id IS 'Primary key';
COMMENT ON COLUMN public.staff_members.user_id IS 'Foreign key to profiles table';
COMMENT ON COLUMN public.staff_members.salon_id IS 'Foreign key to salons table';
COMMENT ON COLUMN public.staff_members.role IS 'Staff role (STAFF, MANAGER, LEAD_STYLIST)';
COMMENT ON COLUMN public.staff_members.hourly_rate IS 'Hourly wage rate';
COMMENT ON COLUMN public.staff_members.commission_rate IS 'Commission percentage (0-100)';
COMMENT ON COLUMN public.staff_members.is_active IS 'Active employment status';
COMMENT ON COLUMN public.staff_members.hire_date IS 'Date of hire';
COMMENT ON COLUMN public.staff_members.termination_date IS 'Date of termination (if applicable)';
COMMENT ON COLUMN public.staff_members.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.staff_members.updated_at IS 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_staff_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_staff_members_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.staff_members (user_id, salon_id, role, hourly_rate, commission_rate) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'STAFF', 15.00, 10.00),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MANAGER', 25.00, 15.00),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'LEAD_STYLIST', 20.00, 20.00);
*/
