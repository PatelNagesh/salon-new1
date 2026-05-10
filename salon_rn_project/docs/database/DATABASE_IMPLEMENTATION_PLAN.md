# Supabase Database Implementation Plan

## Executive Summary

This plan outlines the comprehensive implementation of the Supabase database for the Salon Management System. The database is currently empty and requires complete schema setup including tables, relationships, RLS policies, and database functions.

## Current Status Assessment

### ✅ Completed
- Frontend codebase with all service layers
- Authentication service with JWT handling
- Role-based permission system
- All UI screens for 6 user roles

### ❌ Missing
- Database tables (0 tables currently)
- RLS policies
- Database functions
- Migration scripts
- Foreign key relationships

## Database Requirements Analysis

### Core Entities Identified

1. **Authentication & User Management**
   - `profiles` - User profile data
   - `user_roles` - Role assignments per user/salon

2. **Salon Management**
   - `salons` - Salon locations and settings
   - `services` - Service offerings
   - `service_categories` - Service categorization

3. **Staff Management**
   - `staff_members` - Staff information
   - `staff_schedule` - Staff availability

4. **Customer Management**
   - `customers` - Customer records

5. **Booking Management**
   - `bookings` - Appointments and bookings

6. **Vendor Management**
   - `vendors` - Vendor information
   - `products` - Product catalog
   - `inventory` - Stock management
   - `orders` - Supply orders

## Implementation Plan

### Phase 1: Core Schema Setup

