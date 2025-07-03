import { describe, it, expect } from 'vitest';
import { distributions, distributionCategories } from '../lib/distributions.js';

describe('Discrete Distributions', () => {
  describe('Binomial Distribution', () => {
    const binomial = distributions.binomial;

    it('should compute binomial probabilities correctly', () => {
      // B(10, 0.5) - symmetric case
      expect(binomial.pdf(5, 10, 0.5)).toBeCloseTo(0.24609375, 6); // C(10,5) * 0.5^10
      expect(binomial.pdf(0, 10, 0.5)).toBeCloseTo(0.0009765625, 6);
      expect(binomial.pdf(10, 10, 0.5)).toBeCloseTo(0.0009765625, 6);
    });

    it('should handle edge cases', () => {
      expect(binomial.pdf(5, 10, 0)).toBe(0); // p=0, k>0 should be 0
      expect(binomial.pdf(0, 10, 0)).toBe(1); // p=0, k=0 should be 1
      expect(binomial.pdf(10, 10, 1)).toBe(1); // p=1, k=n should be 1
      expect(binomial.pdf(5, 10, 1)).toBe(0); // p=1, k<n should be 0
    });

    it('should return 0 for invalid inputs', () => {
      expect(binomial.pdf(-1, 10, 0.5)).toBe(0); // negative k
      expect(binomial.pdf(11, 10, 0.5)).toBe(0); // k > n
      expect(binomial.pdf(5.5, 10, 0.5)).toBe(0); // non-integer k
    });
  });

  describe('Poisson Distribution', () => {
    const poisson = distributions.poisson;

    it('should compute Poisson probabilities correctly', () => {
      // Poisson(3) - common case
      expect(poisson.pdf(0, 3)).toBeCloseTo(Math.exp(-3), 6);
      expect(poisson.pdf(1, 3)).toBeCloseTo(3 * Math.exp(-3), 6);
      expect(poisson.pdf(3, 3)).toBeCloseTo(Math.exp(-3) * 27 / 6, 6); // 3^3 * e^-3 / 3!
    });

    it('should handle edge cases', () => {
      expect(poisson.pdf(0, 0.1)).toBeCloseTo(Math.exp(-0.1), 6);
      expect(poisson.pdf(10, 0.1)).toBeGreaterThan(0); // Should be very small but positive
    });

    it('should return 0 for invalid inputs', () => {
      expect(poisson.pdf(-1, 3)).toBe(0); // negative k
      expect(poisson.pdf(5.5, 3)).toBe(0); // non-integer k
      expect(poisson.pdf(5, 0)).toBe(0); // lambda = 0
    });
  });

  describe('Geometric Distribution', () => {
    const geometric = distributions.geometric;

    it('should compute geometric probabilities correctly', () => {
      // Geometric(0.5) - fair coin
      expect(geometric.pdf(1, 0.5)).toBe(0.5); // First trial success
      expect(geometric.pdf(2, 0.5)).toBe(0.25); // Success on second trial
      expect(geometric.pdf(3, 0.5)).toBe(0.125); // Success on third trial
    });

    it('should handle edge cases', () => {
      expect(geometric.pdf(1, 1)).toBe(1); // p=1, first trial always succeeds
      expect(geometric.pdf(2, 1)).toBe(0); // p=1, can't need more than 1 trial
      expect(geometric.pdf(100, 0.01)).toBeCloseTo(0.01 * Math.pow(0.99, 99), 6);
    });

    it('should return 0 for invalid inputs', () => {
      expect(geometric.pdf(0, 0.5)).toBe(0); // k must be >= 1
      expect(geometric.pdf(-1, 0.5)).toBe(0); // negative k
      expect(geometric.pdf(1.5, 0.5)).toBe(0); // non-integer k
    });
  });

  describe('Negative Binomial Distribution', () => {
    const negBinom = distributions.negativeBinomial;

    it('should compute negative binomial probabilities correctly', () => {
      // NegBin(2, 0.5) - need 2 successes
      expect(negBinom.pdf(2, 2, 0.5)).toBe(0.25); // Success on trials 1 and 2
      expect(negBinom.pdf(3, 2, 0.5)).toBe(0.25); // One failure, then two successes
    });

    it('should handle edge cases', () => {
      expect(negBinom.pdf(5, 5, 1)).toBe(1); // p=1, exactly r trials needed
      expect(negBinom.pdf(6, 5, 1)).toBe(0); // p=1, can't need more than r trials
    });

    it('should return 0 for invalid inputs', () => {
      expect(negBinom.pdf(1, 2, 0.5)).toBe(0); // k < r
      expect(negBinom.pdf(-1, 2, 0.5)).toBe(0); // negative k
      expect(negBinom.pdf(5.5, 2, 0.5)).toBe(0); // non-integer k
    });
  });

  describe('Range Calculators', () => {
    it('should provide reasonable ranges for discrete distributions', () => {
      const binomialRange = distributions.binomial.rangeCalculator({ n: 20, p: 0.3 });
      expect(binomialRange.min).toBe(0);
      expect(binomialRange.max).toBe(20);

      const poissonRange = distributions.poisson.rangeCalculator({ lambda: 5 });
      expect(poissonRange.min).toBe(0);
      expect(poissonRange.max).toBeGreaterThan(10);

      const geometricRange = distributions.geometric.rangeCalculator({ p: 0.2 });
      expect(geometricRange.min).toBe(1);
      expect(geometricRange.max).toBeGreaterThan(5);

      const negBinomRange = distributions.negativeBinomial.rangeCalculator({ r: 3, p: 0.4 });
      expect(negBinomRange.min).toBe(3);
      expect(negBinomRange.max).toBeGreaterThan(5);
    });
  });

  describe('Distribution Categories', () => {
    it('should include discrete distributions in categories', () => {
      expect(distributionCategories.Discrete).toContain('binomial');
      expect(distributionCategories.Discrete).toContain('poisson');
      expect(distributionCategories.Discrete).toContain('geometric');
      expect(distributionCategories.Discrete).toContain('negativeBinomial');
    });
  });
});