-- ============================================
-- 007_staff_schedule.sql
-- Staff Schedule Table
-- ============================================
-- Description: Stores staff availability and working hours
-- Relationships: Many-to-one with staff_members
-- ============================================

-- Create staff_schedule table
CREATE TABLE IF NOT EXISTS public.staff_schedule (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Key
  staff_member_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,

  -- Schedule Information
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN DEFAULT true NOT NULL,

  -- Constraints
  CONSTRAINT staff_schedule_time_order CHECK (start_time < end_time),
  CONSTRAINT staff_schedule_unique_day UNIQUE (staff_member_id, day_of_week)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_schedule_staff_member_id ON public.staff_schedule(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedule_day_of_week ON public.staff_schedule(day_of_week);

-- Add comments for documentation
COMMENT ON TABLE public.staff_schedule IS 'Staff availability and working hours';
COMMENT ON COLUMN public.staff_schedule.id Is 'Primary key';
COMMENT ON COLUMN public.staff_schedule.staff_member_id IS 'Foreign key to staff_members table';
COMMENT ON COLUMN public.staff_schedule.day_of_week IS 'Day of week (0=Sunday, 6=Saturday)';
COMMENT ON COLUMN public.staff_schedule.start_time IS 'Work start time';
COMMENT ON COLUMN public.staff_schedule.end_time IS 'Work end time';
COMMENT ON COLUMN public.staff_schedule.is_working IS 'Working status for this day';

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Uncomment to insert sample data
/*
-- Monday (day 1)
INSERT INTO public.staff_schedule (staff_member_id, day_of_week, start_time, end_time, is_working) VALUES
  ('00000000-0000-0000-0000-000000000001', 1, '09:00:00', '18:00:00', true);

-- Tuesday (day 2)
INSERT INTO public.staff_schedule (staff_member_id, day_of_week, start_time, end_time, is_working) VALUES
  ('00000000-0000-0000-0000-000000000001', 2, '09:00:00', '18:00:00', true);

-- Wednesday (day 3)
INSERT INTO public.staff_schedule (staff_member_id, day_of_week, start_time, end_time, is_working) VALUES
  ('00000000-0000-0000-0000-000000000001', 3, '09:00:00', '18:00:00', true);

-- Thursday (day 4)
INSERT INTO public.staff_schedule (staff_member_id, day_of_week, start_time, end_time, is_working) VALUES
  ('00000000-0000-0000-0000-000000000001', 4, '09:00:00', '18:00:00', true);

-- Friday (day 5)
INSERT INTO public.staff_schedule (staff_member_id, day_of_week, start_time, end_time, is_working) VALUES
  ('00000000-0000-0000-0000-000000000001', 5, '09:00:00', '18:00:00', true);

-- Saturday (day 6)
INSERT INTO public.staff_schedule (staff_member_id, day_of_week, start_time, end_time, is_working) VALUES
  ('00000000-0000-0000-0000-000000000001', 6, '10:00:00', '17:00:00', true);

-- Sunday (day 0)
INSERT INTO public.staff_schedule (staff_member_id, day_of_week, start_time, end_time, is_working) VALUES
  ('00000000-0000-0000-0000-000000000001', 0, '10:00:00', '15:00:00', true);
*/
