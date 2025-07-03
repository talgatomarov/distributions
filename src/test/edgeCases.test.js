import { describe, it, expect } from 'vitest';
import { pdfFunctions } from '../lib/distributions.js';
import { gamma, beta } from '../lib/mathUtils.js';

describe('Edge Cases and Error Handling', () => {
  describe('PDF Functions with Extreme Values', () => {
    describe('Normal Distribution Edge Cases', () => {
      const normalPdf = pdfFunctions.normal;

      it('should handle very large x values', () => {
        const result = normalPdf(100, 0, 1);
        expect(result).toBeCloseTo(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle very small sigma values', () => {
        const result = normalPdf(0, 0, 0.001);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThan(0);
      });

      it('should handle very large sigma values', () => {
        const result = normalPdf(0, 0, 1000);
        expect(result).toBeCloseTo(0, 3);
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle extreme mean values', () => {
        expect(normalPdf(1e6, 1e6, 1)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 6);
        expect(normalPdf(-1e6, -1e6, 1)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 6);
      });
    });

    describe('Beta Distribution Edge Cases', () => {
      const betaPdf = pdfFunctions.beta;

      it('should handle very small alpha and beta', () => {
        // For very small alpha,beta the distribution becomes U-shaped
        const result = betaPdf(0.5, 0.1, 0.1);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThan(0);
      });

      it('should handle very large alpha and beta', () => {
        const result = betaPdf(0.5, 100, 100);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThan(0);
      });

      it('should handle asymmetric extreme parameters', () => {
        const result1 = betaPdf(0.01, 0.1, 10);
        const result2 = betaPdf(0.99, 10, 0.1);
        
        expect(result1).toBeFinite();
        expect(result2).toBeFinite();
        expect(result1).toBeGreaterThan(0);
        expect(result2).toBeGreaterThan(0);
      });

      it('should handle values very close to boundaries', () => {
        const epsilon = 1e-10;
        expect(betaPdf(epsilon, 2, 2)).toBeCloseTo(0, 5);
        expect(betaPdf(1 - epsilon, 2, 2)).toBeCloseTo(0, 5);
      });
    });

    describe('Gamma Distribution Edge Cases', () => {
      const gammaPdf = pdfFunctions.gamma;

      it('should handle very small shape parameter', () => {
        const result = gammaPdf(0.5, 0.1, 1);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle very large shape parameter', () => {
        const result = gammaPdf(100, 100, 1);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle very large rate parameter', () => {
        const result = gammaPdf(0.01, 2, 1000);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle x approaching zero', () => {
        // For alpha < 1, PDF should approach infinity as x -> 0
        // For alpha = 1, PDF should approach beta
        // For alpha > 1, PDF should approach 0
        
        const epsilon = 1e-10;
        const result1 = gammaPdf(epsilon, 0.5, 1); // alpha < 1
        const result2 = gammaPdf(epsilon, 1, 1);   // alpha = 1
        const result3 = gammaPdf(epsilon, 2, 1);   // alpha > 1
        
        expect(result1).toBeGreaterThan(result2);
        expect(result2).toBeGreaterThan(result3);
        expect(result3).toBeCloseTo(0, 5);
      });
    });

    describe('Exponential Distribution Edge Cases', () => {
      const expPdf = pdfFunctions.exponential;

      it('should handle very small lambda', () => {
        const result = expPdf(1, 0.001);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle very large lambda', () => {
        const result = expPdf(0.001, 1000);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle very large x', () => {
        const result = expPdf(1000, 1);
        expect(result).toBeCloseTo(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Log-Normal Distribution Edge Cases', () => {
      const lognormalPdf = pdfFunctions.lognormal;

      it('should handle very small x values', () => {
        const epsilon = 1e-10;
        const result = lognormalPdf(epsilon, 0, 1);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle very large x values', () => {
        const result = lognormalPdf(1e10, 0, 1);
        expect(result).toBeCloseTo(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
      });

      it('should handle extreme mu values', () => {
        const result1 = lognormalPdf(1, -10, 1);
        const result2 = lognormalPdf(1, 10, 1);
        
        expect(result1).toBeFinite();
        expect(result2).toBeFinite();
        expect(result1).toBeGreaterThanOrEqual(0);
        expect(result2).toBeGreaterThanOrEqual(0);
      });

      it('should handle very small sigma', () => {
        const result = lognormalPdf(Math.E, 1, 0.001);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  describe('Mathematical Functions Edge Cases', () => {
    describe('Gamma Function Edge Cases', () => {
      it('should handle values close to poles', () => {
        // Gamma function has poles at negative integers
        expect(gamma(-0.9999)).toBeFinite();
        expect(gamma(-1.0001)).toBeFinite();
        expect(Math.abs(gamma(-0.9999))).toBeGreaterThan(100);
      });

      it('should handle very large values', () => {
        // For large values, gamma function grows very quickly
        const result = gamma(50);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThan(0);
      });

      it('should maintain recursion property', () => {
        // Gamma(x+1) = x * Gamma(x)
        const x = 3.5;
        const gamma_x = gamma(x);
        const gamma_x_plus_1 = gamma(x + 1);
        
        expect(gamma_x_plus_1).toBeCloseTo(x * gamma_x, 6);
      });
    });

    describe('Beta Function Edge Cases', () => {
      it('should handle very small parameters', () => {
        const result = beta(0.01, 0.01);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThan(0);
      });

      it('should handle very large parameters', () => {
        const result = beta(100, 100);
        expect(result).toBeFinite();
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(1);
      });

      it('should handle asymmetric extreme parameters', () => {
        const result1 = beta(0.01, 100);
        const result2 = beta(100, 0.01);
        
        expect(result1).toBeFinite();
        expect(result2).toBeFinite();
        expect(result1).toBeCloseTo(result2, 6); // symmetry
      });
    });
  });

  describe('Numerical Stability Tests', () => {
    it('should maintain precision for repeated calculations', () => {
      const normalPdf = pdfFunctions.normal;
      const baseResult = normalPdf(0, 0, 1);
      
      // Perform the same calculation many times
      for (let i = 0; i < 1000; i++) {
        const result = normalPdf(0, 0, 1);
        expect(Math.abs(result - baseResult)).toBeLessThan(1e-14);
      }
    });

    it('should handle underflow gracefully', () => {
      const normalPdf = pdfFunctions.normal;
      
      // This should underflow to 0 but not cause errors
      const result = normalPdf(50, 0, 1);
      expect(result).toBe(0);
      expect(isNaN(result)).toBe(false);
    });

    it('should handle overflow gracefully', () => {
      const normalPdf = pdfFunctions.normal;
      
      // Very small sigma could cause overflow, should be handled
      const result = normalPdf(0, 0, 1e-100);
      expect(isFinite(result)).toBe(true);
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle NaN inputs', () => {
      const normalPdf = pdfFunctions.normal;
      
      expect(normalPdf(NaN, 0, 1)).toBeNaN();
      expect(normalPdf(0, NaN, 1)).toBeNaN();
      expect(normalPdf(0, 0, NaN)).toBeNaN();
    });

    it('should handle Infinity inputs', () => {
      const normalPdf = pdfFunctions.normal;
      
      expect(normalPdf(Infinity, 0, 1)).toBe(0);
      expect(normalPdf(-Infinity, 0, 1)).toBe(0);
      expect(normalPdf(0, Infinity, 1)).toBe(0); // Changed expectation
      expect(normalPdf(0, 0, Infinity)).toBe(0);
    });

    it('should handle zero parameters where invalid', () => {
      expect(pdfFunctions.normal(0, 0, 0)).toBe(0);
      expect(pdfFunctions.beta(0.5, 0, 1)).toBe(0);
      expect(pdfFunctions.gamma(1, 0, 1)).toBe(0);
      expect(pdfFunctions.exponential(1, 0)).toBe(0);
      expect(pdfFunctions.lognormal(1, 0, 0)).toBe(0);
    });

    it('should handle negative parameters where invalid', () => {
      expect(pdfFunctions.normal(0, 0, -1)).toBe(0);
      expect(pdfFunctions.beta(0.5, -1, 1)).toBe(0);
      expect(pdfFunctions.gamma(1, -1, 1)).toBe(0);
      expect(pdfFunctions.exponential(1, -1)).toBe(0);
      expect(pdfFunctions.lognormal(1, 0, -1)).toBe(0);
    });
  });

  describe('Boundary Condition Tests', () => {
    it('should handle distribution boundaries correctly', () => {
      // Beta distribution boundaries
      expect(pdfFunctions.beta(0, 2, 2)).toBe(0);
      expect(pdfFunctions.beta(1, 2, 2)).toBe(0);
      
      // Gamma/Exponential at x=0
      expect(pdfFunctions.gamma(0, 1, 1)).toBeCloseTo(1, 6);
      expect(pdfFunctions.exponential(0, 1)).toBeCloseTo(1, 6);
      
      // Log-normal at x=0
      expect(pdfFunctions.lognormal(0, 0, 1)).toBe(0);
      
      // Uniform boundaries
      expect(pdfFunctions.uniform(0, 0, 1)).toBeCloseTo(1, 6);
      expect(pdfFunctions.uniform(1, 0, 1)).toBeCloseTo(1, 6);
    });
  });

  describe('Performance Under Stress', () => {
    it('should handle rapid successive calls', () => {
      const normalPdf = pdfFunctions.normal;
      const start = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        normalPdf(Math.random() * 10 - 5, 0, 1);
      }
      
      const end = Date.now();
      expect(end - start).toBeLessThan(1000); // Should complete in < 1 second
    });

    it('should handle concurrent calculations', () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve().then(() => {
          return pdfFunctions.normal(i / 10, 0, 1);
        }));
      }
      
      return Promise.all(promises).then(results => {
        expect(results.length).toBe(100);
        results.forEach(result => {
          expect(result).toBeFinite();
          expect(result).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});