import { distributions, distributionCategories } from './distributions.js';

export class DistributionCatalog {
  constructor() {
    this.distributions = new Map();
    this.categories = distributionCategories;
    this.initializeDistributions();
  }

  initializeDistributions() {
    // Initialize distributions using centralized specs
    Object.values(distributions).forEach(dist => {
      const distributionInfo = {
        ...dist,
        parameterDefaults: this.extractDefaults(dist.parameters)
      };
      this.distributions.set(dist.name, distributionInfo);
    });
  }

  extractDefaults(parameters) {
    const defaults = {};
    parameters.forEach(param => {
      defaults[param.name] = param.default;
    });
    return defaults;
  }

  getDistributionList() {
    return Array.from(this.distributions.values()).map(dist => ({
      name: dist.name,
      displayName: dist.displayName,
      type: dist.type,
      description: dist.description,
      category: dist.category
    }));
  }

  getDistributionInfo(name) {
    return this.distributions.get(name);
  }

  getParameterInfo(distributionName) {
    const dist = this.distributions.get(distributionName);
    return dist ? dist.parameters : [];
  }

  getParameterDefaults(distributionName) {
    const dist = this.distributions.get(distributionName);
    return dist ? dist.parameterDefaults : {};
  }

  getPDFFunction(distributionName) {
    const dist = this.distributions.get(distributionName);
    return dist ? dist.pdf : null;
  }
}