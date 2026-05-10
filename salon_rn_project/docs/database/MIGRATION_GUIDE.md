# Database Migration Guide

## Overview
This guide provides comprehensive documentation for database migrations in the Salon Management System.

## Migration Files

### Phase 1: Core Schema (Already Applied)
Tables were created during initial setup:
- profiles
- salons
- user_roles
- service_categories
- services
- staff_members
- staff_schedule
- customers
- bookings
- vendors
- products
- inventory
- orders
- order_items

### Phase 2: Database Functions
**Migration:** `create_role_management_functions`
- Created enum types (user_role_enum, staff_role_enum, booking_status_enum, order_status_enum)
- Created 7 role management functions

**Migration:** `create_business_logic_functions`
- Created 6 business logic functions

### Phase 3: RLS Policies
**Migration:** `enable_rls_and_create_policies`
- Enabled RLS on all 14 tables
- Created 42 role-based access policies

### Phase 4: Triggers and Constraints
**Migration:** `create_triggers_and_remaining_constraints`
- Created 21 triggers (13 timestamp + 8 business logic)
- Created 22 constraints (4 unique + 18 check)

### Phase 5: Seed Data
**File:** `seed_data.sql`
- Contains sample data for testing
- 1 salon, 3 categories, 10 services, 2 vendors, 8 products, 8 inventory records

## Applying Migrations

### Using Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste migration SQL
3. Run the query

### Using Supabase CLI
```bash
# Apply migration
supabase db push

# Apply specific migration
supabase migration up <migration_name>

# Check migration status
supabase migration list
```

### Using MCP Tools
```javascript
// Apply migration
mcp__supabase__apply_migration({
    name: "migration_name",
    query: "SQL_QUERY_HERE"
})
```

## Rollback Procedures

### Rollback Phase 4: Triggers and Constraints
```sql
-- Drop all triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_service_categories_updated_at ON service_categories;
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_staff_members_updated_at ON staff_members;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

DROP TRIGGER IF EXISTS update_customer_stats_on_booking_completion ON bookings;
DROP TRIGGER IF EXISTS prevent_booking_conflict_trigger ON bookings;
DROP TRIGGER IF EXISTS maintain_inventory_levels_trigger ON products;
DROP TRIGGER IF EXISTS update_order_total_trigger ON order_items;
DROP TRIGGER IF EXISTS validate_order_item_total_trigger ON order_items;
DROP TRIGGER IF EXISTS set_booking_total_price_trigger ON bookings;
DROP TRIGGER IF EXISTS prevent_active_staff_deletion_trigger ON staff_members;
DROP TRIGGER IF EXISTS prevent_service_with_bookings_deletion_trigger ON services;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_customer_visit_stats();
DROP FUNCTION IF EXISTS prevent_booking_conflict();
DROP FUNCTION IF EXISTS maintain_inventory_levels();
DROP FUNCTION IF EXISTS update_order_total();
DROP FUNCTION IF EXISTS validate_order_item_total();
DROP FUNCTION IF EXISTS set_booking_total_price();
DROP FUNCTION IF EXISTS prevent_active_staff_deletion();
DROP FUNCTION IF EXISTS prevent_service_with_bookings_deletion();

-- Drop constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_unique;
ALTER TABLE salons DROP CONSTRAINT IF EXISTS salons_email_unique;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_salon_name_unique;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_vendor_sku_unique;
ALTER TABLE staff_schedule DROP CONSTRAINT IF EXISTS staff_schedule_time_order_check;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_time_order_check;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_total_price_positive;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_duration_positive;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_price_positive;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_positive;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_cost_positive;
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_quantity_non_negative;
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_reorder_level_non_negative;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_amount_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_quantity_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_unit_price_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_total_price_positive;
ALTER TABLE staff_members DROP CONSTRAINT IF EXISTS staff_members_hourly_rate_positive;
ALTER TABLE staff_members DROP CONSTRAINT IF EXISTS staff_members_commission_rate_valid;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_total_spent_non_negative;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_visit_count_non_negative;
```

