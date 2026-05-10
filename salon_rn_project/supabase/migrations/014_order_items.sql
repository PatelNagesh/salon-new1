-- ============================================
-- 014_order_items.sql
-- Order Items Table
-- ============================================
-- Description: Stores individual items in an order
-- Relationships: Many-to-one with orders, Many-to-one with products
-- ============================================

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,

  -- Item Information
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT order_items_price_calculation CHECK (total_price = quantity * unit_price)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Add comments for documentation
COMMENT ON TABLE public.order_items IS 'Individual items in an order';
COMMENT ON COLUMN public.order_items.id IS 'Primary key';
COMMENT ON COLUMN public.order_items.order_id IS 'Foreign key to orders table';
COMMENT ON COLUMN public.order_items.product_id Is 'Foreign key to products table';
COMMENT ON COLUMN public.order_items.quantity Is 'Quantity ordered';
COMMENT ON COLUMN public.order_items.unit_price Is 'Price per unit';
COMMENT ON COLUMN public.order_items.total_price Is 'Total price (quantity × unit_price)';
COMMENT ON COLUMN public.order_items.created_at Is 'Record creation timestamp';

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 10, 25.00, 250.00),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 10, 25.00, 250.00),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 20, 15.00, 300.00);
*/
