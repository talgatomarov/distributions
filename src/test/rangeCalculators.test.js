import { describe, it, expect } from 'vitest';
import { rangeCalculators } from '../lib/distributions.js';

describe('Range Calculators', () => {
  describe('Normal Distribution Range', () => {
    const normalRange = rangeCalculators.normal;

    it('should calculate range for standard normal', () => {
      const range = normalRange({ mu: 0, sigma: 1 });
      expect(range.min).toBeCloseTo(-4, 1);
      expect(range.max).toBeCloseTo(4, 1);
    });

    it('should calculate range for shifted normal', () => {
      const range = normalRange({ mu: 5, sigma: 2 });
      expect(range.min).toBeCloseTo(-3, 1); // 5 - 4*2
      expect(range.max).toBeCloseTo(13, 1); // 5 + 4*2
    });

    it('should handle default parameters', () => {
      const range = normalRange({});
      expect(range.min).toBeCloseTo(-4, 1);
      expect(range.max).toBeCloseTo(4, 1);
    });

    it('should scale with standard deviation', () => {
      const range1 = normalRange({ mu: 0, sigma: 0.5 });
      const range2 = normalRange({ mu: 0, sigma: 2 });
      
      expect(Math.abs(range2.max - range2.min)).toBeGreaterThan(Math.abs(range1.max - range1.min));
    });
  });

  describe('Beta Distribution Range', () => {
    const betaRange = rangeCalculators.beta;

    it('should always return [0,1] regardless of parameters', () => {
      expect(betaRange({ alpha: 1, beta: 1 })).toEqual({ min: 0, max: 1 });
      expect(betaRange({ alpha: 2, beta: 5 })).toEqual({ min: 0, max: 1 });
      expect(betaRange({ alpha: 0.5, beta: 0.5 })).toEqual({ min: 0, max: 1 });
      expect(betaRange({})).toEqual({ min: 0, max: 1 });
    });
  });

  describe('Gamma Distribution Range', () => {
    const gammaRange = rangeCalculators.gamma;

    it('should start at 0 and scale with parameters', () => {
      const range = gammaRange({ alpha: 2, beta: 1 });
      expect(range.min).toBe(0);
      expect(range.max).toBeGreaterThan(5);
    });

    it('should decrease max with higher rate parameter', () => {
      const range1 = gammaRange({ alpha: 2, beta: 1 });
      const range2 = gammaRange({ alpha: 2, beta: 2 });
      
      expect(range2.max).toBeLessThan(range1.max);
    });

    it('should increase max with higher shape parameter', () => {
      const range1 = gammaRange({ alpha: 1, beta: 1 });
      const range2 = gammaRange({ alpha: 5, beta: 1 });
      
      expect(range2.max).toBeGreaterThan(range1.max);
    });

    it('should handle default parameters', () => {
      const range = gammaRange({});
      expect(range.min).toBe(0);
      expect(range.max).toBeGreaterThan(0);
    });
  });

  describe('Exponential Distribution Range', () => {
    const expRange = rangeCalculators.exponential;

    it('should start at 0 and scale inversely with lambda', () => {
      const range1 = expRange({ lambda: 1 });
      const range2 = expRange({ lambda: 2 });
      
      expect(range1.min).toBe(0);
      expect(range2.min).toBe(0);
      expect(range2.max).toBeLessThan(range1.max);
    });

    it('should handle default parameters', () => {
      const range = expRange({});
      expect(range.min).toBe(0);
      expect(range.max).toBeCloseTo(5, 1);
    });

    it('should provide reasonable coverage', () => {
      // Range should cover ~99% of the distribution
      const range = expRange({ lambda: 1 });
      expect(range.max).toBeGreaterThan(4); // covers >98% for exp(1)
    });
  });

  describe('Uniform Distribution Range', () => {
    const uniformRange = rangeCalculators.uniform;

    it('should extend beyond the uniform bounds', () => {
      const range = uniformRange({ a: 2, b: 5 });
      expect(range.min).toBeLessThan(2);
      expect(range.max).toBeGreaterThan(5);
    });

    it('should maintain proportional extension', () => {
      const range1 = uniformRange({ a: 0, b: 1 });
      const range2 = uniformRange({ a: 0, b: 10 });
      
      const extension1 = (range1.max - range1.min) - 1;
      const extension2 = (range2.max - range2.min) - 10;
      
      expect(extension2).toBeGreaterThan(extension1);
    });

    it('should handle default parameters', () => {
      const range = uniformRange({});
      expect(range.min).toBeLessThan(0);
      expect(range.max).toBeGreaterThan(1);
    });

    it('should handle negative bounds', () => {
      const range = uniformRange({ a: -5, b: -2 });
      expect(range.min).toBeLessThan(-5);
      expect(range.max).toBeGreaterThan(-2);
    });
  });

  describe('Log-Normal Distribution Range', () => {
    const lognormalRange = rangeCalculators.lognormal;

    it('should start at 0', () => {
      const range = lognormalRange({ mu: 0, sigma: 1 });
      expect(range.min).toBe(0);
    });

    it('should scale with parameters', () => {
      const range1 = lognormalRange({ mu: 0, sigma: 1 });
      const range2 = lognormalRange({ mu: 1, sigma: 1 });
      
      expect(range2.max).toBeGreaterThan(range1.max);
    });

    it('should handle default parameters', () => {
      const range = lognormalRange({});
      expect(range.min).toBe(0);
      expect(range.max).toBeGreaterThan(0);
    });

    it('should provide reasonable upper bound', () => {
      // Should cover most of the distribution
      const range = lognormalRange({ mu: 0, sigma: 0.5 });
      expect(range.max).toBeGreaterThan(1);
      expect(range.max).toBeLessThan(100); // shouldn't be too extreme
    });
  });

  describe('Chi-Squared Distribution Range', () => {
    const chi2Range = rangeCalculators.chi2;

    it('should start at 0', () => {
      const range = chi2Range({ k: 1 });
      expect(range.min).toBe(0);
    });

    it('should scale with degrees of freedom', () => {
      const range1 = chi2Range({ k: 1 });
      const range2 = chi2Range({ k: 10 });
      
      expect(range2.max).toBeGreaterThan(range1.max);
    });

    it('should handle default parameters', () => {
      const range = chi2Range({});
      expect(range.min).toBe(0);
      expect(range.max).toBeGreaterThan(1);
    });

    it('should provide reasonable coverage', () => {
      // Range should be approximately k + 4*sqrt(2k)
      const k = 5;
      const range = chi2Range({ k });
      const expectedMax = k + 4 * Math.sqrt(2 * k);
      expect(range.max).toBeCloseTo(expectedMax, 1);
    });
  });

  describe('Student t Distribution Range', () => {
    const studentRange = rangeCalculators.student;

    it('should be symmetric around zero', () => {
      const range = studentRange({ nu: 5 });
      expect(range.min).toBeCloseTo(-range.max, 1);
    });

    it('should be wider for smaller degrees of freedom', () => {
      const range1 = studentRange({ nu: 1 });
      const range2 = studentRange({ nu: 30 });
      
      expect(Math.abs(range1.max)).toBeGreaterThan(Math.abs(range2.max));
    });

    it('should handle default parameters', () => {
      const range = studentRange({});
      expect(range.min).toBeLessThan(0);
      expect(range.max).toBeGreaterThan(0);
      expect(range.min).toBeCloseTo(-range.max, 1);
    });

    it('should approach normal range for large nu', () => {
      const range = studentRange({ nu: 100 });
      // Should be close to ±4 for large degrees of freedom
      expect(Math.abs(range.max)).toBeLessThan(5);
      expect(Math.abs(range.max)).toBeGreaterThan(3);
    });
  });

  describe('Range Calculator Edge Cases', () => {
    it('should handle missing parameters gracefully', () => {
      expect(() => rangeCalculators.normal({})).not.toThrow();
      expect(() => rangeCalculators.gamma({})).not.toThrow();
      expect(() => rangeCalculators.exponential({})).not.toThrow();
    });

    it('should return valid ranges for all distributions', () => {
      const distributions = Object.keys(rangeCalculators);
      
      distributions.forEach(dist => {
        const range = rangeCalculators[dist]({});
        expect(range).toHaveProperty('min');
        expect(range).toHaveProperty('max');
        expect(typeof range.min).toBe('number');
        expect(typeof range.max).toBe('number');
        expect(range.max).toBeGreaterThan(range.min);
      });
    });
  });
});