### Rollback Phase 3: RLS Policies
```sql
-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super Admin can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Super Admin can view all salons" ON salons;
DROP POLICY IF EXISTS "Users can view accessible salons" ON salons;
DROP POLICY IF EXISTS "Owners can manage own salons" ON salons;
DROP POLICY IF EXISTS "Managers can view and edit salon data" ON salons;
DROP POLICY IF EXISTS "Managers can update salon data" ON salons;

DROP POLICY IF EXISTS "Super Admin can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Owners can manage salon roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;

DROP POLICY IF EXISTS "Super Admin can view all categories" ON service_categories;
DROP POLICY IF EXISTS "Users can view salon categories" ON service_categories;
DROP POLICY IF EXISTS "Owners and Managers can manage categories" ON service_categories;

DROP POLICY IF EXISTS "Super Admin can view all services" ON services;
DROP POLICY IF EXISTS "Users can view salon services" ON services;
DROP POLICY IF EXISTS "Owners and Managers can manage services" ON services;

DROP POLICY IF EXISTS "Super Admin can view all staff" ON staff_members;
DROP POLICY IF EXISTS "Users can view salon staff" ON staff_members;
DROP POLICY IF EXISTS "Owners and Managers can manage staff" ON staff_members;
DROP POLICY IF EXISTS "Staff can view own profile" ON staff_members;

DROP POLICY IF EXISTS "Super Admin can view all schedules" ON staff_schedule;
DROP POLICY IF EXISTS "Users can view salon schedules" ON staff_schedule;
DROP POLICY IF EXISTS "Owners and Managers can manage schedules" ON staff_schedule;
DROP POLICY IF EXISTS "Staff can view own schedule" ON staff_schedule;

DROP POLICY IF EXISTS "Super Admin can view all customers" ON customers;
DROP POLICY IF EXISTS "Users can view salon customers" ON customers;
DROP POLICY IF EXISTS "Owners and Managers can manage customers" ON customers;
DROP POLICY IF EXISTS "Staff can view customer profiles" ON customers;

DROP POLICY IF EXISTS "Super Admin can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view salon bookings" ON bookings;
DROP POLICY IF EXISTS "Owners and Managers can manage bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can create bookings" ON bookings;

DROP POLICY IF EXISTS "Super Admin can view all vendors" ON vendors;
DROP POLICY IF EXISTS "Users can view salon vendors" ON vendors;
DROP POLICY IF EXISTS "Owners and Managers can manage vendors" ON vendors;
DROP POLICY IF EXISTS "Vendors can view own profile" ON vendors;

DROP POLICY IF EXISTS "Super Admin can view all products" ON products;
DROP POLICY IF EXISTS "Users can view salon products" ON products;
DROP POLICY IF EXISTS "Owners and Managers can manage products" ON products;
DROP POLICY IF EXISTS "Vendors can manage own products" ON products;

DROP POLICY IF EXISTS "Super Admin can view all inventory" ON inventory;
DROP POLICY IF EXISTS "Users can view salon inventory" ON inventory;
DROP POLICY IF EXISTS "Owners and Managers can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Vendors can manage salon inventory" ON inventory;

DROP POLICY IF EXISTS "Super Admin can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can view salon orders" ON orders;
DROP POLICY IF EXISTS "Owners and Managers can manage orders" ON orders;
DROP POLICY IF EXISTS "Vendors can view orders" ON orders;
DROP POLICY IF EXISTS "Vendors can update orders" ON orders;

DROP POLICY IF EXISTS "Super Admin can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can view salon order items" ON order_items;
DROP POLICY IF EXISTS "Owners and Managers can manage order items" ON order_items;
DROP POLICY IF EXISTS "Vendors can view order items" ON order_items;

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE salons DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

### Rollback Phase 2: Database Functions
```sql
-- Drop role management functions
DROP FUNCTION IF EXISTS current_user_role();
DROP FUNCTION IF EXISTS current_user_salon_id();
DROP FUNCTION IF EXISTS user_has_permission(permission_name text);
DROP FUNCTION IF EXISTS update_user_role(target_user_id uuid, new_role user_role_enum, target_salon_id uuid);
DROP FUNCTION IF EXISTS get_user_salons();
DROP FUNCTION IF EXISTS is_salon_manager(salon_uuid uuid);
DROP FUNCTION IF EXISTS create_owner_salon(salon_name text, owner_user_id uuid, salon_description text, salon_address text, salon_phone text, salon_email text);

