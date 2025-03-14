// Jest setup file
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to keep test output clean
global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep error logs visible
};

// Add a dummy test to prevent Jest from complaining
describe('Setup', () => {
  test('Environment is set up correctly', () => {
    expect(true).toBe(true);
  });
});
