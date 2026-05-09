/**
 * AuthService Unit Tests
 *
 * Tests for the authentication service including:
 * - Sign in functionality
 * - Sign up functionality
 * - Sign out functionality
 * - Session management
 * - JWT claim parsing
 * - Role extraction
 * - Permission checking
 */

import { AuthService } from '../../src/services/auth.service';
import { supabase } from '../../src/services/supabase';
import { UserRole } from '../../src/types/auth.types';

// Mock Supabase client
jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    rpc: jest.fn(),
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ session: mockSession });
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw an error when sign in fails', async () => {
      const mockError = { message: 'Invalid credentials' };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      await expect(
        AuthService.signIn({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toEqual(mockError);
    });
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'new@example.com',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.signUp({
        email: 'new@example.com',
        password: 'password123',
        role: 'CUSTOMER' as UserRole,
      });

      expect(result).toEqual({ user: mockUser });
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            user_role: 'CUSTOMER',
          },
        },
      });
    });

    it('should include salon name when signing up as owner', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'owner@example.com',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: 'salon-123',
        error: null,
      });

      await AuthService.signUp({
        email: 'owner@example.com',
        password: 'password123',
        role: 'OWNER' as UserRole,
        salonName: 'Test Salon',
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'owner@example.com',
        password: 'password123',
        options: {
          data: {
            user_role: 'OWNER',
          },
        },
      });
    });

    it('should throw an error when sign up fails', async () => {
      const mockError = { message: 'Email already exists' };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      await expect(
        AuthService.signUp({
          email: 'existing@example.com',
          password: 'password123',
          role: 'CUSTOMER' as UserRole,
        })
      ).rejects.toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      await AuthService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw an error when sign out fails', async () => {
      const mockError = { message: 'Sign out failed' };

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      await expect(AuthService.signOut()).rejects.toEqual(mockError);
    });
  });

  describe('getSession', () => {
    it('should successfully get current session', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result).toEqual(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should return null when no session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      await AuthService.resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    it('should throw an error when password reset fails', async () => {
      const mockError = { message: 'Email not found' };

      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      await expect(
        AuthService.resetPassword('nonexistent@example.com')
      ).rejects.toEqual(mockError);
    });
  });

  describe('getUserRole', () => {
    it('should extract role from session JWT token', () => {
      // Mock atob to return the expected payload
      const originalAtob = global.atob;
      global.atob = jest.fn((str) => {
        // Return the expected payload for the second part of the JWT
        return JSON.stringify({
          app_metadata: {
            user_role: 'OWNER',
          },
          exp: Math.floor(Date.now() / 1000) + 3600,
        });
      });

      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        access_token: 'header.payload.signature',
        refresh_token: 'refresh-123',
      };

      const role = AuthService.getUserRole(mockSession);

      expect(role).toBe('OWNER');

      // Restore original atob
      global.atob = originalAtob;
    });

    it('should return null when role is not in metadata', () => {
      const originalAtob = global.atob;
      global.atob = jest.fn(() => {
        return JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + 3600,
        });
      });

      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        access_token: 'header.payload.signature',
        refresh_token: 'refresh-123',
      };

      const role = AuthService.getUserRole(mockSession);

      expect(role).toBeNull();

      // Restore original atob
      global.atob = originalAtob;
    });

    it('should return null when session is null', () => {
      const role = AuthService.getUserRole(null);

      expect(role).toBeNull();
    });
  });

  describe('getSalonId', () => {
    it('should extract salon_id from session JWT token', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        app_metadata: {
          salon_id: 'salon-123',
        },
        exp: Math.floor(Date.now() / 1000) + 3600,
      }));
      const signature = 'mock-signature';
      const mockToken = `${header}.${payload}.${signature}`;

      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        access_token: mockToken,
        refresh_token: 'refresh-123',
      };

      const salonId = AuthService.getSalonId(mockSession);

      expect(salonId).toBe('salon-123');
    });

    it('should return null when salon_id is not in metadata', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600,
      }));
      const signature = 'mock-signature';
      const mockToken = `${header}.${payload}.${signature}`;

      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        access_token: mockToken,
        refresh_token: 'refresh-123',
      };

      const salonId = AuthService.getSalonId(mockSession);

      expect(salonId).toBeNull();
    });

    it('should return null when session is null', () => {
      const salonId = AuthService.getSalonId(null);

      expect(salonId).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should return true for super admin with any permission', async () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        app_metadata: {
          user_role: 'SUPER_ADMIN',
        },
        exp: Math.floor(Date.now() / 1000) + 3600,
      }));
      const signature = 'mock-signature';
      const mockToken = `${header}.${payload}.${signature}`;

      const mockSession = {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
        },
        access_token: mockToken,
        refresh_token: 'refresh-123',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null,
      });

      const hasPermission = await AuthService.hasPermission('any.permission');

      expect(hasPermission).toBe(true);
    });

    it('should return true for owner with owner permissions', async () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        app_metadata: {
          user_role: 'OWNER',
        },
        exp: Math.floor(Date.now() / 1000) + 3600,
      }));
      const signature = 'mock-signature';
      const mockToken = `${header}.${payload}.${signature}`;

      const mockSession = {
        user: {
          id: 'user-123',
          email: 'owner@example.com',
        },
        access_token: mockToken,
        refresh_token: 'refresh-123',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null,
      });

      const hasPermission = await AuthService.hasPermission('staff.create');

      expect(hasPermission).toBe(true);
    });

    it('should return false for owner with system config permission', async () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        app_metadata: {
          user_role: 'OWNER',
        },
        exp: Math.floor(Date.now() / 1000) + 3600,
      }));
      const signature = 'mock-signature';
      const mockToken = `${header}.${payload}.${signature}`;

      const mockSession = {
        user: {
          id: 'user-123',
          email: 'owner@example.com',
        },
        access_token: mockToken,
        refresh_token: 'refresh-123',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: false,
        error: null,
      });

      const hasPermission = await AuthService.hasPermission('system.config');

      expect(hasPermission).toBe(false);
    });

    it('should return false when session is null', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const hasPermission = await AuthService.hasPermission('any.permission');

      expect(hasPermission).toBe(false);
    });
  });
});