-- Drop business logic functions
DROP FUNCTION IF EXISTS get_available_time_slots(target_salon_id uuid, target_service_id uuid, target_staff_id uuid, booking_date date);
DROP FUNCTION IF EXISTS update_customer_stats(target_customer_id uuid);
DROP FUNCTION IF EXISTS get_salon_stats(target_salon_id uuid, start_date date, end_date date);
DROP FUNCTION IF EXISTS check_booking_conflict(target_staff_id uuid, new_start_time timestamptz, new_end_time timestamptz, exclude_booking_id uuid);
DROP FUNCTION IF EXISTS get_staff_performance(target_staff_id uuid, start_date date, end_date date);
DROP FUNCTION IF EXISTS get_low_stock_products(target_salon_id uuid);

-- Drop enum types
DROP TYPE IF EXISTS user_role_enum;
DROP TYPE IF EXISTS staff_role_enum;
DROP TYPE IF EXISTS booking_status_enum;
DROP TYPE IF EXISTS order_status_enum;
```

## Data Migration Strategies

### Strategy 1: Incremental Migration
For large datasets, migrate data in batches:
```sql
-- Example: Migrate customer data in batches
DO $$
DECLARE
    batch_size INT := 1000;
    offset_val INT := 0;
    total_migrated INT := 0;
BEGIN
    LOOP
        -- Process batch
        INSERT INTO new_customers (id, name, email)
        SELECT id, name, email
        FROM old_customers
        ORDER BY id
        LIMIT batch_size
        OFFSET offset_val;

        GET DIAGNOSTICS total_migrated = ROW_COUNT;
        
        EXIT WHEN total_migrated = 0;
        
        offset_val := offset_val + batch_size;
        COMMIT;
    END LOOP;
END $$;
```

### Strategy 2: Zero-Downtime Migration
For production systems requiring zero downtime:
1. Create new tables alongside existing ones
2. Set up dual-write to both tables
3. Backfill existing data
4. Switch reads to new tables
5. Remove old tables

### Strategy 3: Feature Flag Migration
For gradual rollout:
1. Add feature flag to application
2. Deploy new schema with feature flag off
3. Enable feature flag for subset of users
4. Monitor for issues
5. Gradually increase rollout
6. Remove feature flag

## Testing Migrations

### Pre-Migration Checklist
- [ ] Backup database
- [ ] Test migration on staging environment
- [ ] Review migration SQL
- [ ] Plan rollback procedure
- [ ] Notify stakeholders
- [ ] Schedule maintenance window

### Post-Migration Verification
```sql
-- Verify table counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify constraints
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid::regclass::text LIKE 'public.%'
ORDER BY table_name, constraint_name;

-- Verify triggers
SELECT 
    trigger_name,
    event_manipulation as event,
    event_object_table as table_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY table_name, trigger_name;

-- Verify functions
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

## Troubleshooting

### Common Issues

#### Issue: Migration fails due to existing data
**Solution:** Use `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE`

#### Issue: RLS blocks access after migration
**Solution:** Ensure policies are created before enabling RLS

#### Issue: Foreign key constraint violations
**Solution:** Migrate data in correct order (parent tables first)

#### Issue: Performance degradation after migration
**Solution:** Create indexes on frequently queried columns

## Best Practices

1. **Always backup before migration**
2. **Test on staging first**
3. **Use transactions for atomic operations**
4. **Document all changes**
5. **Monitor after deployment**
6. **Have rollback plan ready**
7. **Use version control for migrations**
8. **Keep migrations reversible**

## Migration Checklist

- [ ] Review migration plan
- [ ] Create backup
- [ ] Test on staging
- [ ] Schedule deployment
- [ ] Notify team
- [ ] Apply migration
- [ ] Verify data integrity
- [ ] Test application
- [ ] Monitor performance
- [ ] Update documentation

---
**Last Updated**: 2026-05-10
**Version**: 1.0