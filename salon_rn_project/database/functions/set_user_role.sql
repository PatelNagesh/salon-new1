-- JWT Custom Claims Implementation
-- These functions and triggers manage role-based access through JWT tokens

-- Function to handle user registration and role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile for the new user
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);

    -- Assign default role as CUSTOMER
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'CUSTOMER');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically handle new users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user role and salon in app_metadata
CREATE OR REPLACE FUNCTION public.update_user_role(
    user_id UUID,
    new_role public.user_role,
    salon_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Update or insert user role
    INSERT INTO public.user_roles (user_id, role, salon_id, updated_at)
    VALUES (user_id, new_role, salon_id, now())
    ON CONFLICT (user_id, salon_id)
    DO UPDATE SET
        role = new_role,
        updated_at = now();

    -- Update app_metadata in auth.users for JWT claims
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'),
        '{user_role}',
        to_jsonb(new_role)
    )
    WHERE id = user_id;

    IF salon_id IS NOT NULL THEN
        UPDATE auth.users
        SET raw_app_meta_data = jsonb_set(
            raw_app_meta_data,
            '{salon_id}',
            to_jsonb(salon_id)
        )
        WHERE id = user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current role from JWT
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
BEGIN
    -- Extract role from JWT claims
    RETURN COALESCE(
        (auth.jwt() ->> 'app_metadata'::text) ->> 'user_role'::text,
        (auth.jwt() ->> 'user_role'::text),
        'CUSTOMER'
    )::public.user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current salon ID from JWT
CREATE OR REPLACE FUNCTION public.get_current_salon_id()
RETURNS UUID AS $$
BEGIN
    -- Extract salon_id from JWT claims
    RETURN (
        auth.jwt() ->> 'app_metadata'::text
    ) ->> 'salon_id'::text::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS boolean AS $$
DECLARE
    user_role public.user_role;
BEGIN
    -- Get current user role
    user_role := public.get_current_user_role();

    -- Check if role has the permission
    RETURN EXISTS (
        SELECT 1
        FROM public.role_permissions
        WHERE role_permissions.role = user_role
        AND role_permissions.permission = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if user is salon owner or manager
CREATE OR REPLACE FUNCTION public.is_salon_manager(salon_uuid UUID DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
    user_role public.user_role;
    user_salon_id UUID;
BEGIN
    user_role := public.get_current_user_role();
    user_salon_id := COALESCE(salon_uuid, public.get_current_salon_id());

    -- Super Admin can manage any salon
    IF user_role = 'SUPER_ADMIN' THEN
        RETURN true;
    END IF;

    -- Owner and Manager can manage their own salon
    IF user_role IN ('OWNER', 'MANAGER') THEN
        RETURN EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.salon_id = user_salon_id
            AND user_roles.role = user_role
        );
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function for salon owners to create their salon on first login
CREATE OR REPLACE FUNCTION public.create_owner_salon(
    salon_name TEXT,
    owner_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
    new_salon_id UUID;
BEGIN
    -- Create new salon
    INSERT INTO public.salons (name, owner_id)
    VALUES (salon_name, owner_user_id)
    RETURNING id INTO new_salon_id;

    -- Update user role to OWNER for this salon
    PERFORM public.update_user_role(owner_user_id, 'OWNER', new_salon_id);

    RETURN new_salon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get all salons for current user based on role
CREATE OR REPLACE FUNCTION public.get_user_salons()
RETURNS TABLE (
    id UUID,
    name TEXT,
    role public.user_role,
    is_owner boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        ur.role,
        (s.owner_id = auth.uid()) as is_owner
    FROM public.salons s
    JOIN public.user_roles ur ON s.id = ur.salon_id
    WHERE ur.user_id = auth.uid()
    AND ur.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;