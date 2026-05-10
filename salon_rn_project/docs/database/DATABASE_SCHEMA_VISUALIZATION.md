# Salon Management System - Database Schema Visualization

## Overview

This document provides a comprehensive visualization of the Salon Management System database schema, including all tables, relationships, foreign keys, and data flow.

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SALON MANAGEMENT SYSTEM DATABASE                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   profiles   │─────────│  user_roles  │─────────│   salons     │
│              │ 1    N  │              │ N    1  │              │
│ - id (PK)    │         │ - id (PK)    │         │ - id (PK)    │
│ - first_name │         │ - user_id    │         │ - name       │
│ - last_name  │         │ - salon_id   │         │ - description│
│ - email      │         │ - role       │         │ - address    │
│ - phone      │         │ - created_at │         │ - phone      │
│ - avatar_url │         │ - updated_at │         │ - email      │
│ - created_at │         └──────────────┘         │ - opening_hrs│
│ - updated_at │                                 │ - is_active  │
└──────────────┘                                 │ - created_at │
                                                 │ - updated_at │
                                                 └──────────────┘
                                                        │
                    ┌───────────────────────────────────┼───────────────────────────┐
                    │                                   │                           │
        ┌───────────▼───────────┐           ┌───────────▼───────────┐   ┌───────────▼───────────┐
        │     services          │           │    staff_members      │   │     customers         │
        │                       │           │                       │   │                       │
        │ - id (PK)             │           │ - id (PK)             │   │ - id (PK)             │
        │ - salon_id (FK)       │           │ - user_id (FK)        │   │ - user_id (FK)        │
        │ - name                │           │ - salon_id (FK)       │   │ - salon_id (FK)       │
        │ - description         │           │ - role                │   │ - total_spent         │
        │ - duration            │           │ - hourly_rate         │   │ - visit_count         │
        │ - price               │           │ - commission_rate     │   │ - last_visit          │
        │ - category            │           │ - is_active           │   │ - notes               │
        │ - is_active           │           │ - hire_date           │   │ - birthday            │
        │ - image_url           │           │ - termination_date    │   │ - referral_source     │
        │ - created_at          │           │ - created_at          │   │ - created_at          │
        │ - updated_at          │           │ - updated_at          │   │ - updated_at          │
        └───────────────────────┘           └───────────────────────┘   └───────────────────────┘
                    │                                   │                           │
                    │                                   │                           │
        ┌───────────▼───────────┐           ┌───────────▼───────────┐   ┌───────────▼───────────┐
        │  service_categories   │           │    staff_schedule     │   │      bookings          │
        │                       │           │                       │   │                       │
        │ - id (PK)             │           │ - id (PK)             │   │ - id (PK)             │
        │ - salon_id (FK)       │           │ - staff_member_id(FK) │   │ - salon_id (FK)       │
        │ - name                │           │ - day_of_week         │   │ - customer_id (FK)    │
        │ - description         │           │ - start_time          │   │ - service_id (FK)     │
        │ - sort_order          │           │ - end_time            │   │ - staff_member_id(FK) │
        │ - created_at          │           │ - is_working          │   │ - start_time          │
        │ - updated_at          │           └───────────────────────┘   │ - end_time            │
        └───────────────────────┘                                       │ - status              │
                                                                      │ - notes               │
                                                                      │ - total_price         │
                                                                      │ - created_at          │
                                                                      │ - updated_at          │
                                                                      └───────────────────────┘
                                                                                    │
        ┌───────────────────────────────────────────────────────────────────────────┘
        │
        │
┌───────▼────────┐         ┌──────────────┐         ┌──────────────┐
│    vendors     │─────────│   products   │─────────│   inventory  │
│                │ 1    N  │              │ 1    N  │              │
│ - id (PK)      │         │ - id (PK)    │         │ - id (PK)    │
│ - user_id (FK) │         │ - vendor_id  │         │ - product_id │
│ - salon_id (FK)│         │ - salon_id   │         │ - salon_id   │
│ - company_name │         │ - name       │         │ - quantity   │
│ - contact_person│        │ - description│         │ - reorder_lvl│
│ - phone        │         │ - sku        │         │ - last_restock│
│ - email        │         │ - category   │         │ - created_at │
│ - address      │         │ - price      │         │ - updated_at │
│ - is_active    │         │ - cost       │         └──────────────┘
│ - created_at   │         │ - is_active  │
│ - updated_at   │         │ - created_at │
└────────────────┘         │ - updated_at │
                            └──────────────┘
                                    │
                            ┌───────▼────────┐         ┌──────────────┐
                            │     orders     │─────────│  order_items  │
                            │                │ 1    N  │              │
                            │ - id (PK)      │         │ - id (PK)    │
                            │ - vendor_id    │         │ - order_id   │
                            │ - salon_id     │         │ - product_id │
                            │ - order_date   │         │ - quantity   │
                            │ - expected_del │         │ - unit_price │
                            │ - status       │         │ - total_price│
                            │ - total_amount │         │ - created_at │
                            │ - notes        │         └──────────────┘
                            │ - created_at   │
                            │ - updated_at   │
                            └────────────────┘
