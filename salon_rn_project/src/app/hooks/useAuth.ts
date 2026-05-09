import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { AuthState } from '../types/auth.types';

/**
 * useAuth Hook
 *
 * Provides authentication state and methods for the entire application.
 * This hook must be used within an AuthProvider.
 *
 * @returns {AuthState & AuthMethods} Authentication state and methods
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * const { user, role, loading, login, logout } = useAuth();
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * useAuthState Hook
 *
 * Provides only the authentication state without methods.
 * Useful for components that only need to read auth state.
 *
 * @returns {AuthState} Authentication state
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * const { user, role, loading, authenticated } = useAuthState();
 * ```
 */
export const useAuthState = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthState must be used within AuthProvider');
  }
  return {
    user: context.user,
    role: context.role,
    salonId: context.salonId,
    loading: context.loading,
    authenticated: context.authenticated,
  };
};

/**
 * useIsAuthenticated Hook
 *
 * Provides a simple boolean indicating if the user is authenticated.
 *
 * @returns {boolean} True if user is authenticated, false otherwise
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * const isAuthenticated = useIsAuthenticated();
 * if (isAuthenticated) {
 *   // Show authenticated content
 * }
 * ```
 */
export const useIsAuthenticated = (): boolean => {
  const { authenticated, loading } = useAuthState();
  return authenticated && !loading;
};

/**
 * useUserRole Hook
 *
 * Provides the current user's role.
 *
 * @returns {UserRole | null} The user's role or null if not authenticated
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * const role = useUserRole();
 * if (role === 'OWNER') {
 *   // Show owner-specific content
 * }
 * ```
 */
export const useUserRole = () => {
  const { role } = useAuthState();
  return role;
};

/**
 * useUserSalon Hook
 *
 * Provides the current user's salon ID.
 *
 * @returns {string | null} The user's salon ID or null if not set
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * const salonId = useUserSalon();
 * if (salonId) {
 *   // Fetch salon-specific data
 * }
 * ```
 */
export const useUserSalon = () => {
  const { salonId } = useAuthState();
  return salonId;
};
