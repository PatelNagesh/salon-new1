-- ============================================
-- 015_rls_policies.sql
-- Row Level Security Policies
-- ============================================
-- Description: Comprehensive RLS policies for all tables
-- Security: Role-based access control for all user roles
-- ============================================

-- ============================================
-- Helper Functions for RLS
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role_enum AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's salon ID
CREATE OR REPLACE FUNCTION public.current_user_salon_id()
RETURNS UUID AS $$
  SELECT salon_id FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is owner of salon
CREATE OR REPLACE FUNCTION public.is_salon_owner(salon_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND salon_id = salon_uuid
      AND role = 'OWNER'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is manager of salon
CREATE OR REPLACE FUNCTION public.is_salon_manager(salon_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND salon_id = salon_uuid
      AND role IN ('OWNER', 'MANAGER')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is staff member
CREATE OR REPLACE FUNCTION public.is_staff_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('STAFF', 'MANAGER', 'LEAD_STYLIST')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- Enable RLS on All Tables
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Super admin can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

-- All users: Can view own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- All users: Can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Staff/Manager/Owner: Can view profiles of their salon
CREATE POLICY "Salon staff can view salon profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.salon_id IN (
          SELECT sm.salon_id FROM public.staff_members sm WHERE sm.user_id = public.profiles.id
          UNION
          SELECT c.salon_id FROM public.customers c WHERE c.user_id = public.profiles.id
          UNION
          SELECT v.salon_id FROM public.vendors v WHERE v.user_id = public.profiles.id
        )
    )
  );

-- ============================================
-- User Roles Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Can manage roles in own salon
CREATE POLICY "Owner can manage salon user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    public.is_salon_owner(salon_id)
    AND role NOT IN ('SUPER_ADMIN')
  );

-- Users: Can view own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- Salons Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all salons"
  ON public.salons FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salons
CREATE POLICY "Owner can manage own salons"
  ON public.salons FOR ALL
  TO authenticated
  USING (public.is_salon_owner(id));

-- Manager: Can view own salon
CREATE POLICY "Manager can view own salon"
  ON public.salons FOR SELECT
  TO authenticated
  USING (public.is_salon_manager(id));

-- Staff: Can view own salon
CREATE POLICY "Staff can view own salon"
  ON public.salons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.salon_id = public.salons.id
    )
  );

-- Customer: Can view active salons
CREATE POLICY "Customers can view active salons"
  ON public.salons FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Vendor: Can view own salon
CREATE POLICY "Vendor can view own salon"
  ON public.salons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.user_id = auth.uid() AND v.salon_id = public.salons.id
    )
  );

-- ============================================
-- Services Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon services
CREATE POLICY "Owner can manage own salon services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Manager: Can view and update own salon services
CREATE POLICY "Manager can view own salon services"
  ON public.services FOR SELECT
  TO authenticated
  USING (public.is_salon_manager(salon_id));

CREATE POLICY "Manager can update own salon services"
  ON public.services FOR UPDATE
  TO authenticated
  USING (public.is_salon_manager(salon_id));

-- Staff: Can view own salon services
CREATE POLICY "Staff can view own salon services"
  ON public.services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.salon_id = public.services.salon_id
    )
  );

-- Customer: Can view active services
CREATE POLICY "Customers can view active services"
  ON public.services FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================
-- Service Categories Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all service categories"
  ON public.service_categories FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon categories
CREATE POLICY "Owner can manage own salon categories"
  ON public.service_categories FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Manager: Can view own salon categories
CREATE POLICY "Manager can view own salon categories"
  ON public.service_categories FOR SELECT
  TO authenticated
  USING (public.is_salon_manager(salon_id));

-- Staff: Can view own salon categories
CREATE POLICY "Staff can view own salon categories"
  ON public.service_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.salon_id = public.service_categories.salon_id
    )
  );

-- ============================================
-- Staff Members Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all staff"
  ON public.staff_members FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon staff
CREATE POLICY "Owner can manage own salon staff"
  ON public.staff_members FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Manager: Can view and update own salon staff
CREATE POLICY "Manager can view own salon staff"
  ON public.staff_members FOR SELECT
  TO authenticated
  USING (public.is_salon_manager(salon_id));

CREATE POLICY "Manager can update own salon staff"
  ON public.staff_members FOR UPDATE
  TO authenticated
  USING (public.is_salon_manager(salon_id));

-- Staff: Can view own profile
CREATE POLICY "Staff can view own profile"
  ON public.staff_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Staff: Can update own profile