```

## Table Relationships Summary

### Core Authentication Flow
```
auth.users (Supabase) → profiles → user_roles → salons
```

### Salon Management Flow
```
salons → services → bookings
salons → staff_members → staff_schedule
salons → customers → bookings
```

### Vendor Management Flow
```
salons → vendors → products → inventory
salons → vendors → orders → order_items → products
```

## Foreign Key Relationships

### Primary Relationships

| From Table | From Column | To Table | To Column | Relationship Type |
|------------|------------|----------|-----------|-------------------|
| user_roles | user_id | profiles | id | Many-to-One |
| user_roles | salon_id | salons | id | Many-to-One |
| services | salon_id | salons | id | Many-to-One |
| service_categories | salon_id | salons | id | Many-to-One |
| staff_members | user_id | profiles | id | Many-to-One |
| staff_members | salon_id | salons | id | Many-to-One |
| staff_schedule | staff_member_id | staff_members | id | Many-to-One |
| customers | user_id | profiles | id | Many-to-One |
| customers | salon_id | salons | id | Many-to-One |
| bookings | salon_id | salons | id | Many-to-One |
| bookings | customer_id | customers | id | Many-to-One |
| bookings | service_id | services | id | Many-to-One |
| bookings | staff_member_id | staff_members | id | Many-to-One |
| vendors | user_id | profiles | id | Many-to-One |
| vendors | salon_id | salons | id | Many-to-One |
| products | vendor_id | vendors | id | Many-to-One |
| products | salon_id | salons | id | Many-to-One |
| inventory | product_id | products | id | Many-to-One |
| inventory | salon_id | salons | id | Many-to-One |
| orders | vendor_id | vendors | id | Many-to-One |
| orders | salon_id | salons | id | Many-to-One |
| order_items | order_id | orders | id | Many-to-One |
| order_items | product_id | products | id | Many-to-One |

### Cascade Rules

| Relationship | On Delete | On Update |
|--------------|----------|-----------|
| user_roles → profiles | CASCADE | CASCADE |
| user_roles → salons | CASCADE | CASCADE |
| services → salons | CASCADE | CASCADE |
| staff_members → profiles | CASCADE | CASCADE |
| staff_members → salons | CASCADE | CASCADE |
| staff_schedule → staff_members | CASCADE | CASCADE |
| customers → profiles | CASCADE | CASCADE |
| customers → salons | CASCADE | CASCADE |
| bookings → salons | CASCADE | CASCADE |
| bookings → customers | CASCADE | CASCADE |
| bookings → services | CASCADE | CASCADE |
| bookings → staff_members | CASCADE | CASCADE |
| vendors → profiles | CASCADE | CASCADE |
| vendors → salons | CASCADE | CASCADE |
| products → vendors | CASCADE | CASCADE |
| products → salons | CASCADE | CASCADE |
| inventory → products | CASCADE | CASCADE |
| inventory → salons | CASCADE | CASCADE |
| orders → vendors | CASCADE | CASCADE |
| orders → salons | CASCADE | CASCADE |
| order_items → orders | CASCADE | CASCADE |
| order_items → products | CASCADE | CASCADE |

## Data Types Reference

### Common Data Types

| Type | Description | Example |
|------|-------------|---------|
| UUID | Universally Unique Identifier | `550e8400-e29b-41d4-a716-446655440000` |
| VARCHAR(n) | Variable-length character string | `VARCHAR(255)` |
| TEXT | Unlimited length text | `TEXT` |
| INTEGER | Whole number | `42` |
| NUMERIC(p,s) | Fixed precision number | `NUMERIC(10,2)` |
| BOOLEAN | True/False value | `true` |
| TIMESTAMPTZ | Timestamp with timezone | `2026-05-10 10:30:00+00` |
| DATE | Date without time | `2026-05-10` |
| TIME | Time without date | `10:30:00` |
| JSONB | Binary JSON data | `{"key": "value"}` |
| ENUM | Custom enumeration | `'SUPER_ADMIN'` |

### Custom Enum Types

#### user_role_enum
```sql
CREATE TYPE user_role_enum AS ENUM (
  'SUPER_ADMIN',
  'OWNER',
  'MANAGER',
  'STAFF',
  'VENDOR',
  'CUSTOMER'
);
```

#### staff_role_enum
```sql
CREATE TYPE staff_role_enum AS ENUM (
  'STAFF',
  'MANAGER',
  'LEAD_STYLIST'
);
```

#### booking_status_enum
```sql
CREATE TYPE booking_status_enum AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'no-show'
);
```

#### order_status_enum
```sql
CREATE TYPE order_status_enum AS ENUM (
  'pending',
  'ordered',
  'delivered',
  'cancelled'
);
```

## Indexes Summary

### Performance Indexes

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| profiles | idx_profiles_email | email | Fast email lookups |
| profiles | idx_profiles_name | last_name, first_name | Name searches |
| user_roles | idx_user_roles_user_id | user_id | User role lookups |
| user_roles | idx_user_roles_salon_id | salon_id | Salon staff lookups |
| user_roles | idx_user_roles_role | role | Role-based queries |
| salons | idx_salons_name | name | Salon name searches |
| salons | idx_salons_is_active | is_active | Active salon filtering |
| services | idx_services_salon_id | salon_id | Salon service lookups |
| services | idx_services_category | category | Category filtering |
| services | idx_services_is_active | is_active | Active service filtering |
| bookings | idx_bookings_salon_id | salon_id | Salon booking lookups |
| bookings | idx_bookings_customer_id | customer_id | Customer booking history |
| bookings | idx_bookings_staff_member_id | staff_member_id | Staff schedule lookups |
| bookings | idx_bookings_start_time | start_time | Time-based queries |
| bookings | idx_bookings_status | status | Status filtering |
| products | idx_products_sku | sku | Product SKU lookups |
| inventory | idx_inventory_quantity | quantity | Low stock alerts |

## Security Model

### Row Level Security (RLS) Policies

#### Super Admin Access
- Full access to all tables
- Can manage users and system settings
- Can view and modify any data

#### Owner Access
- Full access to own salon data
- Can manage staff and services
- Can view all bookings and customers
- Cannot access other owners' data

#### Manager Access
- View and edit salon data
- Can manage staff schedules
- Can view and edit bookings
- Cannot modify salon settings
- Cannot create/delete staff

#### Staff Access
- View own schedule and bookings
- Can create bookings for customers
- Can view customer profiles
- Cannot modify services or pricing
- Cannot access business analytics

#### Customer Access
- View services and pricing
- Can create own bookings
- Can view own booking history
- Can edit own profile
- Cannot access business data

#### Vendor Access
- View and manage inventory
- Can create and edit products
- Can view and process orders
- Cannot access customer data
- Cannot modify services

### Security Functions

| Function | Purpose | Security Level |
|----------|---------|----------------|
| current_user_role() | Get current user's role | SECURITY DEFINER |
| current_user_salon_id() | Get current user's salon ID | SECURITY DEFINER |
| is_super_admin() | Check if user is super admin | SECURITY DEFINER |
| is_salon_owner() | Check if user owns salon | SECURITY DEFINER |
| is_salon_manager() | Check if user manages salon | SECURITY DEFINER |
| has_permission() | Check specific permission | SECURITY DEFINER |

## Data Flow Examples

### Customer Booking Flow
```
1. Customer browses services (services table)
2. Customer selects service and time slot
3. System checks availability (bookings table)
4. System creates booking (bookings table)
5. System updates customer stats (customers table)
6. Staff receives notification (staff_members table)
```

### Staff Schedule Flow
```
1. Manager creates staff schedule (staff_schedule table)
2. Staff views personal schedule (staff_schedule table)
3. Customer books appointment (bookings table)
4. System checks for conflicts (check_booking_conflict function)
5. Booking is confirmed or rejected
```

### Inventory Management Flow
```
1. Vendor creates product (products table)
2. System creates inventory record (inventory table)
3. Salon places order (orders table)
4. Order items are added (order_items table)
5. Order is delivered (orders table)
6. Inventory is updated (inventory table)
```

## Migration Order

### Recommended Migration Sequence

1. **001_profiles.sql** - User profiles (foundation)
2. **002_user_roles.sql** - User roles (depends on profiles)
3. **003_salons.sql** - Salons (independent)
4. **004_services.sql** - Services (depends on salons)
5. **005_service_categories.sql** - Service categories (depends on salons)
6. **006_staff_members.sql** - Staff members (depends on profiles, salons)
7. **007_staff_schedule.sql** - Staff schedule (depends on staff_members)
8. **008_customers.sql** - Customers (depends on profiles, salons)
9. **009_bookings.sql** - Bookings (depends on salons, customers, services, staff_members)
10. **010_vendors.sql** - Vendors (depends on profiles, salons)
11. **011_products.sql** - Products (depends on vendors, salons)
12. **012_inventory.sql** - Inventory (depends on products, salons)
13. **013_orders.sql** - Orders (depends on vendors, salons)
14. **014_order_items.sql** - Order items (depends on orders, products)
15. **015_rls_policies.sql** - RLS policies (depends on all tables)
16. **016_functions.sql** - Database functions (depends on all tables)

## Validation Rules

### Data Integrity Constraints

| Table | Constraint | Rule |
|-------|------------|------|
| profiles | profiles_email_format | Email must match regex pattern |
| profiles | profiles_email_unique | Email must be unique |
| user_roles | user_roles_unique_user_salon | User can only have one role per salon |
| salons | salons_email_format | Email must match regex pattern (if provided) |
| salons | salons_phone_format | Phone must match regex pattern (if provided) |
| services | services_duration_positive | Duration must be > 0 |
| services | services_price_non_negative | Price must be >= 0 |
| staff_members | staff_members_unique_user_salon | User can only be staff once per salon |
| staff_members | staff_members_termination_date | Active staff cannot have termination date |
| staff_schedule | staff_schedule_time_order | Start time must be before end time |
| staff_schedule | staff_schedule_unique_day | One schedule per day per staff |
| bookings | bookings_time_order | Start time must be before end time |
| order_items | order_items_price_calculation | Total price must equal quantity × unit price |
| inventory | inventory_unique_product_salon | One inventory record per product per salon |

## Performance Considerations

### Query Optimization Tips

1. **Use indexed columns in WHERE clauses**
   ```sql
   -- Good
   SELECT * FROM bookings WHERE staff_member_id = 'uuid' AND start_time > NOW();

   -- Bad
   SELECT * FROM bookings WHERE notes LIKE '%something%';
   ```

2. **Use JOIN instead of subqueries when possible**
   ```sql
   -- Good
   SELECT b.*, s.name as service_name
   FROM bookings b
   JOIN services s ON b.service_id = s.id;

   -- Less optimal
   SELECT b.*, (SELECT name FROM services WHERE id = b.service_id) as service_name
   FROM bookings b;
   ```

3. **Limit result sets for large tables**
   ```sql
   -- Good
   SELECT * FROM bookings
   WHERE salon_id = 'uuid'
   ORDER BY start_time DESC
   LIMIT 50;

   -- Potentially slow
   SELECT * FROM bookings WHERE salon_id = 'uuid';
   ```

4. **Use appropriate data types**
   - Use UUID for primary keys
   - Use NUMERIC for financial data
   - Use JSONB for flexible data structures
   - Use TIMESTAMPTZ for timestamps

## Backup and Recovery

### Backup Strategy

1. **Daily automated backups**
   - Full database backup
   - Retain for 30 days

2. **Weekly full backups**
   - Complete database dump
   - Retain for 90 days

3. **Point-in-time recovery**
   - Enable WAL archiving
   - 7-day retention

### Recovery Procedures

1. **Restore from backup**
   ```bash
   pg_restore -d salon_db backup.dump
   ```

2. **Point-in-time recovery**
   ```bash
   pg_restore -d salon_db --recovery-target-time="2026-05-10 10:30:00" backup.dump
   ```

## Monitoring and Maintenance

### Health Checks

1. **Table size monitoring**
   ```sql
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

2. **Index usage monitoring**
   ```sql
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan as index_scans
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan;
   ```

3. **Slow query monitoring**
   ```sql
   SELECT
     query,
     calls,
     total_time,
     mean_time
   FROM pg_stat_statements
   WHERE mean_time > 100
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

---

**Document Version**: 1.0
**Last Updated**: 2026-05-10
**Status**: Ready for Review
