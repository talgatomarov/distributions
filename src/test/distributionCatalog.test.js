import { describe, it, expect, beforeEach } from 'vitest';
import { DistributionCatalog } from '../lib/distributionCatalog.js';

describe('Distribution Catalog Integration Tests', () => {
  let catalog;

  beforeEach(() => {
    catalog = new DistributionCatalog();
  });

  describe('Catalog Initialization', () => {
    it('should initialize with expected distributions', () => {
      const expectedDistributions = [
        'normal', 'beta', 'gamma', 'exponential', 
        'uniform', 'lognormal', 'chi2', 'student'
      ];
      
      expectedDistributions.forEach(name => {
        expect(catalog.distributions.has(name)).toBe(true);
      });
    });

    it('should have categories defined', () => {
      expect(catalog.categories).toBeDefined();
      expect(catalog.categories).toHaveProperty('Continuous');
    });

    it('should initialize distributions with all required properties', () => {
      const distributions = catalog.getDistributionList();
      
      distributions.forEach(dist => {
        expect(dist).toHaveProperty('name');
        expect(dist).toHaveProperty('displayName');
        expect(dist).toHaveProperty('type');
        expect(dist).toHaveProperty('description');
        expect(dist).toHaveProperty('category');
      });
    });
  });

  describe('Distribution Retrieval', () => {
    it('should return distribution list', () => {
      const distributions = catalog.getDistributionList();
      expect(Array.isArray(distributions)).toBe(true);
      expect(distributions.length).toBeGreaterThan(0);
    });

    it('should return specific distribution info', () => {
      const normalInfo = catalog.getDistributionInfo('normal');
      expect(normalInfo).toBeDefined();
      expect(normalInfo.name).toBe('normal');
      expect(normalInfo.displayName).toBe('Normal (Gaussian)');
    });

    it('should return null for unknown distribution', () => {
      const unknownInfo = catalog.getDistributionInfo('unknown');
      expect(unknownInfo).toBeUndefined();
    });
  });

  describe('Parameter Information', () => {
    it('should return parameter info for normal distribution', () => {
      const params = catalog.getParameterInfo('normal');
      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBe(2);
      
      const muParam = params.find(p => p.name === 'mu');
      const sigmaParam = params.find(p => p.name === 'sigma');
      
      expect(muParam).toBeDefined();
      expect(sigmaParam).toBeDefined();
      expect(muParam.displayName).toBe('Mean (μ)');
      expect(sigmaParam.displayName).toBe('Standard Deviation (σ)');
    });

    it('should return parameter defaults', () => {
      const defaults = catalog.getParameterDefaults('normal');
      expect(defaults).toHaveProperty('mu');
      expect(defaults).toHaveProperty('sigma');
      expect(defaults.mu).toBe(0);
      expect(defaults.sigma).toBe(1);
    });

    it('should return empty array for unknown distribution parameters', () => {
      const params = catalog.getParameterInfo('unknown');
      expect(params).toEqual([]);
    });

    it('should return empty object for unknown distribution defaults', () => {
      const defaults = catalog.getParameterDefaults('unknown');
      expect(defaults).toEqual({});
    });
  });

  describe('PDF Function Access', () => {
    it('should return PDF function for each distribution', () => {
      const distributions = ['normal', 'beta', 'gamma', 'exponential', 'uniform', 'lognormal', 'chi2', 'student'];
      
      distributions.forEach(name => {
        const pdfFunction = catalog.getPDFFunction(name);
        expect(typeof pdfFunction).toBe('function');
      });
    });

    it('should return null for unknown distribution PDF', () => {
      const pdfFunction = catalog.getPDFFunction('unknown');
      expect(pdfFunction).toBeNull();
    });

    it('should execute PDF functions correctly', () => {
      const normalPdf = catalog.getPDFFunction('normal');
      const result = normalPdf(0, 0, 1); // Standard normal at x=0
      expect(result).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 6);
    });
  });

  describe('Range Calculator Integration', () => {
    it('should have range calculator for each distribution', () => {
      const distributions = catalog.getDistributionList();
      
      distributions.forEach(dist => {
        const distInfo = catalog.getDistributionInfo(dist.name);
        expect(distInfo.rangeCalculator).toBeDefined();
        expect(typeof distInfo.rangeCalculator).toBe('function');
      });
    });

    it('should compute ranges correctly', () => {
      const normalInfo = catalog.getDistributionInfo('normal');
      const range = normalInfo.rangeCalculator({ mu: 0, sigma: 1 });
      
      expect(range).toHaveProperty('min');
      expect(range).toHaveProperty('max');
      expect(range.max).toBeGreaterThan(range.min);
    });
  });

  describe('Parameter Validation', () => {
    it('should validate parameter constraints', () => {
      const normalParams = catalog.getParameterInfo('normal');
      const sigmaParam = normalParams.find(p => p.name === 'sigma');
      
      expect(sigmaParam.min).toBeGreaterThan(0); // sigma must be positive
      expect(sigmaParam.default).toBeGreaterThan(0);
    });

    it('should have appropriate step sizes', () => {
      const distributions = catalog.getDistributionList();
      
      distributions.forEach(dist => {
        const params = catalog.getParameterInfo(dist.name);
        params.forEach(param => {
          if (param.step !== undefined) {
            expect(param.step).toBeGreaterThan(0);
          }
        });
      });
    });

    it('should have valid min/max constraints', () => {
      const distributions = catalog.getDistributionList();
      
      distributions.forEach(dist => {
        const params = catalog.getParameterInfo(dist.name);
        params.forEach(param => {
          if (param.min !== undefined && param.max !== undefined) {
            expect(param.max).toBeGreaterThanOrEqual(param.min);
          }
          if (param.default !== undefined && param.min !== undefined) {
            expect(param.default).toBeGreaterThanOrEqual(param.min);
          }
          if (param.default !== undefined && param.max !== undefined) {
            expect(param.default).toBeLessThanOrEqual(param.max);
          }
        });
      });
    });
  });

  describe('Distribution Completeness', () => {
    it('should have complete metadata for each distribution', () => {
      const distributions = catalog.getDistributionList();
      
      distributions.forEach(dist => {
        const info = catalog.getDistributionInfo(dist.name);
        
        // Check required properties
        expect(info.name).toBeDefined();
        expect(info.displayName).toBeDefined();
        expect(info.type).toBeDefined();
        expect(info.description).toBeDefined();
        expect(info.parameters).toBeDefined();
        expect(info.pdf).toBeDefined();
        expect(info.rangeCalculator).toBeDefined();
        expect(info.parameterDefaults).toBeDefined();
        
        // Check parameter completeness
        expect(Array.isArray(info.parameters)).toBe(true);
        info.parameters.forEach(param => {
          expect(param.name).toBeDefined();
          expect(param.displayName).toBeDefined();
          expect(param.default).toBeDefined();
        });
      });
    });

    it('should have consistent parameter names between metadata and defaults', () => {
      const distributions = catalog.getDistributionList();
      
      distributions.forEach(dist => {
        const info = catalog.getDistributionInfo(dist.name);
        const paramNames = info.parameters.map(p => p.name);
        const defaultKeys = Object.keys(info.parameterDefaults);
        
        expect(paramNames.sort()).toEqual(defaultKeys.sort());
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(() => catalog.getDistributionInfo(null)).not.toThrow();
      expect(() => catalog.getDistributionInfo(undefined)).not.toThrow();
      expect(() => catalog.getParameterInfo(null)).not.toThrow();
      expect(() => catalog.getParameterDefaults(undefined)).not.toThrow();
    });

    it('should handle empty string inputs', () => {
      expect(catalog.getDistributionInfo('')).toBeUndefined();
      expect(catalog.getParameterInfo('')).toEqual([]);
      expect(catalog.getParameterDefaults('')).toEqual({});
    });
  });

  describe('Performance', () => {
    it('should initialize quickly', () => {
      const start = Date.now();
      new DistributionCatalog();
      const end = Date.now();
      
      expect(end - start).toBeLessThan(100); // Should initialize in < 100ms
    });

    it('should access distributions quickly', () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        catalog.getDistributionInfo('normal');
      }
      const end = Date.now();
      
      expect(end - start).toBeLessThan(50); // 1000 accesses in < 50ms
    });
  });
});