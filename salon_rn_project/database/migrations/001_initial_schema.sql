-- Initial Schema for Salon Management System
-- This migration creates the core tables for the multi-tenant, multi-role salon system

-- Custom types for roles and permissions
CREATE TYPE public.user_role AS ENUM (
    'SUPER_ADMIN',
    'OWNER',
    'MANAGER',
    'STAFF',
    'VENDOR',
    'CUSTOMER'
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Salons table for multi-tenant support
CREATE TABLE public.salons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    address TEXT,
    phone TEXT,
    email TEXT,
    settings JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table for role assignment
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    role public.user_role NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, salon_id)
);

-- Role permissions mapping
CREATE TABLE public.role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role public.user_role NOT NULL,
    permission TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role, permission)
);

-- Services offered by salons
CREATE TABLE public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER, -- in minutes
    price DECIMAL(10,2),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Staff members linked to salons
CREATE TABLE public.staff_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    specialties TEXT[],
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, salon_id)
);

-- Appointments/Bookings
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled, no-show
    notes TEXT,
    total_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor management
CREATE TABLE public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory for vendors
CREATE TABLE public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    reorder_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default permissions for each role
INSERT INTO public.role_permissions (role, permission, description) VALUES
    -- Super Admin permissions
    ('SUPER_ADMIN', 'system.config', 'Configure system settings'),
    ('SUPER_ADMIN', 'system.view_all', 'View all data across system'),
    ('SUPER_ADMIN', 'salon.create', 'Create new salons'),
    ('SUPER_ADMIN', 'salon.manage_all', 'Manage all salons'),
    ('SUPER_ADMIN', 'user.manage_all', 'Manage all users'),
    ('SUPER_ADMIN', 'reports.view_all', 'View all system reports'),

    -- Owner permissions
    ('OWNER', 'salon.manage', 'Manage own salon'),
    ('OWNER', 'staff.manage', 'Manage staff in salon'),
    ('OWNER', 'services.manage', 'Manage services'),
    ('OWNER', 'inventory.view', 'View inventory'),
    ('OWNER', 'reports.view', 'View salon reports'),
    ('OWNER', 'bookings.view_all', 'View all bookings'),

    -- Manager permissions
    ('MANAGER', 'staff.view', 'View staff information'),
    ('MANAGER', 'booking.manage', 'Manage bookings'),
    ('MANAGER', 'reports.view', 'View salon reports'),
    ('MANAGER', 'schedule.manage', 'Manage staff schedules'),

    -- Staff permissions
    ('STAFF', 'booking.create', 'Create bookings'),
    ('STAFF', 'booking.view_own', 'View own bookings'),
    ('STAFF', 'profile.edit', 'Edit own profile'),
    ('STAFF', 'customer.view', 'View customer information'),

    -- Vendor permissions
    ('VENDOR', 'inventory.manage', 'Manage inventory'),
    ('VENDOR', 'profile.edit', 'Edit company profile'),
    ('VENDOR', 'product.create', 'Create products'),
    ('VENDOR', 'order.manage', 'Manage orders'),

    -- Customer permissions
    ('CUSTOMER', 'booking.create', 'Create bookings'),
    ('CUSTOMER', 'booking.view_own', 'View own bookings'),
    ('CUSTOMER', 'profile.edit', 'Edit own profile'),
    ('CUSTOMER', 'service.view', 'View services');

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_salons_owner ON public.salons(owner_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_salon ON public.user_roles(salon_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_services_salon ON public.services(salon_id);
CREATE INDEX idx_staff_user ON public.staff_members(user_id);
CREATE INDEX idx_staff_salon ON public.staff_members(salon_id);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_staff ON public.bookings(staff_id);
CREATE INDEX idx_bookings_salon ON public.bookings(salon_id);
CREATE INDEX idx_bookings_time ON public.bookings(start_time);
CREATE INDEX idx_inventory_vendor ON public.inventory(vendor_id);
CREATE INDEX idx_inventory_salon ON public.inventory(salon_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_salons_updated_at BEFORE UPDATE ON public.salons
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_roles_updated_at BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_staff_members_updated_at BEFORE UPDATE ON public.staff_members
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_vendors_updated_at BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_inventory_updated_at BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();