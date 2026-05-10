# Supabase Database Setup

This directory contains all the SQL migration files and documentation for setting up the Salon Management System database in Supabase.

## Directory Structure

```
supabase/
├── migrations/
│   ├── 001_profiles.sql              # User profiles table
│   ├── 002_user_roles.sql            # User roles and permissions
│   ├── 003_salons.sql                # Salon locations
│   ├── 004_services.sql              # Service offerings
│   ├── 005_service_categories.sql    # Service categorization
│   ├── 006_staff_members.sql         # Staff information
│   ├── 007_staff_schedule.sql        # Staff availability
│   ├── 008_customers.sql             # Customer records
│   ├── 009_bookings.sql              # Appointments and bookings
│   ├── 010_vendors.sql               # Vendor information
│   ├── 011_products.sql              # Product catalog
│   ├── 012_inventory.sql             # Stock management
│   ├── 013_orders.sql                # Supply orders
│   ├── 014_order_items.sql           # Order line items
│   ├── 015_rls_policies.sql          # Row Level Security policies
│   └── 016_functions.sql             # Database functions
└── README.md                         # This file
```

## Quick Start

### Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Project Reference**: Note your project reference (e.g., `fvukfkwsmeyojjppyjjv`)
3. **Database URL**: Get your database connection string
4. **API Keys**: Get your anon and service role keys

### Setup Instructions

#### Option 1: Using Supabase Dashboard (Recommended for Testing)

1. **Navigate to SQL Editor**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run Migrations in Order**
   - Open each migration file in numerical order
   - Copy the SQL content
   - Paste into SQL Editor
   - Click "Run" to execute

3. **Verify Setup**
   - Check "Table Editor" to see all tables created
   - Verify RLS policies are enabled
   - Test database functions

#### Option 2: Using MCP Server (Recommended for Production)

1. **Configure MCP Connection**
   - Ensure `.mcp.json` is configured with your project reference
   - Verify MCP server is connected

2. **Run Migrations**
   - Use MCP tools to execute each migration
   - Follow the numerical order (001-016)

3. **Verify Setup**
   - Use MCP tools to list tables
   - Check RLS policies
   - Test functions

#### Option 3: Using Supabase CLI (Recommended for Development)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Link to Project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run Migrations**
   ```bash
   # Run all migrations
   supabase db push

   # Or run specific migration
   supabase db execute --file migrations/001_profiles.sql
   ```

## Migration Order

**IMPORTANT**: Migrations must be run in numerical order due to dependencies:

1. **001_profiles.sql** - Foundation table (no dependencies)
2. **002_user_roles.sql** - Depends on profiles
3. **003_salons.sql** - Independent table
4. **004_services.sql** - Depends on salons
5. **005_service_categories.sql** - Depends on salons
6. **006_staff_members.sql** - Depends on profiles, salons
7. **007_staff_schedule.sql** - Depends on staff_members
8. **008_customers.sql** - Depends on profiles, salons
9. **009_bookings.sql** - Depends on salons, customers, services, staff_members
10. **010_vendors.sql** - Depends on profiles, salons
11. **011_products.sql** - Depends on vendors, salons
12. **012_inventory.sql** - Depends on products, salons
13. **013_orders.sql** - Depends on vendors, salons
14. **014_order_items.sql** - Depends on orders, products
15. **015_rls_policies.sql** - Depends on all tables
16. **016_functions.sql** - Depends on all tables

## Database Schema Overview

### Core Tables (14 tables)

| Table | Purpose | Rows |
|-------|---------|------|
| profiles | User profile information | 1:N with user_roles |
| user_roles | Role assignments | N:1 with profiles, salons |
| salons | Salon locations | 1:N with services, staff, customers |
| services | Service offerings | N:1 with salons, 1:N with bookings |
| service_categories | Service categorization | N:1 with salons |
| staff_members | Staff information | N:1 with profiles, salons |
| staff_schedule | Staff availability | N:1 with staff_members |
| customers | Customer records | N:1 with profiles, salons |
| bookings | Appointments | N:1 with salons, customers, services, staff |
| vendors | Vendor information | N:1 with profiles, salons |
| products | Product catalog | N:1 with vendors, salons |
| inventory | Stock management | N:1 with products, salons |
| orders | Supply orders | N:1 with vendors, salons |
| order_items | Order line items | N:1 with orders, products |

### Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Role-Based Access**: 6 user roles with specific permissions
- **Security Functions**: Helper functions for permission checking
- **Audit Logging**: Track all data modifications

### Database Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| update_user_role() | Update user role assignment | VOID |
| get_user_salons() | Get user's accessible salons | TABLE |
| has_permission() | Check user permissions | BOOLEAN |
| create_owner_salon() | Create salon for owner | UUID |
| get_available_time_slots() | Get booking availability | TABLE |
| update_customer_stats() | Update customer statistics | VOID |
| get_salon_stats() | Get salon analytics | TABLE |
| check_booking_conflict() | Check for booking conflicts | BOOLEAN |

## Testing the Setup

### 1. Verify Tables Created

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2. Verify RLS Enabled

```sql
-- Check RLS status
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 3. Test Functions

```sql
-- Test has_permission function
SELECT has_permission('booking.create');

-- Test get_salon_stats function
SELECT * FROM get_salon_stats('YOUR_SALON_UUID');
```

### 4. Insert Test Data

```sql
-- Insert test profile
INSERT INTO profiles (id, first_name, last_name, email)
VALUES (gen_random_uuid(), 'Test', 'User', 'test@example.com');

-- Insert test salon
INSERT INTO salons (name, description)
VALUES ('Test Salon', 'A test salon for development');

-- Verify data
SELECT * FROM profiles LIMIT 5;
SELECT * FROM salons LIMIT 5;
```

## Troubleshooting

### Common Issues

#### Issue: Migration fails with "relation does not exist"
**Solution**: Ensure migrations are run in numerical order. Check dependencies.

#### Issue: RLS policies not working
**Solution**: Verify RLS is enabled on the table. Check user authentication.

#### Issue: Function returns permission denied
**Solution**: Ensure user has proper role assignment. Check RLS policies.

#### Issue: Foreign key constraint violation
**Solution**: Verify referenced records exist before creating dependent records.

### Getting Help

1. **Check Logs**: Use Supabase dashboard logs for error details
2. **Verify Dependencies**: Ensure all prerequisite migrations are run
3. **Test Functions**: Run functions in SQL Editor to verify behavior
4. **Review Policies**: Check RLS policies for correct permissions

## Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Database Configuration
DATABASE_URL=postgresql://postgres:PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

## Security Best Practices

1. **Never expose service role key** in client-side code
2. **Use RLS policies** for all data access
3. **Validate inputs** before database operations
4. **Use parameterized queries** to prevent SQL injection
5. **Implement rate limiting** for API endpoints
6. **Regular security audits** of permissions and policies

## Performance Optimization

### Indexes

All tables include appropriate indexes for:
- Primary keys
- Foreign keys
- Frequently queried columns
- Search and filter operations

### Query Tips

1. Use indexed columns in WHERE clauses
2. Limit result sets with LIMIT
3. Use JOIN instead of subqueries when possible
4. Avoid SELECT * when not needed
5. Use EXPLAIN ANALYZE for slow queries

## Backup and Recovery

### Automated Backups

Supabase provides automated daily backups. Configure retention in dashboard.

### Manual Backup

```bash
# Using pg_dump
pg_dump -d DATABASE_URL > backup.sql

# Using Supabase CLI
supabase db dump -f backup.sql
```

### Restore

```bash
# Using psql
psql -d DATABASE_URL < backup.sql

# Using Supabase CLI
supabase db reset
```

## Documentation

- [Database Implementation Plan](../docs/database/DATABASE_IMPLEMENTATION_PLAN.md)
- [Database Schema Visualization](../docs/database/DATABASE_SCHEMA_VISUALIZATION.md)
- [Supabase Documentation](https://supabase.com/docs)

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review [Supabase documentation](https://supabase.com/docs)
3. Check project [GitHub issues](https://github.com/your-org/salon-rn-project/issues)

---

**Version**: 1.0
**Last Updated**: 2026-05-10
**Status**: Ready for Implementation
