import { useState, useEffect } from 'react';
import { RoleService, UserRole } from '../services/auth/RoleService';
import { useAuth } from './useAuth';

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userRole = await RoleService.getUserRole(user.id);
        setRole(userRole);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  return { role, loading, error };
}

export function usePermission(resource: string, action: string, resourceId?: string) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkPermission() {
      if (!user) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const permission = await RoleService.hasPermission(
          user.id,
          resource,
          action,
          resourceId
        );
        setHasPermission(permission);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermission();
  }, [user, resource, action, resourceId]);

  return { hasPermission, loading, error };
}

export function useCanAccessRoute(route: string) {
  const { user } = useAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        setCanAccess(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const access = await RoleService.canAccessRoute(user.id, route);
        setCanAccess(access);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setCanAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [user, route]);

  return { canAccess, loading, error };
}

export function useAccessibleRoutes() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRoutes() {
      if (!user) {
        setRoutes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const accessibleRoutes = await RoleService.getAccessibleRoutes(user.id);
        setRoutes(accessibleRoutes);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, [user]);

  return { routes, loading, error };
}

export function useIsSuperAdmin() {
  const { role } = useRole();
  return role === 'super_admin';
}

export function useIsSalonOwner() {
  const { role } = useRole();
  return role === 'salon_owner';
}

export function useIsStaff() {
  const { role } = useRole();
  return role === 'staff';
}

export function useIsCustomer() {
  const { role } = useRole();
  return role === 'customer';
}

export function useHasAnyPermission(permissions: Array<{ resource: string; action: string }>) {
  const { user } = useAuth();
  const [hasAnyPermission, setHasAnyPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkPermissions() {
      if (!user) {
        setHasAnyPermission(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await Promise.all(
          permissions.map((p) =>
            RoleService.hasPermission(user.id, p.resource, p.action)
          )
        );
        setHasAnyPermission(results.some((r) => r));
        setError(null);
      } catch (err) {
        setError(err as Error);
        setHasAnyPermission(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermissions();
  }, [user, permissions]);

  return { hasAnyPermission, loading, error };
}

export function useHasAllPermissions(permissions: Array<{ resource: string; action: string }>) {
  const { user } = useAuth();
  const [hasAllPermissions, setHasAllPermissions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkPermissions() {
      if (!user) {
        setHasAllPermissions(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await Promise.all(
          permissions.map((p) =>
            RoleService.hasPermission(user.id, p.resource, p.action)
          )
        );
        setHasAllPermissions(results.every((r) => r));
        setError(null);
      } catch (err) {
        setError(err as Error);
        setHasAllPermissions(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermissions();
  }, [user, permissions]);

  return { hasAllPermissions, loading, error };
}
