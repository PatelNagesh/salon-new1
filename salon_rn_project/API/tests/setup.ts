/**
 * Test setup file
 * This file is run before all tests
 */

import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set timeout for async tests
jest.setTimeout(30000);

// Mock window object for browser environment
if (typeof window === 'undefined') {
  global.window = {
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
  } as any;
}

// Setup test database connection
beforeAll(async () => {
  // Initialize test database if needed
  console.log('Setting up test environment...');
});

// Cleanup after all tests
afterAll(async () => {
  // Cleanup test database if needed
  console.log('Cleaning up test environment...');
});

// Reset modules between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  generateId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  generateEmail: () => `test-${Date.now()}@example.com`,
  generatePhone: () => `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

console.log('Test setup complete');
