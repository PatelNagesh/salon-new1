-- ============================================
-- 012_inventory.sql
-- Inventory Table
-- ============================================
-- Description: Stores inventory levels for products at each salon
-- Relationships: Many-to-one with products, Many-to-one with salons
-- ============================================

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Inventory Information
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reorder_level INTEGER NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
  last_restocked TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT inventory_unique_product_salon UNIQUE (product_id, salon_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_salon_id ON public.inventory(salon_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON public.inventory(quantity);

-- Add comments for documentation
COMMENT ON TABLE public.inventory IS 'Inventory levels for products at each salon';
COMMENT ON COLUMN public.inventory.id IS 'Primary key';
COMMENT ON COLUMN public.inventory.product_id IS 'Foreign key to products table';
COMMENT ON COLUMN public.inventory.salon_id Is 'Foreign key to salons table';
COMMENT ON COLUMN public.inventory.quantity Is 'Current stock quantity';
COMMENT ON COLUMN public.inventory.reorder_level Is 'Reorder threshold';
COMMENT ON COLUMN public.inventory.last_restocked Is 'Date of last restock';
COMMENT ON COLUMN public.inventory.created_at Is 'Record creation timestamp';
COMMENT ON COLUMN public.inventory.updated_at Is 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.inventory (product_id, salon_id, quantity, reorder_level, last_restocked) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 50, 10, '2026-05-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 45, 10, '2026-05-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 30, 15, '2026-05-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 25, 10, '2026-05-01 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 40, 10, '2026-05-01 00:00:00+00');
*/
