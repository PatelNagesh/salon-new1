-- ============================================
-- 011_products.sql
-- Products Table
-- ============================================
-- Description: Stores product catalog information
-- Relationships: Many-to-one with vendors, Many-to-one with salons, One-to-many with inventory, order_items
-- ============================================

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Product Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  cost NUMERIC(10, 2) NOT NULL CHECK (cost >= 0),

  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_salon_id ON public.products(salon_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Add comments for documentation
COMMENT ON TABLE public.products IS 'Product catalog information';
COMMENT ON COLUMN public.products.id IS 'Primary key';
COMMENT ON COLUMN public.products.vendor_id IS 'Foreign key to vendors table';
COMMENT ON COLUMN public.products.salon_id IS 'Foreign key to salons table';
COMMENT ON COLUMN public.products.name IS 'Product name';
COMMENT ON COLUMN public.products.description IS 'Product description';
COMMENT ON COLUMN public.products.sku IS 'Stock keeping unit (unique)';
COMMENT ON COLUMN public.products.category IS 'Product category';
COMMENT ON COLUMN public.products.price IS 'Selling price';
COMMENT ON COLUMN public.products.cost Is 'Cost price';
COMMENT ON COLUMN public.products.is_active Is 'Active status flag';
COMMENT ON COLUMN public.products.created_at Is 'Record creation timestamp';
COMMENT ON COLUMN public.products.updated_at Is 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_products_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.products (vendor_id, salon_id, name, description, sku, category, price, cost) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Premium Shampoo', 'High-quality shampoo for all hair types', 'SHM-001', 'Hair Care', 25.00, 15.00),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Conditioner', 'Moisturizing conditioner', 'CDT-001', 'Hair Care', 28.00, 18.00),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Hair Spray', 'Strong hold hair spray', 'HSP-001', 'Styling', 18.00, 10.00),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Nail Polish', 'Long-lasting nail polish', 'NPL-001', 'Nails', 15.00, 8.00),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Nail File', 'Professional nail file', 'NFL-001', 'Nails', 5.00, 2.00);
*/
