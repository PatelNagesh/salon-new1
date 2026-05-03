-- Row Level Security (RLS) Policies
-- This migration enables RLS and creates policies for all tables

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        public.get_current_user_role() = 'SUPER_ADMIN' OR
        public.is_salon_manager()
    );

CREATE POLICY "Staff can view customer profiles" ON public.profiles
    FOR SELECT USING (
        public.get_current_user_role() = 'STAFF' AND
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.customer_id = profiles.id
            AND b.staff_id IN (
                SELECT id FROM public.staff_members
                WHERE user_id = auth.uid()
            )
        )
    );

-- Salons table policies
CREATE POLICY "Users can view own salon" ON public.salons
    FOR SELECT USING (
        owner_id = auth.uid() OR
        id = public.get_current_salon_id()
    );

CREATE POLICY "Super Admin can view all salons" ON public.salons
    FOR ALL USING (public.get_current_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Owners can update own salon" ON public.salons
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Managers can update salon settings" ON public.salons
    FOR UPDATE USING (
        public.is_salon_manager(id) AND
        public.get_current_user_role() = 'MANAGER'
    );

-- User roles table policies
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (
        public.get_current_user_role() IN ('SUPER_ADMIN', 'OWNER', 'MANAGER')
    );

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (
        public.get_current_user_role() IN ('SUPER_ADMIN', 'OWNER', 'MANAGER')
    );

-- Role permissions are read-only for everyone
CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
    FOR SELECT USING (true);

-- Services table policies
CREATE POLICY "Staff and customers can view services" ON public.services
    FOR SELECT USING (
        salon_id = public.get_current_salon_id()
    );

CREATE POLICY "Owners and managers can manage services" ON public.services
    FOR ALL USING (
        public.has_permission('services.manage') AND
        salon_id = public.get_current_salon_id()
    );

-- Staff members table policies
CREATE POLICY "Staff can view own profile" ON public.staff_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Salon staff can view each other" ON public.staff_members
    FOR SELECT USING (
        salon_id = public.get_current_salon_id()
    );

CREATE POLICY "Owners and managers can manage staff" ON public.staff_members
    FOR ALL USING (
        public.has_permission('staff.manage') AND
        salon_id = public.get_current_salon_id()
    );

CREATE POLICY "Staff can update own profile" ON public.staff_members
    FOR UPDATE USING (
        user_id = auth.uid() AND
        public.has_permission('profile.edit')
    );

-- Bookings table policies
CREATE POLICY "Customers can view own bookings" ON public.bookings
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Staff can view assigned bookings" ON public.bookings
    FOR SELECT USING (
        staff_id IN (
            SELECT id FROM public.staff_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Owners and managers can view all bookings" ON public.bookings
    FOR SELECT USING (
        public.has_permission('bookings.view_all') AND
        salon_id = public.get_current_salon_id()
    );

CREATE POLICY "Staff can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (
        public.has_permission('booking.create') AND
        salon_id = public.get_current_salon_id()
    );

CREATE POLICY "Customers can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (
        customer_id = auth.uid() AND
        salon_id = public.get_current_salon_id()
    );

CREATE POLICY "Staff and owners can update bookings" ON public.bookings
    FOR UPDATE USING (
        (staff_id IN (
            SELECT id FROM public.staff_members
            WHERE user_id = auth.uid()
        ) OR
        public.has_permission('booking.manage')
    ) AND
        salon_id = public.get_current_salon_id()
    );

CREATE POLICY "Owners can delete bookings" ON public.bookings
    FOR DELETE USING (
        public.has_permission('booking.manage') AND
        salon_id = public.get_current_salon_id()
    );

-- Vendors table policies
CREATE POLICY "Vendors can view own profile" ON public.vendors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Vendors can update own profile" ON public.vendors
    FOR UPDATE USING (
        user_id = auth.uid() AND
        public.has_permission('profile.edit')
    );

CREATE POLICY "Everyone can view active vendors" ON public.vendors
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage vendors" ON public.vendors
    FOR ALL USING (public.get_current_user_role() IN ('SUPER_ADMIN', 'OWNER'));

-- Inventory table policies
CREATE POLICY "Vendors can manage own inventory" ON public.inventory
    FOR ALL USING (
        vendor_id IN (
            SELECT id FROM public.vendors
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Salons can view their inventory" ON public.inventory
    FOR SELECT USING (
        salon_id = public.get_current_salon_id()
    );

CREATE POLICY "Admins can view all inventory" ON public.inventory
    FOR SELECT USING (
        public.has_permission('inventory.view')
    );

-- Create additional helper functions for complex checks

-- Function to check if user can access specific booking
CREATE OR REPLACE FUNCTION public.can_access_booking(booking_uuid UUID)
RETURNS boolean AS $$
DECLARE
    booking_customer_id UUID;
    booking_staff_id UUID;
    booking_salon_id UUID;
    user_role public.user_role;
BEGIN
    -- Get booking details
    SELECT customer_id, staff_id, salon_id
    INTO booking_customer_id, booking_staff_id, booking_salon_id
    FROM public.bookings
    WHERE id = booking_uuid;

    user_role := public.get_current_user_role();

    -- Super Admin can access all
    IF user_role = 'SUPER_ADMIN' THEN
        RETURN true;
    END IF;

    -- Customer can access own bookings
    IF user_role = 'CUSTOMER' AND booking_customer_id = auth.uid() THEN
        RETURN true;
    END IF;

    -- Staff can access assigned bookings
    IF user_role = 'STAFF' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.staff_members
            WHERE id = booking_staff_id
            AND user_id = auth.uid()
        );
    END IF;

    -- Owner/Manager can access all salon bookings
    IF user_role IN ('OWNER', 'MANAGER') THEN
        RETURN booking_salon_id = public.get_current_salon_id();
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a view for simplified role-based data access
CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    COALESCE(ur.role, 'CUSTOMER') as role,
    COALESCE(s.name, 'No Salon Assigned') as salon_name,
    ur.salon_id,
    p.created_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.salons s ON ur.salon_id = s.id
WHERE p.id = auth.uid();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Revoke unnecessary permissions from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;