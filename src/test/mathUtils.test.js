import { describe, it, expect } from 'vitest';
import { gamma, beta, safeLog, safePow } from '../lib/mathUtils.js';

describe('Mathematical Utility Functions', () => {
  describe('gamma function', () => {
    it('should compute gamma function for positive integers', () => {
      // Gamma(n) = (n-1)! for positive integers
      expect(gamma(1)).toBeCloseTo(1, 6); // 0!
      expect(gamma(2)).toBeCloseTo(1, 6); // 1!
      expect(gamma(3)).toBeCloseTo(2, 6); // 2!
      expect(gamma(4)).toBeCloseTo(6, 6); // 3!
      expect(gamma(5)).toBeCloseTo(24, 6); // 4!
    });

    it('should compute gamma function for half-integers', () => {
      // Gamma(1/2) = sqrt(π)
      expect(gamma(0.5)).toBeCloseTo(Math.sqrt(Math.PI), 6);
      // Gamma(3/2) = sqrt(π)/2
      expect(gamma(1.5)).toBeCloseTo(Math.sqrt(Math.PI) / 2, 6);
      // Gamma(5/2) = 3*sqrt(π)/4
      expect(gamma(2.5)).toBeCloseTo(3 * Math.sqrt(Math.PI) / 4, 6);
    });

    it('should handle small positive values', () => {
      expect(gamma(0.1)).toBeCloseTo(9.513507699, 6);
      expect(gamma(0.9)).toBeCloseTo(1.068628702, 6);
    });

    it('should use reflection formula for negative values', () => {
      // Test a few negative values using the reflection formula
      expect(gamma(-0.5)).toBeCloseTo(-2 * Math.sqrt(Math.PI), 5);
      expect(gamma(-1.5)).toBeCloseTo(4 * Math.sqrt(Math.PI) / 3, 5);
    });
  });

  describe('beta function', () => {
    it('should compute beta function for integer values', () => {
      // Beta(1,1) = 1
      expect(beta(1, 1)).toBeCloseTo(1, 6);
      // Beta(2,1) = 1/2
      expect(beta(2, 1)).toBeCloseTo(0.5, 6);
      // Beta(1,2) = 1/2
      expect(beta(1, 2)).toBeCloseTo(0.5, 6);
      // Beta(2,2) = 1/6
      expect(beta(2, 2)).toBeCloseTo(1/6, 6);
    });

    it('should be symmetric', () => {
      // Beta(a,b) = Beta(b,a)
      expect(beta(3, 4)).toBeCloseTo(beta(4, 3), 6);
      expect(beta(2.5, 1.5)).toBeCloseTo(beta(1.5, 2.5), 6);
    });

    it('should compute beta function for non-integer values', () => {
      // Beta(0.5, 0.5) = π
      expect(beta(0.5, 0.5)).toBeCloseTo(Math.PI, 6);
      // Beta(1.5, 2.5) = Γ(1.5)*Γ(2.5)/Γ(4) ≈ 0.196
      expect(beta(1.5, 2.5)).toBeCloseTo(0.19635, 4);
    });
  });

  describe('safeLog function', () => {
    it('should compute natural logarithm for positive values', () => {
      expect(safeLog(1)).toBeCloseTo(0, 6);
      expect(safeLog(Math.E)).toBeCloseTo(1, 6);
      expect(safeLog(10)).toBeCloseTo(Math.log(10), 6);
    });

    it('should return -Infinity for zero and negative values', () => {
      expect(safeLog(0)).toBe(-Infinity);
      expect(safeLog(-1)).toBe(-Infinity);
      expect(safeLog(-10)).toBe(-Infinity);
    });

    it('should handle very small positive values', () => {
      expect(safeLog(1e-10)).toBeCloseTo(Math.log(1e-10), 6);
      expect(safeLog(Number.MIN_VALUE)).toBe(Math.log(Number.MIN_VALUE));
    });
  });

  describe('safePow function', () => {
    it('should compute power for positive base', () => {
      expect(safePow(2, 3)).toBe(8);
      expect(safePow(4, 0.5)).toBeCloseTo(2, 6);
      expect(safePow(Math.E, 2)).toBeCloseTo(Math.E * Math.E, 6);
    });

    it('should handle zero base special cases', () => {
      expect(safePow(0, 0)).toBe(1); // 0^0 = 1 by convention
      expect(safePow(0, 2)).toBe(0);
      expect(safePow(0, -1)).toBe(Infinity);
    });

    it('should handle negative base with integer exponents', () => {
      expect(safePow(-2, 3)).toBe(-8);
      expect(safePow(-2, 4)).toBe(16);
      expect(safePow(-1, 2)).toBe(1);
    });

    it('should return NaN for negative base with non-integer exponents', () => {
      expect(safePow(-2, 0.5)).toBeNaN();
      expect(safePow(-4, 1.5)).toBeNaN();
    });

    it('should handle edge cases', () => {
      expect(safePow(1, 1000)).toBe(1);
      expect(safePow(Infinity, 2)).toBe(Infinity);
      expect(safePow(2, Infinity)).toBe(Infinity);
    });
  });
});