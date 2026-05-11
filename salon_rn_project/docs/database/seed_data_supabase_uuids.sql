-- ============================================
-- SEED DATA FOR SALON MANAGEMENT SYSTEM
-- Using Supabase-generated UUIDs
-- ============================================

-- ============================================
-- INSERT TEST SALON
-- ============================================
INSERT INTO salons (name, description, address, phone, email, opening_hours, is_active)
VALUES (
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
) ON CONFLICT DO NOTHING;

-- Get the salon ID for subsequent inserts
DO $$
DECLARE
    v_salon_id UUID;
BEGIN
    SELECT id INTO v_salon_id FROM salons WHERE name = 'Glamour Studio' LIMIT 1;

    IF v_salon_id IS NOT NULL THEN
        -- ============================================
        -- INSERT SERVICE CATEGORIES
        -- ============================================
        INSERT INTO service_categories (salon_id, name, description, sort_order)
        VALUES
            (v_salon_id, 'Hair Services', 'Hair cutting, styling, and treatments', 1),
            (v_salon_id, 'Nail Services', 'Manicure, pedicure, and nail art', 2),
            (v_salon_id, 'Spa Services', 'Massage, facials, and body treatments', 3)
        ON CONFLICT DO NOTHING;

        -- ============================================
        -- INSERT SERVICES
        -- ============================================
        INSERT INTO services (salon_id, name, description, duration, price, category, is_active)
        VALUES
            -- Hair Services
            (v_salon_id, 'Haircut - Women', 'Professional women''s haircut with wash and style', 60, 65.00, 'Hair Services', true),
            (v_salon_id, 'Haircut - Men', 'Professional men''s haircut with wash', 30, 35.00, 'Hair Services', true),
            (v_salon_id, 'Hair Coloring', 'Full hair coloring service', 120, 120.00, 'Hair Services', true),
            (v_salon_id, 'Hair Treatment', 'Deep conditioning treatment', 45, 50.00, 'Hair Services', true),

            -- Nail Services
            (v_salon_id, 'Manicure', 'Classic manicure with polish', 30, 25.00, 'Nail Services', true),
            (v_salon_id, 'Pedicure', 'Classic pedicure with polish', 45, 35.00, 'Nail Services', true),
            (v_salon_id, 'Gel Nails', 'Gel nail application', 60, 45.00, 'Nail Services', true),

            -- Spa Services
            (v_salon_id, 'Swedish Massage', '60-minute full body massage', 60, 80.00, 'Spa Services', true),
            (v_salon_id, 'Deep Tissue Massage', '60-minute deep tissue massage', 60, 95.00, 'Spa Services', true),
            (v_salon_id, 'Facial Treatment', 'Deep cleansing facial', 45, 60.00, 'Spa Services', true)
        ON CONFLICT DO NOTHING;

        -- ============================================
        -- INSERT VENDORS
        -- ============================================
        INSERT INTO vendors (salon_id, company_name, contact_person, phone, email, address, is_active)
        VALUES
            (v_salon_id, 'Beauty Supply Co', 'John Smith', '+1-555-0200', 'john@beautysupply.com', '456 Supply Road, Industrial Park', true),
            (v_salon_id, 'Nail Products Inc', 'Jane Doe', '+1-555-0201', 'jane@nailproducts.com', '789 Nail Lane, Business District', true)
        ON CONFLICT DO NOTHING;

        -- ============================================
        -- INSERT PRODUCTS
        -- ============================================
        INSERT INTO products (salon_id, vendor_id, name, description, sku, category, price, cost, is_active)
        SELECT
            v_salon_id,
            v.id,
            p.name,
            p.description,
            p.sku,
            p.category,
            p.price,
            p.cost,
            true
        FROM (
            VALUES
                -- Beauty Supply Co Products
                ('Beauty Supply Co', 'Premium Shampoo', 'Professional grade shampoo', 'BS-SH-001', 'Hair Care', 15.00, 8.00),
                ('Beauty Supply Co', 'Hair Conditioner', 'Professional grade conditioner', 'BS-CD-001', 'Hair Care', 15.00, 8.00),
                ('Beauty Supply Co', 'Hair Color - Black', 'Professional hair color', 'BS-HC-BLK', 'Hair Color', 25.00, 15.00),
                ('Beauty Supply Co', 'Hair Color - Brown', 'Professional hair color', 'BS-HC-BRN', 'Hair Color', 25.00, 15.00),

                -- Nail Products Inc Products
                ('Nail Products Inc', 'Nail Polish - Red', 'Premium nail polish', 'NP-NP-RED', 'Nail Polish', 12.00, 6.00),
                ('Nail Products Inc', 'Nail Polish - Pink', 'Premium nail polish', 'NP-NP-PNK', 'Nail Polish', 12.00, 6.00),
                ('Nail Products Inc', 'Gel Base Coat', 'Professional gel base coat', 'NP-GB-001', 'Gel Products', 18.00, 10.00),
                ('Nail Products Inc', 'Gel Top Coat', 'Professional gel top coat', 'NP-GT-001', 'Gel Products', 18.00, 10.00)
        ) AS p(company_name, name, description, sku, category, price, cost)
        JOIN vendors v ON v.company_name = p.company_name AND v.salon_id = v_salon_id
        ON CONFLICT DO NOTHING;

        -- ============================================
        -- INSERT INVENTORY
        -- ============================================
        INSERT INTO inventory (salon_id, product_id, quantity, reorder_level)
        SELECT
            v_salon_id,
            p.id,
            CASE
                WHEN p.category = 'Hair Color' THEN 15
                WHEN p.category = 'Gel Products' THEN 10
                ELSE 25
            END,
            CASE
                WHEN p.category = 'Hair Color' THEN 5
                WHEN p.category = 'Gel Products' THEN 5
                ELSE 10
            END
        FROM products p
        WHERE p.salon_id = v_salon_id
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

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
--
-- IMPORTANT: This seed data uses Supabase-generated UUIDs via the DEFAULT
-- uuid_generate_v4() constraint on the id columns. No hardcoded UUIDs are used.
