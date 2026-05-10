-- ============================================
-- 016_functions.sql
-- Database Functions
-- ============================================
-- Description: Business logic and helper functions
-- Security: SECURITY DEFINER for sensitive operations
-- ============================================

-- ============================================
-- Role Management Functions
-- ============================================

-- Update user role
CREATE OR REPLACE FUNCTION public.update_user_role(
  user_id UUID,
  new_role user_role_enum,
  salon_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Check if user has permission (super admin or owner of salon)
  IF NOT public.is_super_admin() AND NOT public.is_salon_owner(salon_id) THEN
    RAISE EXCEPTION 'Permission denied: Only super admin or salon owner can update roles';
  END IF;

  -- Update or insert user role
  INSERT INTO public.user_roles (user_id, salon_id, role)
  VALUES (user_id, salon_id, new_role)
  ON CONFLICT (user_id, salon_id)
  DO UPDATE SET
    role = new_role,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all salons for current user
CREATE OR REPLACE FUNCTION public.get_user_salons()
RETURNS TABLE (
  salon_id UUID,
  salon_name VARCHAR(255),
  role user_role_enum
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS salon_id,
    s.name AS salon_name,
    ur.role
  FROM public.user_roles ur
  JOIN public.salons s ON ur.salon_id = s.id
  WHERE ur.user_id = auth.uid()
    AND s.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role_enum;
BEGIN
  -- Get current user's role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Super admin has all permissions
  IF user_role = 'SUPER_ADMIN' THEN
    RETURN true;
  END IF;

  -- Check permissions based on role
  CASE user_role
    WHEN 'OWNER' THEN
      RETURN permission_name IN (
        'salon.view', 'salon.edit', 'salon.create',
        'staff.view', 'staff.create', 'staff.edit', 'staff.delete', 'staff.schedule',
        'service.view', 'service.create', 'service.edit', 'service.delete',
        'booking.view', 'booking.create', 'booking.edit', 'booking.cancel',
        'customer.view', 'customer.create', 'customer.edit',
        'reports.view', 'reports.export',
        'inventory.view', 'inventory.manage',
        'profile.edit'
      );
    WHEN 'MANAGER' THEN
      RETURN permission_name IN (
        'salon.view',
        'staff.view', 'staff.schedule',
        'service.view',
        'booking.view', 'booking.create', 'booking.edit',
        'customer.view',
        'reports.view',
        'profile.edit'
      );
    WHEN 'STAFF' THEN
      RETURN permission_name IN (
        'service.view',
        'booking.view', 'booking.create', 'booking.view_own',
        'profile.edit'
      );
    WHEN 'VENDOR' THEN
      RETURN permission_name IN (
        'inventory.view', 'inventory.manage',
        'product.create', 'product.edit',
        'order.view', 'order.create',
        'profile.edit'
      );
    WHEN 'CUSTOMER' THEN
      RETURN permission_name IN (
        'service.view',
        'booking.create', 'booking.view_own', 'booking.cancel',
        'profile.edit'
      );
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create salon for owner
CREATE OR REPLACE FUNCTION public.create_owner_salon(
  salon_name VARCHAR(255),
  owner_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
  new_salon_id UUID;
BEGIN
  -- Create new salon
  INSERT INTO public.salons (name, is_active)
  VALUES (salon_name, true)
  RETURNING id INTO new_salon_id;

  -- Assign owner role
  INSERT INTO public.user_roles (user_id, salon_id, role)
  VALUES (owner_user_id, new_salon_id, 'OWNER');

  RETURN new_salon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Business Logic Functions
-- ============================================

-- Get available time slots for booking
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  salon_id UUID,
  service_id UUID,
  staff_member_id UUID,
  booking_date DATE
)
RETURNS TABLE (
  slot_time TIMESTAMPTZ,
  available BOOLEAN
) AS $$
DECLARE
  service_duration INTEGER;
  salon_opening_hours JSONB;
  day_of_week INTEGER;
  start_hour INTEGER;
  end_hour INTEGER;
  slot_interval INTEGER := 30; -- 30-minute slots
BEGIN
  -- Get service duration
  SELECT duration INTO service_duration
  FROM public.services
  WHERE id = service_id;

  -- Get salon opening hours
  SELECT opening_hours INTO salon_opening_hours
  FROM public.salons
  WHERE id = salon_id;

  -- Get day of week (0=Sunday, 6=Saturday)
  day_of_week := EXTRACT(DOW FROM booking_date);

  -- Get opening hours for this day
  -- JSONB format: {"monday": {"open": "09:00", "close": "18:00"}, ...}
  -- Convert day number to day name
  CASE day_of_week
    WHEN 0 THEN start_hour := (EXTRACT(HOUR FROM (salon_opening_hours->>'sunday'->>'open')::time));
    WHEN 1 THEN start_hour := (EXTRACT(HOUR FROM (salon_opening_hours->>'monday'->>'open')::time));
    WHEN 2 THEN start_hour := (EXTRACT(HOUR FROM (salon_opening_hours->>'tuesday'->>'open')::time));
    WHEN 3 THEN start_hour := (EXTRACT(HOUR FROM (salon_opening_hours->>'wednesday'->>'open')::time));
    WHEN 4 THEN start_hour := (EXTRACT(HOUR FROM (salon_opening_hours->>'thursday'->>'open')::time));
    WHEN 5 THEN start_hour := (EXTRACT(HOUR FROM (salon_opening_hours->>'friday'->>'open')::time));
    WHEN 6 THEN start_hour := (EXTRACT(HOUR FROM (salon_opening_hours->>'saturday'->>'open')::time));
  END CASE;

  -- Default to 9 AM if not specified
  IF start_hour IS NULL THEN
    start_hour := 9;
  END IF;

  -- Default end hour to 6 PM
  end_hour := 18;

  -- Generate time slots
  RETURN QUERY
  WITH time_slots AS (
    SELECT
      (booking_date + (start_hour * INTERVAL '1 hour') + (n * slot_interval * INTERVAL '1 minute'))::timestamptz AS slot_time
    FROM generate_series(0, ((end_hour - start_hour) * 60 / slot_interval) - 1) AS n
  ),
  existing_bookings AS (
    SELECT start_time, end_time
    FROM public.bookings
    WHERE staff_member_id = get_available_time_slots.staff_member_id
      AND DATE(start_time) = booking_date
      AND status IN ('scheduled', 'completed')
  )
  SELECT
    ts.slot_time,
    NOT EXISTS (
      SELECT 1 FROM existing_bookings eb
      WHERE (
        (ts.slot_time >= eb.start_time AND ts.slot_time < eb.end_time) OR
        (ts.slot_time + (service_duration * INTERVAL '1 minute') > eb.start_time AND
         ts.slot_time + (service_duration * INTERVAL '1 minute') <= eb.end_time) OR
        (ts.slot_time <= eb.start_time AND
         ts.slot_time + (service_duration * INTERVAL '1 minute') >= eb.end_time)
      )
    ) AS available
  FROM time_slots ts
  WHERE ts.slot_time + (service_duration * INTERVAL '1 minute') <= (booking_date + (end_hour * INTERVAL '1 hour'))::timestamptz
  ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update customer statistics
CREATE OR REPLACE FUNCTION public.update_customer_stats(customer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.customers
  SET
    total_spent = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM public.bookings
      WHERE customer_id = update_customer_stats.customer_id
        AND status = 'completed'
    ),
    visit_count = (
      SELECT COUNT(*)
      FROM public.bookings
      WHERE customer_id = update_customer_stats.customer_id
        AND status = 'completed'
    ),
    last_visit = (
      SELECT MAX(start_time)
      FROM public.bookings
      WHERE customer_id = update_customer_stats.customer_id
        AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get salon statistics
CREATE OR REPLACE FUNCTION public.get_salon_stats(salon_id UUID)
RETURNS TABLE (
  total_bookings BIGINT,
  completed_bookings BIGINT,
  total_revenue NUMERIC,
  active_customers BIGINT,
  active_staff BIGINT,
  total_services BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.bookings WHERE salon_id = get_salon_stats.salon_id) AS total_bookings,
    (SELECT COUNT(*) FROM public.bookings WHERE salon_id = get_salon_stats.salon_id AND status = 'completed') AS completed_bookings,
    (SELECT COALESCE(SUM(total_price), 0) FROM public.bookings WHERE salon_id = get_salon_stats.salon_id AND status = 'completed') AS total_revenue,
    (SELECT COUNT(*) FROM public.customers WHERE salon_id = get_salon_stats.salon_id) AS active_customers,
    (SELECT COUNT(*) FROM public.staff_members WHERE salon_id = get_salon_stats.salon_id AND is_active = true) AS active_staff,
    (SELECT COUNT(*) FROM public.services WHERE salon_id = get_salon_stats.salon_id AND is_active = true) AS total_services;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check for booking conflicts
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  staff_member_id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bookings
    WHERE staff_member_id = check_booking_conflict.staff_member_id
      AND status IN ('scheduled', 'completed')
      AND (
        (start_time >= bookings.start_time AND start_time < bookings.end_time) OR
        (end_time > bookings.start_time AND end_time <= bookings.end_time) OR
        (start_time <= bookings.start_time AND end_time >= bookings.end_time)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger Functions
-- ============================================

-- Update customer stats on booking completion
CREATE OR REPLACE FUNCTION public.trigger_update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM public.update_customer_stats(NEW.customer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to bookings table
CREATE TRIGGER trigger_booking_update_customer_stats
  AFTER UPDATE OF status ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_customer_stats();

-- Update inventory on order delivery
CREATE OR REPLACE FUNCTION public.trigger_update_inventory_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Update inventory for each order item
    INSERT INTO public.inventory (product_id, salon_id, quantity, reorder_level, last_restocked)
    SELECT
      oi.product_id,
      o.salon_id,
      oi.quantity,
      10, -- Default reorder level
      NOW()
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE o.id = NEW.id
    ON CONFLICT (product_id, salon_id)
    DO UPDATE SET
      quantity = inventory.quantity + EXCLUDED.quantity,
      last_restocked = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to orders table
CREATE TRIGGER trigger_order_update_inventory
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_inventory_on_delivery();

-- ============================================
-- Utility Functions
-- ============================================

-- Generate UUID (helper function)
CREATE OR REPLACE FUNCTION public.generate_uuid()
RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v4();
END;
$$ LANGUAGE sql;

-- Get current timestamp
CREATE OR REPLACE FUNCTION public.current_timestamp()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW();
END;
$$ LANGUAGE sql;

-- Format phone number
CREATE OR REPLACE FUNCTION public.format_phone_number(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove all non-numeric characters
  phone_number := REGEXP_REPLACE(phone_number, '[^0-9]', '', 'g');

  -- Format as +1 (XXX) XXX-XXXX for US numbers
  IF LENGTH(phone_number) = 10 THEN
    RETURN '+1 (' || SUBSTRING(phone_number, 1, 3) || ') ' ||
           SUBSTRING(phone_number, 4, 3) || '-' || SUBSTRING(phone_number, 7, 4);
  ELSIF LENGTH(phone_number) = 11 AND SUBSTRING(phone_number, 1, 1) = '1' THEN
    RETURN '+' || SUBSTRING(phone_number, 1, 1) || ' (' ||
           SUBSTRING(phone_number, 2, 3) || ') ' ||
           SUBSTRING(phone_number, 5, 3) || '-' || SUBSTRING(phone_number, 8, 4);
  ELSE
    RETURN phone_number;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Validate email format
CREATE OR REPLACE FUNCTION public.is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Calculate age from birthday
CREATE OR REPLACE FUNCTION public.calculate_age(birthday DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birthday));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Grant Execute Permissions
-- ============================================

-- Grant execute permission on all functions to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_salons TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_owner_salon TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_time_slots TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_customer_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_salon_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_booking_conflict TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_salon_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_salon_owner TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_salon_manager TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_member TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_uuid TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_timestamp TO authenticated;
GRANT EXECUTE ON FUNCTION public.format_phone_number TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_age TO authenticated;
