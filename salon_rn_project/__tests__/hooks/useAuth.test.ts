/**
 * Authentication Hooks Tests
 *
 * Tests for the authentication hooks including:
 * - useAuth hook
 * - useAuthState hook
 * - useIsAuthenticated hook
 * - useUserRole hook
 * - useUserSalon hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '../../src/app/providers/AuthProvider';
import { useAuth, useAuthState, useIsAuthenticated, useUserRole, useUserSalon } from '../../src/app/hooks/useAuth';
import { UserRole } from '../../src/types/auth.types';

// Mock Supabase client
jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

// Mock AuthService
jest.mock('../../src/services/auth.service', () => ({
  AuthService: {
    getSession: jest.fn(),
    getUserRole: jest.fn(),
    getSalonId: jest.fn(),
  },
}));

import { AuthService } from '../../src/services/auth.service';

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.error).toEqual(
        new Error('useAuth must be used within AuthProvider')
      );
    });

    it('should provide auth context when used within AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.hasPermission).toBe('function');
    });
  });

  describe('useAuthState', () => {
    it('should provide auth state', () => {
      const { result } = renderHook(() => useAuthState(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('role');
      expect(result.current).toHaveProperty('salonId');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('authenticated');
    });

    it('should have initial loading state', () => {
      const { result } = renderHook(() => useAuthState(), { wrapper });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('useIsAuthenticated', () => {
    it('should return false when not authenticated', () => {
      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });

      expect(result.current).toBe(false);
    });

    it('should return false when loading', async () => {
      (AuthService.getSession as jest.Mock).mockResolvedValue(null);

      const { result, waitForNextUpdate } = renderHook(
        () => useIsAuthenticated(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.current).toBe(false);
    });

    it('should return true when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => useIsAuthenticated(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.current).toBe(true);
    });
  });

  describe('useUserRole', () => {
    it('should return null when not authenticated', () => {
      const { result } = renderHook(() => useUserRole(), { wrapper });

      expect(result.current).toBeNull();
    });

    it('should return role when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('OWNER');

      const { result, waitForNextUpdate } = renderHook(
        () => useUserRole(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.current).toBe('OWNER');
    });
  });

  describe('useUserSalon', () => {
    it('should return null when not authenticated', () => {
      const { result } = renderHook(() => useUserSalon(), { wrapper });

      expect(result.current).toBeNull();
    });

    it('should return salonId when authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getSalonId as jest.Mock).mockReturnValue('salon-123');

      const { result, waitForNextUpdate } = renderHook(
        () => useUserSalon(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.current).toBe('salon-123');
    });
  });
});
