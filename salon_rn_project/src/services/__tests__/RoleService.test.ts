import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { RoleService, UserRole, ROLE_PERMISSIONS } from '../auth/RoleService';
import { supabase } from '../supabase';

// Mock Supabase client
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

describe('RoleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRole', () => {
    it('should return user role', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'salon_owner' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.getUserRole('user-1');

      expect(result).toBe('salon_owner');
    });

    it('should return null when user not found', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.getUserRole('user-1');

      expect(result).toBeNull();
    });
  });

  describe('getUserSalonId', () => {
    it('should return user salon ID', async () => {
      const mockProfile = {
        id: 'user-1',
        salon_id: 'salon-1',
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.getUserSalonId('user-1');

      expect(result).toBe('salon-1');
    });

    it('should return null when no salon ID', async () => {
      const mockProfile = {
        id: 'user-1',
        salon_id: null,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.getUserSalonId('user-1');

      expect(result).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should return true for valid permission', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'salon_owner' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.hasPermission('user-1', 'salon', 'read');

      expect(result).toBe(true);
    });

    it('should return false for invalid permission', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'customer' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.hasPermission('user-1', 'system', 'manage');

      expect(result).toBe(false);
    });

    it('should return false when user has no role', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.hasPermission('user-1', 'salon', 'read');

      expect(result).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for super_admin', () => {
      const permissions = RoleService.getRolePermissions('super_admin');

      expect(permissions).toBeDefined();
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions.some((p) => p.resource === 'system' && p.action === 'manage')).toBe(true);
    });

    it('should return permissions for salon_owner', () => {
      const permissions = RoleService.getRolePermissions('salon_owner');

      expect(permissions).toBeDefined();
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions.some((p) => p.resource === 'salon' && p.action === 'read')).toBe(true);
    });

    it('should return permissions for staff', () => {
      const permissions = RoleService.getRolePermissions('staff');

      expect(permissions).toBeDefined();
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions.some((p) => p.resource === 'bookings' && p.action === 'read')).toBe(true);
    });

    it('should return permissions for customer', () => {
      const permissions = RoleService.getRolePermissions('customer');

      expect(permissions).toBeDefined();
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions.some((p) => p.resource === 'bookings' && p.action === 'create')).toBe(true);
    });
  });

  describe('canAccessRoute', () => {
    it('should allow access to dashboard for salon_owner', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'salon_owner' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.canAccessRoute('user-1', '/dashboard');

      expect(result).toBe(true);
    });

    it('should deny access to system settings for customer', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'customer' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.canAccessRoute('user-1', '/settings');

      expect(result).toBe(false);
    });
  });

  describe('getAccessibleRoutes', () => {
    it('should return accessible routes for salon_owner', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'salon_owner' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.getAccessibleRoutes('user-1');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.includes('/dashboard')).toBe(true);
      expect(result.includes('/staff')).toBe(true);
      expect(result.includes('/services')).toBe(true);
    });

    it('should return limited routes for customer', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'customer' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.getAccessibleRoutes('user-1');

      expect(result).toBeDefined();
      expect(result.includes('/bookings')).toBe(true);
      expect(result.includes('/profile')).toBe(true);
      expect(result.includes('/staff')).toBe(false);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role for admin', async () => {
      const mockAdminProfile = {
        id: 'admin-1',
        role: 'super_admin' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockAdminProfile,
            error: null,
          }),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate });

      await RoleService.updateUserRole('user-1', 'staff', 'admin-1');

      expect(mockUpdate).toHaveBeenCalledWith({ role: 'staff' });
    });

    it('should throw error when user lacks permission', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'customer' as UserRole,
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await expect(
        RoleService.updateUserRole('user-2', 'staff', 'user-1')
      ).rejects.toThrow('Insufficient permissions to update user role');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: 'user-1',
        role: 'salon_owner' as UserRole,
        salon_id: 'salon-1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await RoleService.getUserProfile('user-1');

      expect(result).toEqual(mockProfile);
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should have permissions for all roles', () => {
      expect(ROLE_PERMISSIONS.super_admin).toBeDefined();
      expect(ROLE_PERMISSIONS.salon_owner).toBeDefined();
      expect(ROLE_PERMISSIONS.staff).toBeDefined();
      expect(ROLE_PERMISSIONS.customer).toBeDefined();
    });

    it('should have system permissions for super_admin', () => {
      const permissions = ROLE_PERMISSIONS.super_admin;

      expect(permissions.some((p) => p.resource === 'system')).toBe(true);
      expect(permissions.some((p) => p.action === 'manage')).toBe(true);
    });

    it('should have salon permissions for salon_owner', () => {
      const permissions = ROLE_PERMISSIONS.salon_owner;

      expect(permissions.some((p) => p.resource === 'salon')).toBe(true);
      expect(permissions.some((p) => p.resource === 'staff')).toBe(true);
      expect(permissions.some((p) => p.resource === 'services')).toBe(true);
    });

    it('should have booking permissions for staff', () => {
      const permissions = ROLE_PERMISSIONS.staff;

      expect(permissions.some((p) => p.resource === 'bookings')).toBe(true);
      expect(permissions.some((p) => p.resource === 'schedule')).toBe(true);
    });

    it('should have booking permissions for customer', () => {
      const permissions = ROLE_PERMISSIONS.customer;

      expect(permissions.some((p) => p.resource === 'bookings')).toBe(true);
      expect(permissions.some((p) => p.action === 'create')).toBe(true);
    });
  });
});
