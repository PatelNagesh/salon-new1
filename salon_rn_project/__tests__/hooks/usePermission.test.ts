/**
 * Permission Hooks Tests
 *
 * Tests for the permission hooks including:
 * - usePermission hook
 * - useRequirePermission hook
 * - useRequireRole hook
 * - useRequireAnyRole hook
 */

import { renderHook } from '@testing-library/react-native';
import { AuthProvider } from '../../src/app/providers/AuthProvider';
import {
  usePermission,
  useRequirePermission,
  useRequireRole,
  useRequireAnyRole,
} from '../../src/app/hooks/usePermission';
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

describe('usePermission Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('usePermission', () => {
    it('should provide permission checking methods', () => {
      const { result } = renderHook(() => usePermission(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.hasPermission).toBe('function');
      expect(typeof result.current.canView).toBe('function');
      expect(typeof result.current.canCreate).toBe('function');
      expect(typeof result.current.canEdit).toBe('function');
      expect(typeof result.current.canDelete).toBe('function');
      expect(typeof result.current.canManage).toBe('function');
      expect(typeof result.current.getPermissions).toBe('function');
      expect(typeof result.current.hasAnyPermission).toBe('function');
      expect(typeof result.current.hasAllPermissions).toBe('function');
    });

    it('should return false for all permissions when not authenticated', () => {
      const { result } = renderHook(() => usePermission(), { wrapper });

      expect(result.current.hasPermission('any.permission')).toBe(false);
      expect(result.current.canView('any')).toBe(false);
      expect(result.current.canCreate('any')).toBe(false);
      expect(result.current.canEdit('any')).toBe(false);
      expect(result.current.canDelete('any')).toBe(false);
      expect(result.current.canManage('any')).toBe(false);
    });

    it('should return true for super admin with any permission', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'admin@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('SUPER_ADMIN');

      const { result, waitForNextUpdate } = renderHook(
        () => usePermission(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.current.hasPermission('any.permission')).toBe(true);
      expect(result.current.canView('any')).toBe(true);
      expect(result.current.canCreate('any')).toBe(true);
      expect(result.current.canEdit('any')).toBe(true);
      expect(result.current.canDelete('any')).toBe(true);
      expect(result.current.canManage('any')).toBe(true);
    });

    it('should check owner permissions correctly', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'owner@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('OWNER');

      const { result, waitForNextUpdate } = renderHook(
        () => usePermission(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.current.hasPermission('staff.create')).toBe(true);
      expect(result.current.hasPermission('system.config')).toBe(false);
      expect(result.current.canView('staff')).toBe(true);
      expect(result.current.canCreate('staff')).toBe(true);
      expect(result.current.canEdit('staff')).toBe(true);
      expect(result.current.canDelete('staff')).toBe(true);
    });

    it('should check customer permissions correctly', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'customer@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => usePermission(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.current.hasPermission('booking.create')).toBe(true);
      expect(result.current.hasPermission('staff.create')).toBe(false);
      expect(result.current.canView('booking')).toBe(true);
      expect(result.current.canCreate('booking')).toBe(true);
      expect(result.current.canEdit('staff')).toBe(false);
    });

    it('should check hasAnyPermission correctly', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'customer@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => usePermission(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(
        result.current.hasAnyPermission(['booking.create', 'staff.create'])
      ).toBe(true);
      expect(
        result.current.hasAnyPermission(['staff.create', 'system.config'])
      ).toBe(false);
    });

    it('should check hasAllPermissions correctly', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'customer@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => usePermission(),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(
        result.current.hasAllPermissions(['booking.create', 'booking.view'])
      ).toBe(true);
      expect(
        result.current.hasAllPermissions(['booking.create', 'staff.create'])
      ).toBe(false);
    });

    it('should return permissions array', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'customer@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => usePermission(),
        { wrapper }
      );

      await waitForNextUpdate();

      const permissions = result.current.getPermissions();
      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain('booking.create');
    });
  });

  describe('useRequirePermission', () => {
    it('should throw error when permission is not granted', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'customer@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => useRequirePermission('staff.create'),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.error).toEqual(
        new Error('Permission denied: staff.create required')
      );
    });

    it('should not throw error when permission is granted', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'customer@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => useRequirePermission('booking.create'),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.error).toBeUndefined();
    });
  });

  describe('useRequireRole', () => {
    it('should throw error when role does not match', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'customer@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => useRequireRole('OWNER'),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.error).toEqual(new Error('Role required: OWNER'));
    });

    it('should not throw error when role matches', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'owner@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('OWNER');

      const { result, waitForNextUpdate } = renderHook(
        () => useRequireRole('OWNER'),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.error).toBeUndefined();
    });
  });

  describe('useRequireAnyRole', () => {
    it('should throw error when no role matches', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'customer@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('CUSTOMER');

      const { result, waitForNextUpdate } = renderHook(
        () => useRequireAnyRole(['OWNER', 'MANAGER']),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.error).toEqual(
        new Error('One of these roles required: OWNER, MANAGER')
      );
    });

    it('should not throw error when role matches', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'manager@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (AuthService.getUserRole as jest.Mock).mockReturnValue('MANAGER');

      const { result, waitForNextUpdate } = renderHook(
        () => useRequireAnyRole(['OWNER', 'MANAGER']),
        { wrapper }
      );

      await waitForNextUpdate();

      expect(result.error).toBeUndefined();
    });
  });
});
