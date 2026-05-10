-- ============================================
-- SEED DATA FOR SALON MANAGEMENT SYSTEM
-- ============================================

-- ============================================
-- INSERT TEST SALON
-- ============================================
INSERT INTO salons (id, name, description, address, phone, email, opening_hours, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Glamour Studio',
    'Premium beauty salon offering hair, nail, and spa services',
    '123 Main Street, Downtown',
    '+1-555-0100',
    'contact@glamourstudio.com',
    '{
        "0": {"open": "09:00", "close": "18:00"},
        "1": {"open": "09:00", "close": "20:00"},
        "2": {"open": "09:00", "close": "20:00"},
        "3": {"open": "09:00", "close": "20:00"},
        "4": {"open": "09:00", "close": "20:00"},
        "5": {"open": "09:00", "close": "18:00"},
        "6": {"open": "10:00", "close": "16:00"}
    }'::jsonb,
    true
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT SERVICE CATEGORIES
-- ============================================
INSERT INTO service_categories (id, salon_id, name, description, sort_order)
VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Hair Services', 'Hair cutting, styling, and treatments', 1),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Nail Services', 'Manicure, pedicure, and nail art', 2),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Spa Services', 'Massage, facials, and body treatments', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SERVICES
-- ============================================
INSERT INTO services (id, salon_id, name, description, duration, price, category, is_active)
VALUES
    -- Hair Services
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Haircut - Women', 'Professional women''s haircut with wash and style', 60, 65.00, 'Hair Services', true),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Haircut - Men', 'Professional men''s haircut with wash', 30, 35.00, 'Hair Services', true),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Hair Coloring', 'Full hair coloring service', 120, 120.00, 'Hair Services', true),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Hair Treatment', 'Deep conditioning treatment', 45, 50.00, 'Hair Services', true),

    -- Nail Services
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Manicure', 'Classic manicure with polish', 30, 25.00, 'Nail Services', true),
    ('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Pedicure', 'Classic pedicure with polish', 45, 35.00, 'Nail Services', true),
    ('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'Gel Nails', 'Gel nail application', 60, 45.00, 'Nail Services', true),

    -- Spa Services
    ('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Swedish Massage', '60-minute full body massage', 60, 80.00, 'Spa Services', true),
    ('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'Deep Tissue Massage', '60-minute deep tissue massage', 60, 95.00, 'Spa Services', true),
    ('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Facial Treatment', 'Deep cleansing facial', 45, 60.00, 'Spa Services', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT VENDORS
-- ============================================
INSERT INTO vendors (id, user_id, salon_id, company_name, contact_person, phone, email, address, is_active)
VALUES
    ('880e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440000', 'Beauty Supply Co', 'John Smith', '+1-555-0200', 'john@beautysupply.com', '456 Supply Road, Industrial Park', true),
    ('880e8400-e29b-41d4-a716-446655440002', NULL, '550e8400-e29b-41d4-a716-446655440000', 'Nail Products Inc', 'Jane Doe', '+1-555-0201', 'jane@nailproducts.com', '789 Nail Lane, Business District', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT PRODUCTS
-- ============================================
INSERT INTO products (id, vendor_id, salon_id, name, description, sku, category, price, cost, is_active)
VALUES
    -- Beauty Supply Co Products
    ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Premium Shampoo', 'Professional grade shampoo', 'BS-SH-001', 'Hair Care', 15.00, 8.00, true),
    ('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Hair Conditioner', 'Professional grade conditioner', 'BS-CD-001', 'Hair Care', 15.00, 8.00, true),
    ('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Hair Color - Black', 'Professional hair color', 'BS-HC-BLK', 'Hair Color', 25.00, 15.00, true),
    ('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Hair Color - Brown', 'Professional hair color', 'BS-HC-BRN', 'Hair Color', 25.00, 15.00, true),

    -- Nail Products Inc Products
    ('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Nail Polish - Red', 'Premium nail polish', 'NP-NP-RED', 'Nail Polish', 12.00, 6.00, true),
    ('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Nail Polish - Pink', 'Premium nail polish', 'NP-NP-PNK', 'Nail Polish', 12.00, 6.00, true),
    ('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Gel Base Coat', 'Professional gel base coat', 'NP-GB-001', 'Gel Products', 18.00, 10.00, true),
    ('990e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Gel Top Coat', 'Professional gel top coat', 'NP-GT-001', 'Gel Products', 18.00, 10.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT INVENTORY
-- ============================================
INSERT INTO inventory (id, product_id, salon_id, quantity, reorder_level)
VALUES
    ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 25, 10),
    ('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 25, 10),
    ('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 15, 5),
    ('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 15, 5),
    ('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 20, 8),
    ('aa0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 20, 8),
    ('aa0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 10, 5),
    ('aa0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 10, 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE STAFF SCHEDULE
-- ============================================
-- Note: This will be populated when staff members are created via auth
-- Example for a staff member with ID 'bb0e8400-e29b-41d4-a716-446655440001':
-- INSERT INTO staff_schedule (id, staff_member_id, day_of_week, start_time, end_time, is_working)
-- VALUES
--     ('cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 0, '09:00', '18:00', true),
--     ('cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440001', 1, '09:00', '20:00', true),
--     ('cc0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 2, '09:00', '20:00', true),
--     ('cc0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440001', 3, '09:00', '20:00', true),
--     ('cc0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', 4, '09:00', '20:00', true),
--     ('cc0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440001', 5, '09:00', '18:00', true),
--     ('cc0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440001', 6, '10:00', '16:00', true);

-- ============================================
-- SEED DATA COMPLETE
-- ============================================
-- Total records seeded:
-- - 1 salon
-- - 3 service categories
-- - 10 services
-- - 2 vendors
-- - 8 products
-- - 8 inventory records
--
-- Note: User-related tables (profiles, user_roles, staff_members, customers,
-- bookings, orders, order_items) will be populated through the application
-- as users register and interact with the system.