/**
 * Test Utilities
 *
 * Common utilities and helpers for testing the salon management system.
 */

import { render } from '@testing-library/react-native';
import { AuthProvider } from '../../src/app/providers/AuthProvider';
import { ReactElement } from 'react';

/**
 * Custom render function that includes providers
 *
 * @param {ReactElement} ui - The component to render
 * @returns {RenderResult} The render result with providers
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(ui: ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

/**
 * Mock user data for testing
 */
export const mockUsers = {
  superAdmin: {
    id: 'user-super-admin',
    email: 'superadmin@example.com',
    role: 'SUPER_ADMIN',
    salonId: null,
  },
  owner: {
    id: 'user-owner',
    email: 'owner@example.com',
    role: 'OWNER',
    salonId: 'salon-123',
  },
  manager: {
    id: 'user-manager',
    email: 'manager@example.com',
    role: 'MANAGER',
    salonId: 'salon-123',
  },
  staff: {
    id: 'user-staff',
    email: 'staff@example.com',
    role: 'STAFF',
    salonId: 'salon-123',
  },
  vendor: {
    id: 'user-vendor',
    email: 'vendor@example.com',
    role: 'VENDOR',
    salonId: 'salon-123',
  },
  customer: {
    id: 'user-customer',
    email: 'customer@example.com',
    role: 'CUSTOMER',
    salonId: null,
  },
};

/**
 * Mock session data for testing
 */
export const mockSessions = {
  superAdmin: {
    user: {
      id: 'user-super-admin',
      email: 'superadmin@example.com',
      user_metadata: {
        role: 'SUPER_ADMIN',
      },
    },
    access_token: 'token-super-admin',
    refresh_token: 'refresh-super-admin',
  },
  owner: {
    user: {
      id: 'user-owner',
      email: 'owner@example.com',
      user_metadata: {
        role: 'OWNER',
        salon_id: 'salon-123',
      },
    },
    access_token: 'token-owner',
    refresh_token: 'refresh-owner',
  },
  customer: {
    user: {
      id: 'user-customer',
      email: 'customer@example.com',
      user_metadata: {
        role: 'CUSTOMER',
      },
    },
    access_token: 'token-customer',
    refresh_token: 'refresh-customer',
  },
};

/**
 * Mock salon data for testing
 */
export const mockSalons = {
  basic: {
    id: 'salon-123',
    name: 'Test Salon',
    description: 'A test salon for testing purposes',
    address: '123 Test Street',
    phone: '555-1234',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

/**
 * Mock service data for testing
 */
export const mockServices = {
  haircut: {
    id: 'service-1',
    salon_id: 'salon-123',
    name: 'Haircut',
    description: 'Professional haircut service',
    duration: 30,
    price: 25.0,
    category: 'Hair',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  manicure: {
    id: 'service-2',
    salon_id: 'salon-123',
    name: 'Manicure',
    description: 'Professional manicure service',
    duration: 45,
    price: 35.0,
    category: 'Nails',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

/**
 * Mock staff data for testing
 */
export const mockStaff = {
  basic: {
    id: 'staff-1',
    salon_id: 'salon-123',
    user_id: 'user-staff',
    role: 'STYLIST',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

/**
 * Wait for async operations to complete
 *
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a mock function that resolves with a value
 *
 * @param {T} value - The value to resolve with
 * @returns {jest.Mock} The mock function
 */
export const mockResolvedValue = <T,>(value: T): jest.Mock =>
  jest.fn().mockResolvedValue(value);

/**
 * Create a mock function that rejects with an error
 *
 * @param {Error} error - The error to reject with
 * @returns {jest.Mock} The mock function
 */
export const mockRejectedValue = (error: Error): jest.Mock =>
  jest.fn().mockRejectedValue(error);

/**
 * Suppress console errors during tests
 *
 * @returns {() => void} Function to restore console
 */
export const suppressConsoleError = (): (() => void) => {
  const originalError = console.error;
  console.error = jest.fn();
  return () => {
    console.error = originalError;
  };
};

/**
 * Suppress console warnings during tests
 *
 * @returns {() => void} Function to restore console
 */
export const suppressConsoleWarn = (): (() => void) => {
  const originalWarn = console.warn;
  console.warn = jest.fn();
  return () => {
    console.warn = originalWarn;
  };
};
