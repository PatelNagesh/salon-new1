-- ============================================
-- 003_salons.sql
-- Salons Table
-- ============================================
-- Description: Stores salon location and business information
-- Relationships: One-to-many with services, staff_members, customers, bookings, vendors
-- ============================================

-- Create salons table
CREATE TABLE IF NOT EXISTS public.salons (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Salon Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),

  -- Business Hours (JSONB format)
  -- Example: {"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {...}}
  opening_hours JSONB DEFAULT '{}'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT salons_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT salons_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_salons_name ON public.salons(name);
CREATE INDEX IF NOT EXISTS idx_salons_is_active ON public.salons(is_active);
CREATE INDEX IF NOT EXISTS idx_salons_opening_hours ON public.salons USING GIN (opening_hours);

-- Add comments for documentation
COMMENT ON TABLE public.salons IS 'Salon locations and business information';
COMMENT ON COLUMN public.salons.id IS 'Primary key';
COMMENT ON COLUMN public.salons.name IS 'Salon name';
COMMENT ON COLUMN public.salons.description IS 'Salon description';
COMMENT ON COLUMN public.salons.address IS 'Physical address';
COMMENT ON COLUMN public.salons.phone IS 'Contact phone number';
COMMENT ON COLUMN public.salons.email IS 'Contact email address';
COMMENT ON COLUMN public.salons.opening_hours IS 'Business hours in JSONB format';
COMMENT ON COLUMN public.salons.is_active IS 'Active status flag';
COMMENT ON COLUMN public.salons.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.salons.updated_at IS 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_salons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_salons_updated_at
  BEFORE UPDATE ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_salons_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.salons (name, description, address, phone, email, opening_hours) VALUES
  ('Downtown Beauty Salon', 'Premium beauty services in downtown', '123 Main St, City, State 12345', '+1234567890', 'downtown@salon.com',
   '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "10:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "15:00"}}'::jsonb),
  ('Uptown Style Studio', 'Modern styling and hair care', '456 Oak Ave, City, State 12345', '+1234567891', 'uptown@salon.com',
   '{"monday": {"open": "10:00", "close": "19:00"}, "tuesday": {"open": "10:00", "close": "19:00"}, "wednesday": {"open": "10:00", "close": "19:00"}, "thursday": {"open": "10:00", "close": "19:00"}, "friday": {"open": "10:00", "close": "19:00"}, "saturday": {"open": "09:00", "close": "18:00"}, "sunday": {"open": "11:00", "close": "16:00"}}'::jsonb);
*/
