import { describe, it, expect } from 'vitest';
import { pdfFunctions } from '../lib/distributions.js';

describe('PDF Functions', () => {
  describe('Normal Distribution', () => {
    const normalPdf = pdfFunctions.normal;

    it('should compute standard normal PDF correctly', () => {
      // Standard normal: N(0,1)
      // PDF at x=0 should be 1/sqrt(2π) ≈ 0.39894
      expect(normalPdf(0, 0, 1)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 6);
      
      // PDF at x=1 should be 1/sqrt(2π) * e^(-0.5) ≈ 0.24197
      expect(normalPdf(1, 0, 1)).toBeCloseTo(Math.exp(-0.5) / Math.sqrt(2 * Math.PI), 6);
      
      // PDF at x=-1 should be same as x=1 (symmetry)
      expect(normalPdf(-1, 0, 1)).toBeCloseTo(normalPdf(1, 0, 1), 6);
    });

    it('should handle different means and standard deviations', () => {
      // N(2, 0.5) at x=2 should be 1/(0.5*sqrt(2π)) ≈ 0.79788
      expect(normalPdf(2, 2, 0.5)).toBeCloseTo(1 / (0.5 * Math.sqrt(2 * Math.PI)), 6);
      
      // N(-1, 2) at x=-1 should be 1/(2*sqrt(2π)) ≈ 0.19947
      expect(normalPdf(-1, -1, 2)).toBeCloseTo(1 / (2 * Math.sqrt(2 * Math.PI)), 6);
    });

    it('should return 0 for invalid parameters', () => {
      expect(normalPdf(0, 0, 0)).toBe(0);
      expect(normalPdf(0, 0, -1)).toBe(0);
    });
  });

  describe('Beta Distribution', () => {
    const betaPdf = pdfFunctions.beta;

    it('should compute uniform distribution Beta(1,1)', () => {
      // Beta(1,1) is uniform on [0,1]
      expect(betaPdf(0.5, 1, 1)).toBeCloseTo(1, 6);
      expect(betaPdf(0.2, 1, 1)).toBeCloseTo(1, 6);
      expect(betaPdf(0.8, 1, 1)).toBeCloseTo(1, 6);
    });

    it('should handle symmetric Beta(2,2)', () => {
      // Beta(2,2) is symmetric around 0.5
      // PDF at x=0.5 should be 6 * 0.5^1 * 0.5^1 = 1.5
      expect(betaPdf(0.5, 2, 2)).toBeCloseTo(1.5, 6);
      
      // PDF at x=0.3 should equal PDF at x=0.7
      expect(betaPdf(0.3, 2, 2)).toBeCloseTo(betaPdf(0.7, 2, 2), 6);
    });

    it('should return 0 outside [0,1] domain', () => {
      expect(betaPdf(-0.1, 2, 2)).toBe(0);
      expect(betaPdf(1.1, 2, 2)).toBe(0);
      expect(betaPdf(0, 2, 2)).toBe(0);
      expect(betaPdf(1, 2, 2)).toBe(0);
    });

    it('should return 0 for invalid parameters', () => {
      expect(betaPdf(0.5, 0, 1)).toBe(0);
      expect(betaPdf(0.5, 1, -1)).toBe(0);
    });
  });

  describe('Gamma Distribution', () => {
    const gammaPdf = pdfFunctions.gamma;

    it('should compute exponential distribution Gamma(1,λ)', () => {
      // Gamma(1,1) is exponential with rate 1
      // PDF at x=0 should be 1
      expect(gammaPdf(0, 1, 1)).toBeCloseTo(1, 6);
      
      // PDF at x=1 should be e^(-1) ≈ 0.36788
      expect(gammaPdf(1, 1, 1)).toBeCloseTo(Math.exp(-1), 6);
    });

    it('should handle different shape and rate parameters', () => {
      // Gamma(2,1) at x=1 should be 1*e^(-1) ≈ 0.36788
      expect(gammaPdf(1, 2, 1)).toBeCloseTo(Math.exp(-1), 6);
      
      // Gamma(2,2) at x=1 should be 4*1*e^(-2) ≈ 0.54134
      expect(gammaPdf(1, 2, 2)).toBeCloseTo(4 * Math.exp(-2), 6);
    });

    it('should return 0 for negative x', () => {
      expect(gammaPdf(-1, 2, 1)).toBe(0);
      expect(gammaPdf(-0.1, 1, 1)).toBe(0);
    });

    it('should return 0 for invalid parameters', () => {
      expect(gammaPdf(1, 0, 1)).toBe(0);
      expect(gammaPdf(1, 1, -1)).toBe(0);
    });
  });

  describe('Exponential Distribution', () => {
    const expPdf = pdfFunctions.exponential;

    it('should compute PDF correctly', () => {
      // Exponential(1) at x=0 should be 1
      expect(expPdf(0, 1)).toBeCloseTo(1, 6);
      
      // Exponential(1) at x=1 should be e^(-1) ≈ 0.36788
      expect(expPdf(1, 1)).toBeCloseTo(Math.exp(-1), 6);
      
      // Exponential(2) at x=0.5 should be 2*e^(-1) ≈ 0.73576
      expect(expPdf(0.5, 2)).toBeCloseTo(2 * Math.exp(-1), 6);
    });

    it('should return 0 for negative x', () => {
      expect(expPdf(-1, 1)).toBe(0);
      expect(expPdf(-0.1, 1)).toBe(0);
    });

    it('should return 0 for invalid parameters', () => {
      expect(expPdf(1, 0)).toBe(0);
      expect(expPdf(1, -1)).toBe(0);
    });
  });

  describe('Uniform Distribution', () => {
    const uniformPdf = pdfFunctions.uniform;

    it('should compute PDF correctly for [0,1]', () => {
      expect(uniformPdf(0.5, 0, 1)).toBeCloseTo(1, 6);
      expect(uniformPdf(0, 0, 1)).toBeCloseTo(1, 6);
      expect(uniformPdf(1, 0, 1)).toBeCloseTo(1, 6);
    });

    it('should compute PDF correctly for different intervals', () => {
      // Uniform on [2,4] should have PDF = 1/2 = 0.5
      expect(uniformPdf(3, 2, 4)).toBeCloseTo(0.5, 6);
      expect(uniformPdf(2.5, 2, 4)).toBeCloseTo(0.5, 6);
      
      // Uniform on [-1,1] should have PDF = 1/2 = 0.5
      expect(uniformPdf(0, -1, 1)).toBeCloseTo(0.5, 6);
    });

    it('should return 0 outside the interval', () => {
      expect(uniformPdf(-0.1, 0, 1)).toBe(0);
      expect(uniformPdf(1.1, 0, 1)).toBe(0);
      expect(uniformPdf(1.5, 2, 4)).toBe(0);
      expect(uniformPdf(4.5, 2, 4)).toBe(0);
    });

    it('should return 0 for invalid parameters', () => {
      expect(uniformPdf(0.5, 1, 0)).toBe(0); // b <= a
      expect(uniformPdf(0.5, 1, 1)).toBe(0); // b = a
    });
  });

  describe('Log-Normal Distribution', () => {
    const lognormalPdf = pdfFunctions.lognormal;

    it('should compute PDF correctly', () => {
      // Standard log-normal: mu=0, sigma=1
      // At x=1: PDF = 1/(1*1*sqrt(2π)) * exp(0) = 1/sqrt(2π) ≈ 0.39894
      expect(lognormalPdf(1, 0, 1)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 6);
      
      // At x=e: PDF = 1/(e*1*sqrt(2π)) * exp(-0.5) ≈ 0.14702
      const e = Math.E;
      expect(lognormalPdf(e, 0, 1)).toBeCloseTo(Math.exp(-0.5) / (e * Math.sqrt(2 * Math.PI)), 6);
    });

    it('should handle different parameters', () => {
      // Log-normal with mu=1, sigma=0.5
      const mu = 1, sigma = 0.5;
      const x = 2;
      const expected = (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((Math.log(x) - mu) / sigma, 2));
      expect(lognormalPdf(x, mu, sigma)).toBeCloseTo(expected, 6);
    });

    it('should return 0 for non-positive x', () => {
      expect(lognormalPdf(0, 0, 1)).toBe(0);
      expect(lognormalPdf(-1, 0, 1)).toBe(0);
      expect(lognormalPdf(-0.1, 0, 1)).toBe(0);
    });

    it('should return 0 for invalid parameters', () => {
      expect(lognormalPdf(1, 0, 0)).toBe(0);
      expect(lognormalPdf(1, 0, -1)).toBe(0);
    });
  });

  describe('Chi-Squared Distribution', () => {
    const chi2Pdf = pdfFunctions.chi2;

    it('should compute PDF for k=1', () => {
      // Chi-squared(1) at x=1 should be 1/(2^(1/2)*Γ(1/2)) * 1^(-1/2) * e^(-1/2)
      // = 1/(sqrt(2)*sqrt(π)) * 1 * e^(-1/2) ≈ 0.24197
      expect(chi2Pdf(1, 1)).toBeCloseTo(Math.exp(-0.5) / Math.sqrt(2 * Math.PI), 5);
    });

    it('should compute PDF for k=2', () => {
      // Chi-squared(2) is exponential(1/2)
      // At x=0 should be 0.5, at x=2 should be 0.5*e^(-1) ≈ 0.18394
      expect(chi2Pdf(0, 2)).toBeCloseTo(0.5, 6);
      expect(chi2Pdf(2, 2)).toBeCloseTo(0.5 * Math.exp(-1), 6);
    });

    it('should return 0 for negative x', () => {
      expect(chi2Pdf(-1, 2)).toBe(0);
      expect(chi2Pdf(-0.1, 1)).toBe(0);
    });

    it('should return 0 for invalid parameters', () => {
      expect(chi2Pdf(1, 0)).toBe(0);
      expect(chi2Pdf(1, -1)).toBe(0);
    });
  });

  describe('Student t Distribution', () => {
    const studentPdf = pdfFunctions.student;

    it('should compute PDF for nu=1 (Cauchy distribution)', () => {
      // t(1) at x=0 should be Γ(1)/Γ(0.5) / (sqrt(π)*1) = 1/(π) ≈ 0.31831
      expect(studentPdf(0, 1)).toBeCloseTo(1 / Math.PI, 5);
      
      // t(1) at x=1 should be 1/(π*2) = 0.15916
      expect(studentPdf(1, 1)).toBeCloseTo(1 / (Math.PI * 2), 5);
    });

    it('should approach normal as nu increases', () => {
      // For large nu, t-distribution approaches standard normal
      const nu = 30;
      const x = 0;
      const tValue = studentPdf(x, nu);
      const normalValue = 1 / Math.sqrt(2 * Math.PI);
      
      // Should be close to standard normal PDF at x=0
      expect(Math.abs(tValue - normalValue)).toBeLessThan(0.01);
    });

    it('should be symmetric around zero', () => {
      expect(studentPdf(1, 2)).toBeCloseTo(studentPdf(-1, 2), 6);
      expect(studentPdf(0.5, 5)).toBeCloseTo(studentPdf(-0.5, 5), 6);
    });

    it('should return 0 for invalid parameters', () => {
      expect(studentPdf(0, 0)).toBe(0);
      expect(studentPdf(0, -1)).toBe(0);
    });
  });
});