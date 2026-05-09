/**
 * Authentication Hooks
 *
 * Provides authentication state and methods for the entire application.
 */
export {
  useAuth,
  useAuthState,
  useIsAuthenticated,
  useUserRole,
  useUserSalon,
} from './useAuth';

/**
 * Permission Hooks
 *
 * Provides permission checking functionality for role-based access control.
 */
export {
  usePermission,
  useRequirePermission,
  useRequireRole,
  useRequireAnyRole,
} from './usePermission';

/**
 * Salon Hooks
 *
 * Provides salon-related functionality including fetching salon data,
 * managing salon information, and handling salon-specific operations.
 */
export {
  useSalon,
  useSalonStaff,
} from './useSalon';

/**
 * Types
 *
 * Re-export types for convenience.
 */
export type {
  Permission,
} from './usePermission';

export type {
  Salon,
  BusinessHours,
  DayHours,
  SalonStaff,
  SalonService,
} from './useSalon';
