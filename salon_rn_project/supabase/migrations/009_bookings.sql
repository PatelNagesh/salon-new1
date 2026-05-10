-- ============================================
-- 009_bookings.sql
-- Bookings Table
-- ============================================
-- Description: Stores appointment and booking information
-- Relationships: Many-to-one with salons, customers, services, staff_members
-- ============================================

-- Create booking_status enum type
CREATE TYPE booking_status_enum AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'no-show'
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  staff_member_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,

  -- Booking Information
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status booking_status_enum NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT bookings_time_order CHECK (start_time < end_time)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_salon_id ON public.bookings(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_member_id ON public.bookings(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_salon_time ON public.bookings(salon_id, start_time);

-- Add comments for documentation
COMMENT ON TABLE public.bookings IS 'Appointment and booking information';
COMMENT ON COLUMN public.bookings.id IS 'Primary key';
COMMENT ON COLUMN public.bookings.salon_id IS 'Foreign key to salons table';
COMMENT ON COLUMN public.bookings.customer_id IS 'Foreign key to customers table';
COMMENT ON COLUMN public.bookings.service_id IS 'Foreign key to services table';
COMMENT ON COLUMN public.bookings.staff_member_id IS 'Foreign key to staff_members table';
COMMENT ON COLUMN public.bookings.start_time IS 'Appointment start time';
COMMENT ON COLUMN public.bookings.end_time IS 'Appointment end time';
COMMENT ON COLUMN public.bookings.status IS 'Booking status (scheduled, completed, cancelled, no-show)';
COMMENT ON COLUMN public.bookings.notes IS 'Booking notes and special requests';
COMMENT ON COLUMN public.bookings.total_price IS 'Total price for the booking';
COMMENT ON COLUMN public.bookings.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.bookings.updated_at Is 'Record last update timestamp';

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bookings_updated_at();

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
INSERT INTO public.bookings (salon_id, customer_id, service_id, staff_member_id, start_time, end_time, status, total_price) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-05-15 10:00:00+00', '2026-05-15 10:30:00+00', 'scheduled', 45.00),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-05-15 14:00:00+00', '2026-05-15 16:00:00+00', 'completed', 150.00),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '2026-05-16 11:00:00+00', '2026-05-16 11:30:00+00', 'scheduled', 45.00);
*/
