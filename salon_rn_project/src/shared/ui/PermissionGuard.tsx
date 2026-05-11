import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { usePermission } from '../hooks/usePermissions';

interface PermissionGuardProps {
  resource: string;
  action: string;
  resourceId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  resource,
  action,
  resourceId,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermission(resource, action, resourceId);

  if (loading) {
    return null;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  allowedRoles: Array<'super_admin' | 'salon_owner' | 'staff' | 'customer'>;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, fallback = null, children }: RoleGuardProps) {
  const { role, loading } = useRole();

  if (loading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ProtectedButtonProps {
  resource: string;
  action: string;
  resourceId?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export function ProtectedButton({
  resource,
  action,
  resourceId,
  disabled = false,
  children,
  onPress,
  style,
}: ProtectedButtonProps) {
  const { hasPermission, loading } = usePermission(resource, action, resourceId);

  if (loading) {
    return null;
  }

  if (!hasPermission) {
    return null;
  }

  return (
    <View style={[styles.button, style]} onTouchEnd={onPress}>
      {children}
    </View>
  );
}

interface PermissionDeniedProps {
  message?: string;
}

export function PermissionDenied({ message = 'You do not have permission to access this resource.' }: PermissionDeniedProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

interface RoleBadgeProps {
  role: 'super_admin' | 'salon_owner' | 'staff' | 'customer';
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleColors: Record<string, string> = {
    super_admin: '#EF4444',
    salon_owner: '#F59E0B',
    staff: '#10B981',
    customer: '#3B82F6',
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    salon_owner: 'Owner',
    staff: 'Staff',
    customer: 'Customer',
  };

  return (
    <View style={[styles.badge, { backgroundColor: roleColors[role] }]}>
      <Text style={styles.badgeText}>{roleLabels[role]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    // Button styles would be defined here
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
