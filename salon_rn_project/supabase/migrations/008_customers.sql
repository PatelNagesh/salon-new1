-- ============================================
-- 008_customers.sql
-- Customers Table
-- ============================================
-- Description: Stores customer information and visit history
-- Relationships: Many-to-one with profiles, Many-to-one with salons, One-to-many with bookings
-- ============================================

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Customer Information
  total_spent NUMERIC(12, 2) DEFAULT 0 CHECK (total_spent >= 0),
  visit_count INTEGER DEFAULT 0 CHECK (visit_count >= 0),
  last_visit TIMESTAMPTZ,
  notes TEXT,
  birthday DATE,
  referral_source VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT customers_unique_user_salon UNIQUE (user_id, salon_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon_id ON public.customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON public.customers(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customers_visit_count ON public.customers(visit_count DESC);

-- Add comments for documentation
COMMENT ON TABLE public.customers IS 'Customer information and visit history';
COMMENT ON COLUMN public.customers.id IS 'Primary key';
COMMENT ON COLUMN public.customers.user_id IS 'Foreign key to profiles table';
COMMENT ON COLUMN public.customers.salon_id Is 'Foreign key to salons table';
COMMENT ON COLUMN public.customers.total_spent IS 'Total amount spent by customer';
COMMENT ON COLUMN public.customers.visit_count Is 'Total number of visits';
COMMENT ON COLUMN public.customers.last_visit Is 'Date of last visit';
COMMENT ON COLUMN public.customers.notes Is 'Customer notes and preferences';
COMMENT ON COLUMN public.customers.birthday Is 'Customer birthday';
COMMENT ON COLUMN public.customers.referral_source Is 'How customer found the salon';
COMMENT ON COLUMN public.customers.created_at Is 'Record creation timestamp';
COMMENT ON COLUMN public.customers.updated_at Is 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customers_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.customers (user_id, salon_id, total_spent, visit_count, referral_source) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 250.00, 5, 'Friend'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 150.00, 3, 'Online'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 500.00, 10, 'Walk-in');
*/
