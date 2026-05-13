-- ============================================
-- COMPREHENSIVE SEED DATA FOR SALON MANAGEMENT SYSTEM
-- Using Supabase-generated UUIDs
-- ============================================

-- ============================================
-- INSERT PROFILES (User Profiles)
-- ============================================
INSERT INTO profiles (id, first_name, last_name, email, phone, avatar_url, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Admin', 'User', 'admin@salon.com', '+1-555-0001', 'https://example.com/avatars/admin.jpg', NOW(), NOW()),
  (uuid_generate_v4(), 'John', 'Owner', 'john@glamourstudio.com', '+1-555-0002', 'https://example.com/avatars/john.jpg', NOW(), NOW()),
  (uuid_generate_v4(), 'Sarah', 'Manager', 'sarah@glamourstudio.com', '+1-555-0003', 'https://example.com/avatars/sarah.jpg', NOW(), NOW()),
  (uuid_generate_v4(), 'Mike', 'Stylist', 'mike@glamourstudio.com', '+1-555-0004', 'https://example.com/avatars/mike.jpg', NOW(), NOW()),
  (uuid_generate_v4(), 'Emily', 'Stylist', 'emily@glamourstudio.com', '+1-555-0005', 'https://example.com/avatars/emily.jpg', NOW(), NOW()),
  (uuid_generate_v4(), 'David', 'Customer', 'david@gmail.com', '+1-555-0006', 'https://example.com/avatars/david.jpg', NOW(), NOW()),
  (uuid_generate_v4(), 'Lisa', 'Customer', 'lisa@gmail.com', '+1-555-0007', 'https://example.com/avatars/lisa.jpg', NOW(), NOW()),
  (uuid_generate_v4(), 'John', 'Smith', 'john@beautysupply.com', '+1-555-0200', 'https://example.com/avatars/vendor1.jpg', NOW(), NOW()),
  (uuid_generate_v4(), 'Jane', 'Doe', 'jane@nailproducts.com', '+1-555-0201', 'https://example.com/avatars/vendor2.jpg', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT USER ROLES
-- ============================================
DO $$
DECLARE
  v_admin_id UUID;
  v_owner_id UUID;
  v_manager_id UUID;
  v_stylist1_id UUID;
  v_stylist2_id UUID;
  v_customer1_id UUID;
  v_customer2_id UUID;
  v_vendor1_id UUID;
  v_vendor2_id UUID;
  v_salon_id UUID;
BEGIN
  -- Get profile IDs
  SELECT id INTO v_admin_id FROM profiles WHERE email = 'admin@salon.com' LIMIT 1;
  SELECT id INTO v_owner_id FROM profiles WHERE email = 'john@glamourstudio.com' LIMIT 1;
  SELECT id INTO v_manager_id FROM profiles WHERE email = 'sarah@glamourstudio.com' LIMIT 1;
  SELECT id INTO v_stylist1_id FROM profiles WHERE email = 'mike@glamourstudio.com' LIMIT 1;
  SELECT id INTO v_stylist2_id FROM profiles WHERE email = 'emily@glamourstudio.com' LIMIT 1;
  SELECT id INTO v_customer1_id FROM profiles WHERE email = 'david@gmail.com' LIMIT 1;
  SELECT id INTO v_customer2_id FROM profiles WHERE email = 'lisa@gmail.com' LIMIT 1;
  SELECT id INTO v_vendor1_id FROM profiles WHERE email = 'john@beautysupply.com' LIMIT 1;
  SELECT id INTO v_vendor2_id FROM profiles WHERE email = 'jane@nailproducts.com' LIMIT 1;

  -- Get salon ID
  SELECT id INTO v_salon_id FROM salons WHERE name = 'Glamour Studio' LIMIT 1;

  -- Insert user roles
  INSERT INTO user_roles (id, user_id, salon_id, role, created_at, updated_at)
  VALUES
    (uuid_generate_v4(), v_admin_id, NULL, 'SUPER_ADMIN', NOW(), NOW()),
    (uuid_generate_v4(), v_owner_id, v_salon_id, 'OWNER', NOW(), NOW()),
    (uuid_generate_v4(), v_manager_id, v_salon_id, 'MANAGER', NOW(), NOW()),
    (uuid_generate_v4(), v_stylist1_id, v_salon_id, 'STAFF', NOW(), NOW()),
    (uuid_generate_v4(), v_stylist2_id, v_salon_id, 'STAFF', NOW(), NOW()),
    (uuid_generate_v4(), v_customer1_id, v_salon_id, 'CUSTOMER', NOW(), NOW()),
    (uuid_generate_v4(), v_customer2_id, v_salon_id, 'CUSTOMER', NOW(), NOW()),
    (uuid_generate_v4(), v_vendor1_id, v_salon_id, 'VENDOR', NOW(), NOW()),
    (uuid_generate_v4(), v_vendor2_id, v_salon_id, 'VENDOR', NOW(), NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- INSERT STAFF MEMBERS
-- ============================================
DO $$
DECLARE
  v_manager_id UUID;
  v_stylist1_id UUID;
  v_stylist2_id UUID;
  v_salon_id UUID;
BEGIN
  -- Get profile IDs
  SELECT id INTO v_manager_id FROM profiles WHERE email = 'sarah@glamourstudio.com' LIMIT 1;
  SELECT id INTO v_stylist1_id FROM profiles WHERE email = 'mike@glamourstudio.com' LIMIT 1;
  SELECT id INTO v_stylist2_id FROM profiles WHERE email = 'emily@glamourstudio.com' LIMIT 1;

  -- Get salon ID
  SELECT id INTO v_salon_id FROM salons WHERE name = 'Glamour Studio' LIMIT 1;

  -- Insert staff members
  INSERT INTO staff_members (id, user_id, salon_id, role, hourly_rate, commission_rate, is_active, hire_date, created_at, updated_at)
  VALUES
    (uuid_generate_v4(), v_manager_id, v_salon_id, 'MANAGER', 35.00, 0.05, true, NOW() - INTERVAL '2 years', NOW(), NOW()),
    (uuid_generate_v4(), v_stylist1_id, v_salon_id, 'STAFF', 25.00, 0.10, true, NOW() - INTERVAL '1 year', NOW(), NOW()),
    (uuid_generate_v4(), v_stylist2_id, v_salon_id, 'STAFF', 25.00, 0.10, true, NOW() - INTERVAL '8 months', NOW(), NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- INSERT STAFF SCHEDULE
-- ============================================
DO $$
DECLARE
  v_staff1_id UUID;
  v_staff2_id UUID;
  v_staff3_id UUID;
  v_schedule_id UUID;
BEGIN
  -- Get staff member IDs
  SELECT id INTO v_staff1_id FROM staff_members WHERE role = 'MANAGER' LIMIT 1;
  SELECT id INTO v_staff2_id FROM staff_members WHERE role = 'STAFF' LIMIT 1 OFFSET 0;
  SELECT id INTO v_staff3_id FROM staff_members WHERE role = 'STAFF' LIMIT 1 OFFSET 1;

  -- Insert schedules for each staff member (7 days)
  FOR day_num IN 0..6 LOOP
    -- Manager schedule (Mon-Fri 9am-6pm)
    IF day_num >= 1 AND day_num <= 5 THEN
      INSERT INTO staff_schedule (id, staff_member_id, day_of_week, start_time, end_time, is_working)
      VALUES (uuid_generate_v4(), v_staff1_id, day_num, '09:00:00', '18:00:00', true)
      ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO staff_schedule (id, staff_member_id, day_of_week, start_time, end_time, is_working)
      VALUES (uuid_generate_v4(), v_staff1_id, day_num, '00:00:00', '00:00:00', false)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Stylist 1 schedule (Mon-Sat 9am-7pm)
    IF day_num >= 1 AND day_num <= 6 THEN
      INSERT INTO staff_schedule (id, staff_member_id, day_of_week, start_time, end_time, is_working)
      VALUES (uuid_generate_v4(), v_staff2_id, day_num, '09:00:00', '19:00:00', true)
      ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO staff_schedule (id, staff_member_id, day_of_week, start_time, end_time, is_working)
      VALUES (uuid_generate_v4(), v_staff2_id, day_num, '00:00:00', '00:00:00', false)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Stylist 2 schedule (Tue-Sat 10am-6pm)
    IF day_num >= 2 AND day_num <= 6 THEN
      INSERT INTO staff_schedule (id, staff_member_id, day_of_week, start_time, end_time, is_working)
      VALUES (uuid_generate_v4(), v_staff3_id, day_num, '10:00:00', '18:00:00', true)
      ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO staff_schedule (id, staff_member_id, day_of_week, start_time, end_time, is_working)
      VALUES (uuid_generate_v4(), v_staff3_id, day_num, '00:00:00', '00:00:00', false)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- INSERT CUSTOMERS
-- ============================================
DO $$
DECLARE
  v_customer1_id UUID;
  v_customer2_id UUID;
  v_salon_id UUID;
BEGIN
  -- Get profile IDs
  SELECT id INTO v_customer1_id FROM profiles WHERE email = 'david@gmail.com' LIMIT 1;
  SELECT id INTO v_customer2_id FROM profiles WHERE email = 'lisa@gmail.com' LIMIT 1;

  -- Get salon ID
  SELECT id INTO v_salon_id FROM salons WHERE name = 'Glamour Studio' LIMIT 1;

  -- Insert customers
  INSERT INTO customers (id, user_id, salon_id, total_spent, visit_count, last_visit, notes, birthday, referral_source, created_at, updated_at)
  VALUES
    (uuid_generate_v4(), v_customer1_id, v_salon_id, 350.00, 5, NOW() - INTERVAL '1 week', 'Prefers morning appointments', '1990-05-15', 'Friend', NOW(), NOW()),
    (uuid_generate_v4(), v_customer2_id, v_salon_id, 180.00, 3, NOW() - INTERVAL '2 weeks', 'Allergic to certain products', '1985-08-22', 'Online', NOW(), NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- INSERT BOOKINGS
-- ============================================
DO $$
DECLARE
  v_salon_id UUID;
  v_customer1_id UUID;
  v_customer2_id UUID;
  v_service1_id UUID;
  v_service2_id UUID;
  v_service3_id UUID;
  v_staff1_id UUID;
  v_staff2_id UUID;
  v_booking_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO v_salon_id FROM salons WHERE name = 'Glamour Studio' LIMIT 1;
  SELECT id INTO v_customer1_id FROM customers WHERE user_id = (SELECT id FROM profiles WHERE email = 'david@gmail.com' LIMIT 1) LIMIT 1;
  SELECT id INTO v_customer2_id FROM customers WHERE user_id = (SELECT id FROM profiles WHERE email = 'lisa@gmail.com' LIMIT 1) LIMIT 1;
  SELECT id INTO v_service1_id FROM services WHERE name = 'Haircut - Women' LIMIT 1;
  SELECT id INTO v_service2_id FROM services WHERE name = 'Manicure' LIMIT 1;
  SELECT id INTO v_service3_id FROM services WHERE name = 'Swedish Massage' LIMIT 1;
  SELECT id INTO v_staff1_id FROM staff_members WHERE role = 'STAFF' LIMIT 1 OFFSET 0;
  SELECT id INTO v_staff2_id FROM staff_members WHERE role = 'STAFF' LIMIT 1 OFFSET 1;

  -- Insert past bookings (completed)
  INSERT INTO bookings (id, salon_id, customer_id, service_id, staff_member_id, start_time, end_time, status, notes, total_price, created_at, updated_at)
  VALUES
    (uuid_generate_v4(), v_salon_id, v_customer1_id, v_service1_id, v_staff1_id, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks' + INTERVAL '1 hour', 'completed', 'Regular customer', 65.00, NOW() - INTERVAL '3 weeks', NOW()),
    (uuid_generate_v4(), v_salon_id, v_customer1_id, v_service2_id, v_staff2_id, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week' + INTERVAL '30 minutes', 'completed', NULL, 25.00, NOW() - INTERVAL '2 weeks', NOW()),
    (uuid_generate_v4(), v_salon_id, v_customer2_id, v_service3_id, v_staff1_id, NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks' + INTERVAL '1 hour', 'completed', 'First massage', 80.00, NOW() - INTERVAL '4 weeks', NOW())
  ON CONFLICT DO NOTHING;

  -- Insert upcoming bookings (scheduled)
  INSERT INTO bookings (id, salon_id, customer_id, service_id, staff_member_id, start_time, end_time, status, notes, total_price, created_at, updated_at)
  VALUES
    (uuid_generate_v4(), v_salon_id, v_customer1_id, v_service1_id, v_staff1_id, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 'scheduled', NULL, 65.00, NOW(), NOW()),
    (uuid_generate_v4(), v_salon_id, v_customer2_id, v_service2_id, v_staff2_id, NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '30 minutes', 'scheduled', NULL, 25.00, NOW(), NOW()),
    (uuid_generate_v4(), v_salon_id, v_customer1_id, v_service3_id, v_staff1_id, NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '1 hour', 'scheduled', NULL, 80.00, NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- Insert cancelled booking
  INSERT INTO bookings (id, salon_id, customer_id, service_id, staff_member_id, start_time, end_time, status, notes, total_price, created_at, updated_at)
  VALUES
    (uuid_generate_v4(), v_salon_id, v_customer2_id, v_service1_id, v_staff2_id, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '1 hour', 'cancelled', 'Customer cancelled', 65.00, NOW() - INTERVAL '5 days', NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- INSERT ORDERS
-- ============================================
DO $$
DECLARE
  v_salon_id UUID;
  v_vendor1_id UUID;
  v_vendor2_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO v_salon_id FROM salons WHERE name = 'Glamour Studio' LIMIT 1;
  SELECT id INTO v_vendor1_id FROM vendors WHERE company_name = 'Beauty Supply Co' LIMIT 1;
  SELECT id INTO v_vendor2_id FROM vendors WHERE company_name = 'Nail Products Inc' LIMIT 1;

  -- Insert orders
  INSERT INTO orders (id, vendor_id, salon_id, order_date, expected_delivery, status, total_amount, notes, created_at, updated_at)
  VALUES
    (uuid_generate_v4(), v_vendor1_id, v_salon_id, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 week', 'delivered', 150.00, 'Monthly restock', NOW() - INTERVAL '2 weeks', NOW()),
    (uuid_generate_v4(), v_vendor2_id, v_salon_id, NOW() - INTERVAL '1 week', NOW() + INTERVAL '3 days', 'ordered', 72.00, 'Nail supplies', NOW() - INTERVAL '1 week', NOW()),
    (uuid_generate_v4(), v_vendor1_id, v_salon_id, NOW(), NOW() + INTERVAL '1 week', 'pending', 200.00, 'Bulk order', NOW(), NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- INSERT ORDER ITEMS
-- ============================================
DO $$
DECLARE
  v_order1_id UUID;
  v_order2_id UUID;
  v_order3_id UUID;
  v_product1_id UUID;
  v_product2_id UUID;
  v_product3_id UUID;
  v_product4_id UUID;
  v_product5_id UUID;
BEGIN
  -- Get order IDs
  SELECT id INTO v_order1_id FROM orders WHERE status = 'delivered' LIMIT 1;
  SELECT id INTO v_order2_id FROM orders WHERE status = 'ordered' LIMIT 1;
  SELECT id INTO v_order3_id FROM orders WHERE status = 'pending' LIMIT 1;

  -- Get product IDs
  SELECT id INTO v_product1_id FROM products WHERE sku = 'BS-SH-001' LIMIT 1;
  SELECT id INTO v_product2_id FROM products WHERE sku = 'BS-CD-001' LIMIT 1;
  SELECT id INTO v_product3_id FROM products WHERE sku = 'NP-NP-RED' LIMIT 1;
  SELECT id INTO v_product4_id FROM products WHERE sku = 'NP-NP-PNK' LIMIT 1;
  SELECT id INTO v_product5_id FROM products WHERE sku = 'BS-HC-BLK' LIMIT 1;

  -- Insert order items for delivered order
  INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at)
  VALUES
    (uuid_generate_v4(), v_order1_id, v_product1_id, 5, 15.00, 75.00, NOW()),
    (uuid_generate_v4(), v_order1_id, v_product2_id, 5, 15.00, 75.00, NOW())
  ON CONFLICT DO NOTHING;

  -- Insert order items for ordered order
  INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at)
  VALUES
    (uuid_generate_v4(), v_order2_id, v_product3_id, 3, 12.00, 36.00, NOW()),
    (uuid_generate_v4(), v_order2_id, v_product4_id, 3, 12.00, 36.00, NOW())
  ON CONFLICT DO NOTHING;

  -- Insert order items for pending order
  INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at)
  VALUES
    (uuid_generate_v4(), v_order3_id, v_product1_id, 10, 15.00, 150.00, NOW()),
    (uuid_generate_v4(), v_order3_id, v_product5_id, 2, 25.00, 50.00, NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- SEED DATA COMPLETE
-- ============================================
-- Total records seeded:
-- - 9 profiles
-- - 9 user_roles
-- - 3 staff_members
-- - 21 staff_schedule (7 days × 3 staff)
-- - 2 customers
-- - 7 bookings (3 completed, 3 scheduled, 1 cancelled)
-- - 3 orders (1 delivered, 1 ordered, 1 pending)
-- - 6 order_items
--
-- Note: All UUIDs are generated using Supabase's uuid_generate_v4()
-- function for realistic, non-hardcoded identifiers.
