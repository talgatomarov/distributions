// Test setup file for Vitest
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Custom matchers for floating point comparisons
expect.extend({
  toBeCloseTo(received, expected, precision = 2) {
    const pass = Math.abs(expected - received) < Math.pow(10, -precision);
    if (pass) {
      return {
        message: () => `expected ${received} not to be close to ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be close to ${expected}`,
        pass: false,
      };
    }
  },
  toBeFinite(received) {
    const pass = isFinite(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be finite`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be finite`,
        pass: false,
      };
    }
  },
});