#### Task 1.1: Create Authentication Tables
- **profiles** table
  - id (UUID, primary key, references auth.users)
  - first_name (text)
  - last_name (text)
  - email (text)
  - phone (text)
  - avatar_url (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- **user_roles** table
  - id (UUID, primary key)
  - user_id (UUID, foreign key → profiles.id)
  - salon_id (UUID, foreign key → salons.id, nullable)
  - role (enum: SUPER_ADMIN, OWNER, MANAGER, STAFF, VENDOR, CUSTOMER)
  - created_at (timestamptz)
  - updated_at (timestamptz)

#### Task 1.2: Create Salon Management Tables
- **salons** table
  - id (UUID, primary key)
  - name (text)
  - description (text)
  - address (text)
  - phone (text)
  - email (text)
  - opening_hours (jsonb)
  - is_active (boolean)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- **services** table
  - id (UUID, primary key)
  - salon_id (UUID, foreign key → salons.id)
  - name (text)
  - description (text)
  - duration (integer) - minutes
  - price (numeric)
  - category (text)
  - is_active (boolean)
  - image_url (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- **service_categories** table
  - id (UUID, primary key)
  - salon_id (UUID, foreign key → salons.id)
  - name (text)
  - description (text)
  - sort_order (integer)
  - created_at (timestamptz)
  - updated_at (timestamptz)

#### Task 1.3: Create Staff Management Tables
- **staff_members** table
  - id (UUID, primary key)
  - user_id (UUID, foreign key → profiles.id)
  - salon_id (UUID, foreign key → salons.id)
  - role (enum: STAFF, MANAGER, LEAD_STYLIST)
  - hourly_rate (numeric)
  - commission_rate (numeric)
  - is_active (boolean)
  - hire_date (timestamptz)
  - termination_date (timestamptz, nullable)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- **staff_schedule** table
  - id (UUID, primary key)
  - staff_member_id (UUID, foreign key → staff_members.id)
  - day_of_week (integer) - 0-6 (Sunday-Saturday)
  - start_time (time)
  - end_time (time)
  - is_working (boolean)

#### Task 1.4: Create Customer Management Tables
- **customers** table
  - id (UUID, primary key)
  - user_id (UUID, foreign key → profiles.id)
  - salon_id (UUID, foreign key → salons.id)
  - total_spent (numeric)
  - visit_count (integer)
  - last_visit (timestamptz, nullable)
  - notes (text)
  - birthday (date, nullable)
  - referral_source (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

#### Task 1.5: Create Booking Management Tables
- **bookings** table
  - id (UUID, primary key)
  - salon_id (UUID, foreign key → salons.id)
  - customer_id (UUID, foreign key → customers.id)
  - service_id (UUID, foreign key → services.id)
  - staff_member_id (UUID, foreign key → staff_members.id)
  - start_time (timestamptz)
  - end_time (timestamptz)
  - status (enum: scheduled, completed, cancelled, no-show)
  - notes (text)
  - total_price (numeric)
  - created_at (timestamptz)
  - updated_at (timestamptz)

#### Task 1.6: Create Vendor Management Tables
- **vendors** table
  - id (UUID, primary key)
  - user_id (UUID, foreign key → profiles.id)
  - salon_id (UUID, foreign key → salons.id)
  - company_name (text)
  - contact_person (text)
  - phone (text)
  - email (text)
  - address (text)
  - is_active (boolean)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- **products** table
  - id (UUID, primary key)
  - vendor_id (UUID, foreign key → vendors.id)
  - salon_id (UUID, foreign key → salons.id)
  - name (text)
  - description (text)
  - sku (text)
  - category (text)
  - price (numeric)
  - cost (numeric)
  - is_active (boolean)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- **inventory** table
  - id (UUID, primary key)
  - product_id (UUID, foreign key → products.id)
  - salon_id (UUID, foreign key → salons.id)
  - quantity (integer)
  - reorder_level (integer)
  - last_restocked (timestamptz)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- **orders** table
  - id (UUID, primary key)
  - vendor_id (UUID, foreign key → vendors.id)
  - salon_id (UUID, foreign key → salons.id)
  - order_date (timestamptz)
  - expected_delivery (timestamptz)
  - status (enum: pending, ordered, delivered, cancelled)
  - total_amount (numeric)
  - notes (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

- **order_items** table
  - id (UUID, primary key)
  - order_id (UUID, foreign key → orders.id)
  - product_id (UUID, foreign key → products.id)
  - quantity (integer)
  - unit_price (numeric)
  - total_price (numeric)
  - created_at (timestamptz)

### Phase 2: Database Functions

#### Task 2.1: Create Role Management Functions
- `update_user_role(user_id, new_role, salon_id)` - Update user role
- `get_user_salons()` - Get all salons for current user
- `has_permission(permission_name)` - Check user permissions
- `is_salon_manager(salon_uuid)` - Check if user is salon manager
- `create_owner_salon(salon_name, owner_user_id)` - Create salon for owner

#### Task 2.2: Create Business Logic Functions
- `get_available_time_slots(salon_id, service_id, staff_id, date)` - Get available slots
- `update_customer_stats(customer_id)` - Update customer visit stats
- `get_salon_stats(salon_id)` - Get salon analytics
- `check_booking_conflict(staff_id, start_time, end_time)` - Check for conflicts

### Phase 3: Row Level Security (RLS) Policies

#### Task 3.1: Enable RLS on All Tables
- Enable RLS on all tables
- Create default deny policies

#### Task 3.2: Create Role-Based Policies

**Super Admin Policies:**
- Full access to all tables
- Can manage users and system settings

**Owner Policies:**
- Full access to own salon data
- Can manage staff and services
- Can view all bookings and customers

**Manager Policies:**
- View and edit salon data
- Can manage staff schedules
- Can view and edit bookings
- Cannot modify salon settings

**Staff Policies:**
- View own schedule and bookings
- Can create bookings for customers
- Can view customer profiles
- Cannot modify services or pricing

**Customer Policies:**
- View services and pricing
- Can create own bookings
- Can view own booking history
- Can edit own profile

**Vendor Policies:**
- View and manage inventory
- Can create and edit products
- Can view and process orders
- Cannot access customer data

#### Task 3.3: Create Security Functions
- `current_user_role()` - Get current user's role
- `current_user_salon_id()` - Get current user's salon ID
- `user_has_permission(permission)` - Check specific permission

### Phase 4: Triggers and Constraints

#### Task 4.1: Create Timestamp Triggers
- `update_updated_at_column()` - Auto-update updated_at
- Apply to all tables with updated_at column

#### Task 4.2: Create Data Integrity Constraints
- Unique constraints on emails
- Check constraints on status enums
- Foreign key cascading rules
- Not null constraints on required fields

#### Task 4.3: Create Business Logic Triggers
- `update_customer_visit_stats()` - Update customer stats on booking completion
- `update_staff_performance()` - Update staff metrics
- `maintain_inventory_levels()` - Check stock levels

### Phase 5: Migration Strategy

#### Task 5.1: Create Migration Files
- `001_initial_schema.sql` - Core tables
- `002_rls_policies.sql` - Security policies
- `003_functions.sql` - Database functions
- `004_triggers.sql` - Triggers and constraints
- `005_seed_data.sql` - Initial seed data

#### Task 5.2: Create Rollback Scripts
- Rollback scripts for each migration
- Data preservation strategies

#### Task 5.3: Create Migration Documentation
- Migration guide
- Rollback procedures
- Data migration strategies

## Foreign Key Relationships

### Primary Relationships
```
profiles (1) ←→ (N) user_roles
user_roles (N) ←→ (1) salons
salons (1) ←→ (N) services
salons (1) ←→ (N) staff_members
salons (1) ←→ (N) customers
salons (1) ←→ (N) bookings
salons (1) ←→ (N) vendors
services (1) ←→ (N) bookings
staff_members (1) ←→ (N) bookings
staff_members (1) ←→ (N) staff_schedule
customers (1) ←→ (N) bookings
vendors (1) ←→ (N) products
vendors (1) ←→ (N) orders
products (1) ←→ (N) inventory
products (1) ←→ (N) order_items
orders (1) ←→ (N) order_items
```

### Cascade Rules
- **ON DELETE RESTRICT**: Prevent deletion of referenced records
- **ON UPDATE CASCADE**: Update foreign keys on UUID changes
- **ON DELETE SET NULL**: Optional for nullable relationships

## Security Considerations

### RLS Best Practices
1. Enable RLS on all tables in public schema
2. Create explicit policies for each role
3. Use security definer functions for sensitive operations
4. Implement audit logging for critical operations
5. Use JWT claims for role-based access

### Data Protection
1. Encrypt sensitive data at rest
2. Use secure token storage
3. Implement rate limiting
4. Log all authentication attempts
5. Regular security audits

## Performance Optimization

### Indexing Strategy
1. Primary key indexes on all tables
2. Foreign key indexes on all relationships
3. Composite indexes on frequently queried columns
4. Partial indexes on filtered queries
5. GIN indexes on JSONB columns

### Query Optimization
1. Use prepared statements
2. Implement connection pooling
3. Cache frequently accessed data
4. Optimize complex queries
5. Monitor query performance

## Testing Strategy

### Unit Tests
- Test all database functions
- Verify RLS policy enforcement
- Test constraint validation
- Validate trigger execution

### Integration Tests
- Test complete business flows
- Verify data integrity
- Test error handling
- Validate performance

### Security Tests
- Test permission boundaries
- Verify SQL injection protection
- Test authentication flows
- Validate data access controls

## Implementation Sequesnce

### Phase-sb 1: Core Schema
- Taks-sb 1: Create authentication tables
- Taks-sb 2: Create salon management tables
- Taks-sb 3: Create staff and customer tables

### Phase-sb 2: Business Logic
- Taks-sb 4: Create booking tables
- Taks-sb 5: Create vendor management tables
- Taks-sb 6: Create database functions

### Phase-sb 3: Security & Performance
- Taks-sb 7: Implement RLS policies
- Taks-sb 8: Create triggers and constraints
- Taks-sb 9: Performance optimization

### Phase-sb 4: Testing & Deployment
- Taks-sb 10: Write and run tests
- Taks-sb 11: Create migration scripts
- Taks-sb 12: Deploy and validate

## Success Criteria

### Functional Requirements
- ✅ All tables created with proper relationships
- ✅ RLS policies enforce role-based access
- ✅ Database functions work correctly
- ✅ Triggers maintain data integrity
- ✅ Migration scripts are idempotent

### Non-Functional Requirements
- ✅ Query performance meets targets (< 100ms for common queries)
- ✅ Security policies are comprehensive
- ✅ Data integrity is maintained
- ✅ System is scalable
- ✅ Documentation is complete

## Risk Mitigation

### Technical Risks
1. **Data Loss Risk**: Implement backup strategy before migrations
2. **Performance Issues**: Test with realistic data volumes
3. **Security Vulnerabilities**: Regular security audits
4. **Migration Failures**: Comprehensive rollback procedures

### Operational Risks
1. **Downtime**: Plan maintenance windows
2. **User Impact**: Communicate changes clearly
3. **Training**: Provide documentation and training
4. **Support**: Establish support procedures

## Next Steps

1. **Review and Approve Plan**: Get stakeholder approval
2. **Set Up Development Environment**: Configure local database
3. **Start Implementation**: Begin with Phase 1
4. **Continuous Testing**: Test each phase thoroughly
5. **Deploy Gradually**: Roll out changes incrementally

---

**Document Version**: 1.0
**Last Updated**: 2026-05-10
**Status**: Ready for Implementation
