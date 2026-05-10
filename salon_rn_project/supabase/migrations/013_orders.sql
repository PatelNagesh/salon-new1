-- ============================================
-- 013_orders.sql
-- Orders Table
-- ============================================
-- Description: Stores supply orders from vendors
-- Relationships: Many-to-one with vendors, Many-to-one with salons, One-to-many with order_items
-- ============================================

-- Create order_status enum type
CREATE TYPE order_status_enum AS ENUM (
  'pending',
  'ordered',
  'delivered',
  'cancelled'
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,

  -- Order Information
  order_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expected_delivery TIMESTAMPTZ,
  status order_status_enum NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_salon_id ON public.orders(salon_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Add comments for documentation
COMMENT ON TABLE public.orders IS 'Supply orders from vendors';
COMMENT ON COLUMN public.orders.id IS 'Primary key';
COMMENT ON COLUMN public.orders.vendor_id IS 'Foreign key to vendors table';
COMMENT ON COLUMN public.orders.salon_id Is 'Foreign key to salons table';
COMMENT ON COLUMN public.orders.order_date Is 'Order date';
COMMENT ON COLUMN public.orders.expected_delivery Is 'Expected delivery date';
COMMENT ON COLUMN public.orders.status Is 'Order status (pending, ordered, delivered, cancelled)';
COMMENT ON COLUMN public.orders.total_amount Is 'Total order amount';
COMMENT ON COLUMN public.orders.notes Is 'Order notes';
COMMENT ON COLUMN public.orders.created_at Is 'Record creation timestamp';
COMMENT ON COLUMN public.orders.updated_at Is 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.orders (vendor_id, salon_id, order_date, expected_delivery, status, total_amount) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-05-10 00:00:00+00', '2026-05-15 00:00:00+00', 'ordered', 500.00),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-05-08 00:00:00+00', '2026-05-12 00:00:00+00', 'delivered', 300.00);
*/
