-- ============================================
-- 004_services.sql
-- Services Table
-- ============================================
-- Description: Stores service offerings for each salon
-- Relationships: Many-to-one with salons, One-to-many with bookings
-- ============================================

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Key
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Service Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL CHECK (duration > 0), -- Duration in minutes
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category VARCHAR(100),

  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  image_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON public.services(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_name ON public.services(name);

-- Add comments for documentation
COMMENT ON TABLE public.services IS 'Service offerings for each salon';
COMMENT ON COLUMN public.services.id IS 'Primary key';
COMMENT ON COLUMN public.services.salon_id IS 'Foreign key to salons table';
COMMENT ON COLUMN public.services.name IS 'Service name';
COMMENT ON COLUMN public.services.description IS 'Service description';
COMMENT ON COLUMN public.services.duration IS 'Service duration in minutes';
COMMENT ON COLUMN public.services.price IS 'Service price';
COMMENT ON COLUMN public.services.category IS 'Service category';
COMMENT ON COLUMN public.services.is_active IS 'Active status flag';
COMMENT ON COLUMN public.services.image_url IS 'URL to service image';
COMMENT ON COLUMN public.services.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.services.updated_at IS 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_services_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.services (salon_id, name, description, duration, price, category) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Haircut', 'Professional haircut and styling', 30, 45.00, 'Hair'),
  ('00000000-0000-0000-0000-000000000001', 'Hair Coloring', 'Full hair coloring service', 120, 150.00, 'Hair'),
  ('00000000-0000-0000-0000-000000000001', 'Manicure', 'Classic manicure service', 45, 35.00, 'Nails'),
  ('00000000-0000-0000-0000-000000000001', 'Pedicure', 'Relaxing pedicure service', 60, 50.00, 'Nails'),
  ('00000000-0000-0000-0000-000000000001', 'Facial', 'Deep cleansing facial treatment', 60, 75.00, 'Skin Care');
*/
