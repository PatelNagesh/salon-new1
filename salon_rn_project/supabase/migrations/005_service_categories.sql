-- ============================================
-- 005_service_categories.sql
-- Service Categories Table
-- ============================================
-- Description: Stores service categories for organizing services
-- Relationships: Many-to-one with salons
-- ============================================

-- Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Key
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Category Information
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT service_categories_unique_salon_name UNIQUE (salon_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_categories_salon_id ON public.service_categories(salon_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_sort_order ON public.service_categories(sort_order);

-- Add comments for documentation
COMMENT ON TABLE public.service_categories IS 'Service categories for organizing services';
COMMENT ON COLUMN public.service_categories.id IS 'Primary key';
COMMENT ON COLUMN public.service_categories.salon_id IS 'Foreign key to salons table';
COMMENT ON COLUMN public.service_categories.name IS 'Category name';
COMMENT ON COLUMN public.service_categories.description IS 'Category description';
COMMENT ON COLUMN public.service_categories.sort_order IS 'Display order';
COMMENT ON COLUMN public.service_categories.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.service_categories.updated_at IS 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_categories_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.service_categories (salon_id, name, description, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Hair', 'Hair cutting and styling services', 1),
  ('00000000-0000-0000-0000-000000000001', 'Nails', 'Manicure and pedicure services', 2),
  ('00000000-0000-0000-0000-000000000001', 'Skin Care', 'Facial and skin treatments', 3),
  ('00000000-0000-0000-0000-000000000001', 'Makeup', 'Professional makeup services', 4),
  ('00000000-0000-0000-0000-000000000001', 'Spa', 'Relaxation and wellness services', 5);
*/