CREATE POLICY "Staff can update own profile"
  ON public.staff_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- Staff Schedule Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all schedules"
  ON public.staff_schedule FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon schedules
CREATE POLICY "Owner can manage own salon schedules"
  ON public.staff_schedule FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = public.staff_schedule.staff_member_id
        AND public.is_salon_owner(sm.salon_id)
    )
  );

-- Manager: Full access to own salon schedules
CREATE POLICY "Manager can manage own salon schedules"
  ON public.staff_schedule FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = public.staff_schedule.staff_member_id
        AND public.is_salon_manager(sm.salon_id)
    )
  );

-- Staff: Can view own schedule
CREATE POLICY "Staff can view own schedule"
  ON public.staff_schedule FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = public.staff_schedule.staff_member_id AND sm.user_id = auth.uid()
    )
  );

-- ============================================
-- Customers Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon customers
CREATE POLICY "Owner can manage own salon customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Manager: Can view and update own salon customers
CREATE POLICY "Manager can view own salon customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (public.is_salon_manager(salon_id));

CREATE POLICY "Manager can update own salon customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (public.is_salon_manager(salon_id));

-- Staff: Can view own salon customers
CREATE POLICY "Staff can view own salon customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.salon_id = public.customers.salon_id
    )
  );

-- Customer: Can view own profile
CREATE POLICY "Customer can view own profile"
  ON public.customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Customer: Can update own profile
CREATE POLICY "Customer can update own profile"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- Bookings Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon bookings
CREATE POLICY "Owner can manage own salon bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Manager: Full access to own salon bookings
CREATE POLICY "Manager can manage own salon bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_salon_manager(salon_id));

-- Staff: Can view own bookings and create new ones
CREATE POLICY "Staff can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    staff_member_id IN (
      SELECT id FROM public.staff_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.salon_id = public.bookings.salon_id
    )
  );

-- Customer: Can view own bookings
CREATE POLICY "Customer can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

-- Customer: Can create own bookings
CREATE POLICY "Customer can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

-- Customer: Can cancel own bookings
CREATE POLICY "Customer can cancel own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
    AND status = 'scheduled'
  );

-- ============================================
-- Vendors Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all vendors"
  ON public.vendors FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon vendors
CREATE POLICY "Owner can manage own salon vendors"
  ON public.vendors FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Vendor: Can view own profile
CREATE POLICY "Vendor can view own profile"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Vendor: Can update own profile
CREATE POLICY "Vendor can update own profile"
  ON public.vendors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- Products Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon products
CREATE POLICY "Owner can manage own salon products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Vendor: Can view and manage own products
CREATE POLICY "Vendor can view own products"
  ON public.products FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendor can create own products"
  ON public.products FOR INSERT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendor can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

-- ============================================
-- Inventory Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all inventory"
  ON public.inventory FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon inventory
CREATE POLICY "Owner can manage own salon inventory"
  ON public.inventory FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Manager: Can view own salon inventory
CREATE POLICY "Manager can view own salon inventory"
  ON public.inventory FOR SELECT
  TO authenticated
  USING (public.is_salon_manager(salon_id));

-- Vendor: Can view inventory for own products
CREATE POLICY "Vendor can view own product inventory"
  ON public.inventory FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM public.products WHERE vendor_id IN (
        SELECT id FROM public.vendors WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- Orders Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon orders
CREATE POLICY "Owner can manage own salon orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_salon_owner(salon_id));

-- Manager: Can view and update own salon orders
CREATE POLICY "Manager can view own salon orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_salon_manager(salon_id));

CREATE POLICY "Manager can update own salon orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_salon_manager(salon_id));

-- Vendor: Can view own orders
CREATE POLICY "Vendor can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

-- Vendor: Can update own orders
CREATE POLICY "Vendor can update own orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

-- ============================================
-- Order Items Table RLS Policies
-- ============================================

-- Super Admin: Full access
CREATE POLICY "Super admin can manage all order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Owner: Full access to own salon order items
CREATE POLICY "Owner can manage own salon order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = public.order_items.order_id
        AND public.is_salon_owner(o.salon_id)
    )
  );

-- Manager: Can view own salon order items
CREATE POLICY "Manager can view own salon order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = public.order_items.order_id
        AND public.is_salon_manager(o.salon_id)
    )
  );

-- Vendor: Can view own order items
CREATE POLICY "Vendor can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = public.order_items.order_id
        AND o.vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
    )
  );
