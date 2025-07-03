import { describe, it, expect } from 'vitest';
import { DistributionCatalog } from '../lib/distributionCatalog.js';

describe('Discrete Distribution Plotting', () => {
  const catalog = new DistributionCatalog();

  describe('Plot Type Specifications', () => {
    it('should specify bar plot for discrete distributions', () => {
      const binomial = catalog.getDistributionInfo('binomial');
      const poisson = catalog.getDistributionInfo('poisson');
      const geometric = catalog.getDistributionInfo('geometric');
      const negBinom = catalog.getDistributionInfo('negativeBinomial');

      expect(binomial.plotType).toBe('bar');
      expect(poisson.plotType).toBe('bar');
      expect(geometric.plotType).toBe('bar');
      expect(negBinom.plotType).toBe('bar');

      expect(binomial.type).toBe('discrete');
      expect(poisson.type).toBe('discrete');
      expect(geometric.type).toBe('discrete');
      expect(negBinom.type).toBe('discrete');
    });

    it('should specify line plot for continuous distributions', () => {
      const normal = catalog.getDistributionInfo('normal');
      const beta = catalog.getDistributionInfo('beta');
      
      expect(normal.plotType).toBe('line');
      expect(beta.plotType).toBe('line');
      expect(normal.type).toBe('continuous');
      expect(beta.type).toBe('continuous');
    });
  });

  describe('Discrete Range Generation', () => {
    it('should generate appropriate ranges for discrete distributions', () => {
      const binomialRange = catalog.getDistributionInfo('binomial').rangeCalculator({ n: 20, p: 0.5 });
      expect(binomialRange.min).toBe(0);
      expect(binomialRange.max).toBe(20);

      const poissonRange = catalog.getDistributionInfo('poisson').rangeCalculator({ lambda: 5 });
      expect(poissonRange.min).toBe(0);
      expect(poissonRange.max).toBeGreaterThan(5);

      const geometricRange = catalog.getDistributionInfo('geometric').rangeCalculator({ p: 0.2 });
      expect(geometricRange.min).toBe(1);
      expect(geometricRange.max).toBeGreaterThan(1);
    });
  });

  describe('Data Structure for Plotting', () => {
    it('should include type and plotType in distribution info', () => {
      const binomial = catalog.getDistributionInfo('binomial');
      
      expect(binomial).toHaveProperty('type', 'discrete');
      expect(binomial).toHaveProperty('plotType', 'bar');
      expect(binomial).toHaveProperty('pdf');
      expect(binomial).toHaveProperty('rangeCalculator');
      expect(binomial).toHaveProperty('parameters');
    });
  });

  describe('PMF Computation for Integer Values', () => {
    it('should compute PMF values correctly for discrete distributions', () => {
      const binomial = catalog.getDistributionInfo('binomial');
      
      // Test that PMF is 0 for non-integer values (should be handled by plotting logic)
      expect(binomial.pdf(2.5, 10, 0.5)).toBe(0);
      
      // Test that PMF is positive for valid integer values
      expect(binomial.pdf(0, 10, 0.5)).toBeGreaterThan(0);
      expect(binomial.pdf(5, 10, 0.5)).toBeGreaterThan(0);
      expect(binomial.pdf(10, 10, 0.5)).toBeGreaterThan(0);
      
      // Test that PMF is 0 for out-of-range values
      expect(binomial.pdf(-1, 10, 0.5)).toBe(0);
      expect(binomial.pdf(11, 10, 0.5)).toBe(0);
    });

    it('should compute Poisson PMF correctly', () => {
      const poisson = catalog.getDistributionInfo('poisson');
      
      // Test basic PMF values
      expect(poisson.pdf(0, 1)).toBeCloseTo(Math.exp(-1), 6);
      expect(poisson.pdf(1, 1)).toBeCloseTo(Math.exp(-1), 6);
      
      // Non-integer should return 0
      expect(poisson.pdf(1.5, 1)).toBe(0);
      
      // Negative should return 0
      expect(poisson.pdf(-1, 1)).toBe(0);
    });
  });
});