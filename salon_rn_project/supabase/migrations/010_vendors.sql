-- ============================================
-- 010_vendors.sql
-- Vendors Table
-- ============================================
-- Description: Stores vendor information for product suppliers
-- Relationships: Many-to-one with profiles, Many-to-one with salons, One-to-many with products, orders
-- ============================================

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Vendor Information
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT vendors_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT vendors_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_salon_id ON public.vendors(salon_id);
CREATE INDEX IF NOT EXISTS idx_vendors_company_name ON public.vendors(company_name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);

-- Add comments for documentation
COMMENT ON TABLE public.vendors IS 'Vendor information for product suppliers';
COMMENT ON COLUMN public.vendors.id IS 'Primary key';
COMMENT ON COLUMN public.vendors.user_id IS 'Foreign key to profiles table';
COMMENT ON COLUMN public.vendors.salon_id IS 'Foreign key to salons table';
COMMENT ON COLUMN public.vendors.company_name IS 'Company name';
COMMENT ON COLUMN public.vendors.contact_person IS 'Primary contact person';
COMMENT ON COLUMN public.vendors.phone IS 'Contact phone number';
COMMENT ON COLUMN public.vendors.email IS 'Contact email address';
COMMENT ON COLUMN public.vendors.address IS 'Business address';
COMMENT ON COLUMN public.vendors.is_active IS 'Active status flag';
COMMENT ON COLUMN public.vendors.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.vendors.updated_at Is 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vendors_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.vendors (user_id, salon_id, company_name, contact_person, phone, email, address) VALUES
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Beauty Supply Co', 'John Smith', '+1234567893', 'john@beautysupply.com', '789 Supply Rd, City, State 12345'),
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Hair Products Inc', 'Jane Doe', '+1234567894', 'jane@hairproducts.com', '321 Product Ave, City, State 12345');
*/
