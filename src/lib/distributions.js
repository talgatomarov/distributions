import { gamma, beta, safeLog, safePow, logFactorial, logGamma, normalCDF, besselI0, erfc } from './mathUtils.js';

/**
 * Complete distribution specifications - all distribution data in one place
 */
export const distributions = {
  normal: {
    name: 'normal',
    displayName: 'Normal (Gaussian)',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Mean (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Center of the distribution' 
      },
      { 
        name: 'sigma', 
        displayName: 'Standard Deviation (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Spread of the distribution' 
      }
    ],
    description: 'The normal distribution is symmetric about the mean, with 68% of values within one standard deviation.',
    category: 'Continuous',
    commonUse: 'Natural phenomena, measurement errors, Central Limit Theorem',
    pdf: (x, mu, sigma) => {
      if (sigma <= 0) return 0;
      const z = (x - mu) / sigma;
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const sigma = params.sigma || 1;
      return { min: mu - 4 * sigma, max: mu + 4 * sigma };
    }
  },

  beta: {
    name: 'beta',
    displayName: 'Beta',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'alpha', 
        displayName: 'Alpha (α)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Shape parameter - higher values shift mass toward 1' 
      },
      { 
        name: 'beta', 
        displayName: 'Beta (β)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Shape parameter - higher values shift mass toward 0' 
      }
    ],
    description: 'The beta distribution is defined on [0,1] and commonly used for modeling probabilities and proportions.',
    category: 'Continuous',
    commonUse: 'Bayesian inference, success rates, proportions',
    pdf: (x, alpha, betaParam) => {
      if (x < 0 || x > 1 || alpha <= 0 || betaParam <= 0) return 0;
      if (x === 0 || x === 1) {
        // Handle boundary cases properly
        if ((alpha > 1 && x === 0) || (betaParam > 1 && x === 1)) return 0;
        if ((alpha < 1 && x === 0) || (betaParam < 1 && x === 1)) return Infinity;
        if ((alpha === 1 && x === 0) || (betaParam === 1 && x === 1)) {
          const betaValue = beta(alpha, betaParam);
          return isFinite(betaValue) && betaValue > 0 ? 1 / betaValue : 0;
        }
        return 0;
      }
      
      try {
        const betaValue = beta(alpha, betaParam);
        if (!isFinite(betaValue) || betaValue <= 0) return 0;
        
        const term1 = safePow(x, alpha - 1);
        const term2 = safePow(1 - x, betaParam - 1);
        
        if (!isFinite(term1) || !isFinite(term2)) return 0;
        
        const result = term1 * term2 / betaValue;
        return isFinite(result) ? result : 0;
      } catch (error) {
        return 0;
      }
    },
    rangeCalculator: () => ({ min: 0, max: 1 })
  },

  gamma: {
    name: 'gamma',
    displayName: 'Gamma',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'alpha', 
        displayName: 'Shape (α)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Controls the shape - higher values create more peaked distributions' 
      },
      { 
        name: 'beta', 
        displayName: 'Rate (β)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Inverse scale parameter - higher values compress the distribution' 
      }
    ],
    description: 'The gamma distribution is used to model waiting times and has applications in Bayesian analysis.',
    category: 'Continuous',
    commonUse: 'Waiting times, reliability analysis, Bayesian priors',
    pdf: (x, alpha, betaParam) => {
      if (x < 0 || alpha <= 0 || betaParam <= 0) return 0;
      try {
        const gammaValue = gamma(alpha);
        return (safePow(betaParam, alpha) / gammaValue) * safePow(x, alpha - 1) * Math.exp(-betaParam * x);
      } catch (error) {
        return 0;
      }
    },
    rangeCalculator: (params) => {
      const alpha = params.alpha || 1;
      const beta = params.beta || 1;
      return { min: 0, max: Math.max(5, (alpha + 3 * Math.sqrt(alpha)) / beta) };
    }
  },

  exponential: {
    name: 'exponential',
    displayName: 'Exponential',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'lambda', 
        displayName: 'Rate (λ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Average rate of events - higher values mean shorter waiting times' 
      }
    ],
    description: 'The exponential distribution models the time between events in a Poisson process.',
    category: 'Continuous',
    commonUse: 'Inter-arrival times, survival analysis, reliability',
    pdf: (x, lambda) => {
      if (x < 0 || lambda <= 0) return 0;
      return lambda * Math.exp(-lambda * x);
    },
    rangeCalculator: (params) => {
      const lambda = params.lambda || 1;
      return { min: 0, max: 5 / lambda };
    }
  },

  uniform: {
    name: 'uniform',
    displayName: 'Uniform',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'a', 
        displayName: 'Lower Bound (a)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Minimum possible value' 
      },
      { 
        name: 'b', 
        displayName: 'Upper Bound (b)', 
        type: 'number', 
        default: 1, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Maximum possible value' 
      }
    ],
    description: 'The uniform distribution assigns equal probability to all values in the interval [a,b].',
    category: 'Continuous',  
    commonUse: 'Random number generation, modeling uncertainty with known bounds',
    pdf: (x, a, b) => {
      if (b <= a) return 0;
      if (x < a || x > b) return 0;
      return 1 / (b - a);
    },
    rangeCalculator: (params) => {
      const a = params.a || 0;
      const b = params.b || 1;
      const range = b - a;
      return { min: a - 0.1 * range, max: b + 0.1 * range };
    }
  },

  lognormal: {
    name: 'lognormal',
    displayName: 'Log-Normal',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Log Mean (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -2, max: 2, step: 0.1 },
        description: 'Mean of the underlying normal distribution' 
      },
      { 
        name: 'sigma', 
        displayName: 'Log Std Dev (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 2, step: 0.1 },
        description: 'Standard deviation of the underlying normal distribution' 
      }
    ],
    description: 'The log-normal distribution is used when the logarithm of the variable is normally distributed.',
    category: 'Continuous',
    commonUse: 'Stock prices, income distributions, biological measurements',
    pdf: (x, mu, sigma) => {
      if (x <= 0 || sigma <= 0) return 0;
      const logX = safeLog(x);
      if (!isFinite(logX)) return 0;
      const z = (logX - mu) / sigma;
      return (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const sigma = params.sigma || 1;
      const mean = Math.exp(mu + sigma * sigma / 2);
      return { min: 0, max: mean + 3 * Math.sqrt((Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma)) };
    }
  },

  chi2: {
    name: 'chi2',
    displayName: 'Chi-Squared',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'k', 
        displayName: 'Degrees of Freedom (k)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 1, max: 10, step: 1 },
        description: 'Number of independent standard normal variables being squared' 
      }
    ],
    description: 'The chi-squared distribution arises in statistical testing and is the sum of squares of standard normal variables.',
    category: 'Continuous',
    commonUse: 'Hypothesis testing, confidence intervals, goodness-of-fit tests',
    pdf: (x, k) => {
      if (x < 0 || k <= 0) return 0;
      if (x === 0 && k < 2) return Infinity;
      if (x === 0 && k === 2) return 0.5;
      if (x === 0) return 0;
      try {
        const gammaValue = gamma(k / 2);
        return (1 / (safePow(2, k / 2) * gammaValue)) * safePow(x, k / 2 - 1) * Math.exp(-x / 2);
      } catch (error) {
        return 0;
      }
    },
    rangeCalculator: (params) => {
      const k = params.k || 1;
      return { min: 0, max: k + 4 * Math.sqrt(2 * k) };
    }
  },

  student: {
    name: 'student',
    displayName: "Student's t",
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'nu', 
        displayName: 'Degrees of Freedom (ν)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.5, max: 10, step: 0.5 },
        description: 'Controls tail heaviness - higher values approach normal distribution' 
      }
    ],
    description: "Student's t-distribution is used in hypothesis testing when population standard deviation is unknown.",
    category: 'Continuous',
    commonUse: 'Small sample hypothesis testing, confidence intervals',
    pdf: (x, nu) => {
      if (nu <= 0) return 0;
      try {
        const gammaRatio = gamma((nu + 1) / 2) / gamma(nu / 2);
        const denominator = Math.sqrt(nu * Math.PI) * safePow(1 + (x * x) / nu, (nu + 1) / 2);
        return gammaRatio / denominator;
      } catch (error) {
        return 0;
      }
    },
    rangeCalculator: (params) => {
      const nu = params.nu || 1;
      const scale = nu > 2 ? Math.sqrt(nu / (nu - 2)) : 3;
      return { min: -4 * scale, max: 4 * scale };
    }
  },

  // Discrete Distributions
  binomial: {
    name: 'binomial',
    displayName: 'Binomial',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'n', 
        displayName: 'Number of Trials (n)', 
        type: 'number', 
        default: 10, 
        min: 1, 
        max: Infinity, 
        step: 1,
        sliderRange: { min: 1, max: 50, step: 1 },
        description: 'Total number of independent trials' 
      },
      { 
        name: 'p', 
        displayName: 'Success Probability (p)', 
        type: 'number', 
        default: 0.5, 
        min: 0, 
        max: 1, 
        step: 0.01,
        sliderRange: { min: 0, max: 1, step: 0.01 },
        description: 'Probability of success on each trial' 
      }
    ],
    description: 'The binomial distribution models the number of successes in a fixed number of independent trials.',
    category: 'Discrete',
    commonUse: 'Quality control, clinical trials, polling, A/B testing',
    pdf: (k, n, p) => {
      if (!Number.isInteger(k) || k < 0 || k > n || n < 0 || p < 0 || p > 1) return 0;
      if (p === 0) return k === 0 ? 1 : 0;
      if (p === 1) return k === n ? 1 : 0;
      
      // Binomial coefficient C(n,k) = n! / (k! * (n-k)!)
      let coeff = 1;
      for (let i = 0; i < k; i++) {
        coeff = coeff * (n - i) / (i + 1);
      }
      
      return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
    },
    rangeCalculator: (params) => {
      const n = params.n || 10;
      return { min: 0, max: n };
    }
  },

  poisson: {
    name: 'poisson',
    displayName: 'Poisson',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'lambda', 
        displayName: 'Rate (λ)', 
        type: 'number', 
        default: 3, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 20, step: 0.1 },
        description: 'Average rate of events per unit time/space' 
      }
    ],
    description: 'The Poisson distribution models the number of events occurring in a fixed interval.',
    category: 'Discrete',
    commonUse: 'Call center arrivals, defects per unit, website visits, radioactive decay',
    pdf: (k, lambda) => {
      if (!Number.isInteger(k) || k < 0 || lambda <= 0) return 0;
      
      // P(X = k) = (λ^k * e^(-λ)) / k!
      // Use logarithms for numerical stability
      const logProb = k * Math.log(lambda) - lambda - logFactorial(k);
      return Math.exp(logProb);
    },
    rangeCalculator: (params) => {
      const lambda = params.lambda || 3;
      // Show range up to about 99.9% of probability mass
      const max = Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
      return { min: 0, max };
    }
  },

  geometric: {
    name: 'geometric',
    displayName: 'Geometric',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'p', 
        displayName: 'Success Probability (p)', 
        type: 'number', 
        default: 0.3, 
        min: 0.001, 
        max: 1, 
        step: 0.001,
        sliderRange: { min: 0.01, max: 1, step: 0.01 },
        description: 'Probability of success on each trial' 
      }
    ],
    description: 'The geometric distribution models the number of trials until the first success.',
    category: 'Discrete',
    commonUse: 'Time to first success, reliability testing, customer acquisition',
    pdf: (k, p) => {
      if (!Number.isInteger(k) || k < 1 || p <= 0 || p > 1) return 0;
      
      // P(X = k) = (1-p)^(k-1) * p
      return Math.pow(1 - p, k - 1) * p;
    },
    rangeCalculator: (params) => {
      const p = params.p || 0.3;
      // Show range covering about 99% of probability mass
      const max = Math.max(10, Math.ceil(-Math.log(0.01) / Math.log(1 - p)));
      return { min: 1, max };
    }
  },

  negativeBinomial: {
    name: 'negativeBinomial',
    displayName: 'Negative Binomial',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'r', 
        displayName: 'Number of Successes (r)', 
        type: 'number', 
        default: 5, 
        min: 1, 
        max: Infinity, 
        step: 1,
        sliderRange: { min: 1, max: 20, step: 1 },
        description: 'Number of successes desired' 
      },
      { 
        name: 'p', 
        displayName: 'Success Probability (p)', 
        type: 'number', 
        default: 0.3, 
        min: 0.001, 
        max: 1, 
        step: 0.001,
        sliderRange: { min: 0.01, max: 1, step: 0.01 },
        description: 'Probability of success on each trial' 
      }
    ],
    description: 'The negative binomial distribution models the number of trials until the r-th success.',
    category: 'Discrete',
    commonUse: 'Reliability engineering, epidemiology, marketing campaigns',
    pdf: (k, r, p) => {
      if (!Number.isInteger(k) || k < r || r < 1 || p <= 0 || p > 1) return 0;
      
      // P(X = k) = C(k-1, r-1) * p^r * (1-p)^(k-r)
      // Binomial coefficient C(k-1, r-1)
      let coeff = 1;
      for (let i = 0; i < r - 1; i++) {
        coeff = coeff * (k - 1 - i) / (i + 1);
      }
      
      return coeff * Math.pow(p, r) * Math.pow(1 - p, k - r);
    },
    rangeCalculator: (params) => {
      const r = params.r || 5;
      const p = params.p || 0.3;
      // Expected value is r/p, show range around that
      const mean = r / p;
      const max = Math.max(r + 10, Math.ceil(mean + 4 * Math.sqrt(mean * (1 - p) / p)));
      return { min: r, max };
    }
  },

  // Additional PyMC Discrete Distributions
  bernoulli: {
    name: 'bernoulli',
    displayName: 'Bernoulli',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'p', 
        displayName: 'Success Probability (p)', 
        type: 'number', 
        default: 0.5, 
        min: 0, 
        max: 1, 
        step: 0.01,
        sliderRange: { min: 0, max: 1, step: 0.01 },
        description: 'Probability of success (outcome = 1)' 
      }
    ],
    description: 'The Bernoulli distribution models a single trial with two possible outcomes (success/failure).',
    category: 'Discrete',
    commonUse: 'Binary outcomes, coin flips, yes/no questions, A/B testing',
    pdf: (x, p) => {
      if (x !== 0 && x !== 1) return 0;
      if (p < 0 || p > 1) return 0;
      return x === 1 ? p : (1 - p);
    },
    rangeCalculator: () => {
      return { min: 0, max: 1 };
    }
  },

  discreteUniform: {
    name: 'discreteUniform',
    displayName: 'Discrete Uniform',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'lower', 
        displayName: 'Lower Bound (a)', 
        type: 'number', 
        default: 1, 
        min: -Infinity, 
        max: Infinity, 
        step: 1,
        sliderRange: { min: 0, max: 10, step: 1 },
        description: 'Lower bound (inclusive)' 
      },
      { 
        name: 'upper', 
        displayName: 'Upper Bound (b)', 
        type: 'number', 
        default: 6, 
        min: -Infinity, 
        max: Infinity, 
        step: 1,
        sliderRange: { min: 1, max: 20, step: 1 },
        description: 'Upper bound (inclusive)' 
      }
    ],
    description: 'The discrete uniform distribution assigns equal probability to each integer in a range.',
    category: 'Discrete',
    commonUse: 'Dice rolls, random sampling, uniform random integers',
    pdf: (x, lower, upper) => {
      if (!Number.isInteger(x) || x < lower || x > upper || lower > upper) return 0;
      return 1 / (upper - lower + 1);
    },
    rangeCalculator: (params) => {
      const lower = params.lower || 1;
      const upper = params.upper || 6;
      return { min: lower, max: upper };
    }
  },

  hypergeometric: {
    name: 'hypergeometric',
    displayName: 'Hypergeometric',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'N', 
        displayName: 'Population Size (N)', 
        type: 'number', 
        default: 50, 
        min: 1, 
        max: Infinity, 
        step: 1,
        sliderRange: { min: 10, max: 100, step: 1 },
        description: 'Total population size' 
      },
      { 
        name: 'K', 
        displayName: 'Success States (K)', 
        type: 'number', 
        default: 20, 
        min: 0, 
        max: Infinity, 
        step: 1,
        sliderRange: { min: 1, max: 50, step: 1 },
        description: 'Number of success states in population' 
      },
      { 
        name: 'n', 
        displayName: 'Sample Size (n)', 
        type: 'number', 
        default: 10, 
        min: 1, 
        max: Infinity, 
        step: 1,
        sliderRange: { min: 1, max: 30, step: 1 },
        description: 'Number of draws (without replacement)' 
      }
    ],
    description: 'The hypergeometric distribution models sampling without replacement from a finite population.',
    category: 'Discrete',
    commonUse: 'Quality control, card games, survey sampling, ecology',
    pdf: (x, N, K, n) => {
      if (!Number.isInteger(x) || x < 0 || x > n || x > K || (n - x) > (N - K)) return 0;
      if (N < K || N < n || K < 0 || n < 0) return 0;
      
      // PMF: C(K,x) * C(N-K,n-x) / C(N,n)
      const logCombK = logFactorial(K) - logFactorial(x) - logFactorial(K - x);
      const logCombNK = logFactorial(N - K) - logFactorial(n - x) - logFactorial(N - K - n + x);
      const logCombN = logFactorial(N) - logFactorial(n) - logFactorial(N - n);
      
      return Math.exp(logCombK + logCombNK - logCombN);
    },
    rangeCalculator: (params) => {
      const N = params.N || 50;
      const K = params.K || 20;
      const n = params.n || 10;
      const min = Math.max(0, n - (N - K));
      const max = Math.min(n, K);
      return { min, max };
    }
  },

  betaBinomial: {
    name: 'betaBinomial',
    displayName: 'Beta-Binomial',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'n', 
        displayName: 'Number of Trials (n)', 
        type: 'number', 
        default: 10, 
        min: 1, 
        max: Infinity, 
        step: 1,
        sliderRange: { min: 1, max: 50, step: 1 },
        description: 'Number of trials' 
      },
      { 
        name: 'alpha', 
        displayName: 'Alpha (α)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 10, step: 0.1 },
        description: 'Shape parameter alpha' 
      },
      { 
        name: 'beta', 
        displayName: 'Beta (β)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 10, step: 0.1 },
        description: 'Shape parameter beta' 
      }
    ],
    description: 'The beta-binomial distribution models overdispersed binomial data with beta-distributed success probability.',
    category: 'Discrete',
    commonUse: 'Overdispersed count data, ecological studies, quality control',
    pdf: (x, n, alpha, beta_param) => {
      if (!Number.isInteger(x) || x < 0 || x > n || alpha <= 0 || beta_param <= 0) return 0;
      
      // PMF: C(n,x) * B(x+α, n-x+β) / B(α,β)
      // Using correct log-gamma implementation
      const logBinomCoeff = logFactorial(n) - logFactorial(x) - logFactorial(n - x);
      
      // Correct beta ratio: ln[B(x+α, n-x+β) / B(α,β)]
      // = ln[Γ(x+α)Γ(n-x+β)/Γ(n+α+β)] - ln[Γ(α)Γ(β)/Γ(α+β)]
      // = [lnΓ(x+α) + lnΓ(n-x+β) - lnΓ(n+α+β)] + [lnΓ(α+β) - lnΓ(α) - lnΓ(β)]
      const logBetaRatio = (logGamma(x + alpha) + logGamma(n - x + beta_param) - logGamma(n + alpha + beta_param)) +
                           (logGamma(alpha + beta_param) - logGamma(alpha) - logGamma(beta_param));
      
      return Math.exp(logBinomCoeff + logBetaRatio);
    },
    rangeCalculator: (params) => {
      const n = params.n || 10;
      return { min: 0, max: n };
    }
  },

  discreteWeibull: {
    name: 'discreteWeibull',
    displayName: 'Discrete Weibull',
    type: 'discrete',
    plotType: 'bar',
    parameters: [
      { 
        name: 'q', 
        displayName: 'Scale (q)', 
        type: 'number', 
        default: 0.5, 
        min: 0.001, 
        max: 0.999, 
        step: 0.01,
        sliderRange: { min: 0.1, max: 0.9, step: 0.01 },
        description: 'Scale parameter (0 < q < 1)' 
      },
      { 
        name: 'beta', 
        displayName: 'Shape (β)', 
        type: 'number', 
        default: 1, 
        min: 0.1, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Shape parameter' 
      }
    ],
    description: 'The discrete Weibull distribution is the discrete analog of the continuous Weibull distribution.',
    category: 'Discrete',
    commonUse: 'Reliability analysis, survival times, discrete failure data',
    pdf: (x, q, beta_param) => {
      if (!Number.isInteger(x) || x < 0 || q <= 0 || q >= 1 || beta_param <= 0) return 0;
      
      // PMF: q^(x^β) - q^((x+1)^β)
      const x_beta = Math.pow(x, beta_param);
      const x1_beta = Math.pow(x + 1, beta_param);
      
      // Handle edge cases to prevent numerical issues
      if (x_beta > 700 || x1_beta > 700) return 0; // Prevent overflow
      
      const qx = Math.pow(q, x_beta);
      const qx1 = Math.pow(q, x1_beta);
      
      const result = qx - qx1;
      return isFinite(result) && result >= 0 ? result : 0;
    },
    rangeCalculator: (params) => {
      const q = params.q || 0.5;
      const beta_param = params.beta || 1;
      
      // For discrete Weibull, most mass is concentrated at small values
      let maxX = 10;
      
      // Try to find a reasonable upper bound
      try {
        // Find where PMF becomes very small
        for (let x = 1; x <= 50; x++) {
          const x_beta = Math.pow(x, beta_param);
          if (x_beta * Math.log(q) < -10) { // Very small probability
            maxX = x;
            break;
          }
        }
      } catch (e) {
        maxX = 10; // Fallback
      }
      
      return { min: 0, max: Math.min(maxX, 30) };
    }
  },

  // Additional PyMC Continuous Distributions
  cauchy: {
    name: 'cauchy',
    displayName: 'Cauchy',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'x0', 
        displayName: 'Location (x₀)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Location parameter (median)' 
      },
      { 
        name: 'gamma', 
        displayName: 'Scale (γ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter (half-width at half-maximum)' 
      }
    ],
    description: 'The Cauchy distribution has heavy tails and undefined mean/variance. Used in physics and robust statistics.',
    category: 'Continuous',
    commonUse: 'Robust statistics, physics (Lorentzian profile), Bayesian priors',
    pdf: (x, x0, gamma) => {
      if (gamma <= 0) return 0;
      const z = (x - x0) / gamma;
      return 1 / (Math.PI * gamma * (1 + z * z));
    },
    rangeCalculator: (params) => {
      const x0 = params.x0 || 0;
      const gamma = params.gamma || 1;
      return { min: x0 - 10 * gamma, max: x0 + 10 * gamma };
    }
  },

  laplace: {
    name: 'laplace',
    displayName: 'Laplace',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Location (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Location parameter (median)' 
      },
      { 
        name: 'b', 
        displayName: 'Scale (b)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter (diversity)' 
      }
    ],
    description: 'The Laplace distribution is symmetric with exponential tails. Also known as the double exponential distribution.',
    category: 'Continuous',
    commonUse: 'Signal processing, machine learning (L1 regularization), robust statistics',
    pdf: (x, mu, b) => {
      if (b <= 0) return 0;
      return (1 / (2 * b)) * Math.exp(-Math.abs(x - mu) / b);
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const b = params.b || 1;
      return { min: mu - 6 * b, max: mu + 6 * b };
    }
  },

  logistic: {
    name: 'logistic',
    displayName: 'Logistic',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Location (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Location parameter (median)' 
      },
      { 
        name: 's', 
        displayName: 'Scale (s)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      }
    ],
    description: 'The logistic distribution resembles the normal distribution but has heavier tails.',
    category: 'Continuous',
    commonUse: 'Logistic regression, growth modeling, neural networks',
    pdf: (x, mu, s) => {
      if (s <= 0) return 0;
      const z = -(x - mu) / s;
      const exp_z = Math.exp(z);
      return exp_z / (s * Math.pow(1 + exp_z, 2));
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const s = params.s || 1;
      return { min: mu - 6 * s, max: mu + 6 * s };
    }
  },

  gumbel: {
    name: 'gumbel',
    displayName: 'Gumbel',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Location (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Location parameter' 
      },
      { 
        name: 'beta', 
        displayName: 'Scale (β)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      }
    ],
    description: 'The Gumbel distribution is used to model the distribution of maximum values in samples.',
    category: 'Continuous',
    commonUse: 'Extreme value theory, modeling maximum/minimum values, reliability analysis',
    pdf: (x, mu, beta) => {
      if (beta <= 0) return 0;
      const z = (x - mu) / beta;
      return (1 / beta) * Math.exp(-z - Math.exp(-z));
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const beta = params.beta || 1;
      return { min: mu - 3 * beta, max: mu + 8 * beta };
    }
  },

  weibull: {
    name: 'weibull',
    displayName: 'Weibull',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'alpha', 
        displayName: 'Shape (α)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Shape parameter' 
      },
      { 
        name: 'beta', 
        displayName: 'Scale (β)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      }
    ],
    description: 'The Weibull distribution is widely used in reliability engineering and survival analysis.',
    category: 'Continuous',
    commonUse: 'Reliability engineering, survival analysis, weather modeling, material strength',
    pdf: (x, alpha, beta) => {
      if (alpha <= 0 || beta <= 0 || x < 0) return 0;
      const xb = x / beta;
      return (alpha / beta) * Math.pow(xb, alpha - 1) * Math.exp(-Math.pow(xb, alpha));
    },
    rangeCalculator: (params) => {
      const alpha = params.alpha || 2;
      const beta = params.beta || 1;
      const max = beta * Math.pow(-Math.log(0.001), 1 / alpha);
      return { min: 0, max: Math.min(max, beta * 5) };
    }
  },

  pareto: {
    name: 'pareto',
    displayName: 'Pareto',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'alpha', 
        displayName: 'Shape (α)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Shape parameter (tail index)' 
      },
      { 
        name: 'm', 
        displayName: 'Scale (m)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter (minimum value)' 
      }
    ],
    description: 'The Pareto distribution models the "80-20 rule" and power-law phenomena.',
    category: 'Continuous',
    commonUse: 'Economics (wealth distribution), internet traffic, city populations',
    pdf: (x, alpha, m) => {
      if (alpha <= 0 || m <= 0 || x < m) return 0;
      return alpha * Math.pow(m, alpha) / Math.pow(x, alpha + 1);
    },
    rangeCalculator: (params) => {
      const alpha = params.alpha || 1;
      const m = params.m || 1;
      const max = m * Math.pow(1000, 1 / alpha);
      return { min: m, max: Math.min(max, m * 10) };
    }
  },

  halfNormal: {
    name: 'halfNormal',
    displayName: 'Half-Normal',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'sigma', 
        displayName: 'Scale (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      }
    ],
    description: 'The half-normal distribution is the positive half of a normal distribution.',
    category: 'Continuous',
    commonUse: 'Bayesian priors for variance parameters, positive-valued modeling',
    pdf: (x, sigma) => {
      if (sigma <= 0 || x < 0) return 0;
      return Math.sqrt(2 / (Math.PI * sigma * sigma)) * Math.exp(-(x * x) / (2 * sigma * sigma));
    },
    rangeCalculator: (params) => {
      const sigma = params.sigma || 1;
      return { min: 0, max: 4 * sigma };
    }
  },

  halfCauchy: {
    name: 'halfCauchy',
    displayName: 'Half-Cauchy',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'beta', 
        displayName: 'Scale (β)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      }
    ],
    description: 'The half-Cauchy distribution is commonly used as a prior for scale parameters in Bayesian models.',
    category: 'Continuous',
    commonUse: 'Bayesian priors for scale/variance parameters, hierarchical modeling',
    pdf: (x, beta) => {
      if (beta <= 0 || x < 0) return 0;
      const z = x / beta;
      return 2 / (Math.PI * beta * (1 + z * z));
    },
    rangeCalculator: (params) => {
      const beta = params.beta || 1;
      return { min: 0, max: 10 * beta };
    }
  },

  inverseGamma: {
    name: 'inverseGamma',
    displayName: 'Inverse Gamma',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'alpha', 
        displayName: 'Shape (α)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Shape parameter' 
      },
      { 
        name: 'beta', 
        displayName: 'Scale (β)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      }
    ],
    description: 'The inverse gamma distribution is commonly used as a prior for variance parameters.',
    category: 'Continuous',
    commonUse: 'Bayesian priors for variance parameters, scale modeling',
    pdf: (x, alpha, beta) => {
      if (alpha <= 0 || beta <= 0 || x <= 0) return 0;
      return Math.pow(beta, alpha) / gamma(alpha) * Math.pow(x, -alpha - 1) * Math.exp(-beta / x);
    },
    rangeCalculator: (params) => {
      const alpha = params.alpha || 2;
      const beta = params.beta || 1;
      const mean = alpha > 1 ? beta / (alpha - 1) : beta;
      return { min: 0.001, max: mean * 5 };
    }
  },

  triangular: {
    name: 'triangular',
    displayName: 'Triangular',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'lower', 
        displayName: 'Lower (a)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -2, max: 2, step: 0.1 },
        description: 'Lower bound' 
      },
      { 
        name: 'c', 
        displayName: 'Mode (c)', 
        type: 'number', 
        default: 0.5, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -1, max: 3, step: 0.1 },
        description: 'Mode (peak location)' 
      },
      { 
        name: 'upper', 
        displayName: 'Upper (b)', 
        type: 'number', 
        default: 1, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0, max: 4, step: 0.1 },
        description: 'Upper bound' 
      }
    ],
    description: 'The triangular distribution is often used when limited sample data is available.',
    category: 'Continuous',
    commonUse: 'Project management, risk analysis, when limited data is available',
    pdf: (x, lower, c, upper) => {
      if (lower >= c || c >= upper || x < lower || x > upper) return 0;
      if (x < c) {
        return 2 * (x - lower) / ((upper - lower) * (c - lower));
      } else if (x === c) {
        return 2 / (upper - lower);
      } else {
        return 2 * (upper - x) / ((upper - lower) * (upper - c));
      }
    },
    rangeCalculator: (params) => {
      const lower = params.lower || 0;
      const upper = params.upper || 1;
      const padding = (upper - lower) * 0.1;
      return { min: lower - padding, max: upper + padding };
    }
  },

  kumaraswamy: {
    name: 'kumaraswamy',
    displayName: 'Kumaraswamy',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'a', 
        displayName: 'Shape (a)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'First shape parameter' 
      },
      { 
        name: 'b', 
        displayName: 'Shape (b)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Second shape parameter' 
      }
    ],
    description: 'The Kumaraswamy distribution is similar to Beta but with simpler CDF and quantile functions.',
    category: 'Continuous',
    commonUse: 'Alternative to Beta distribution, hydrology, economics',
    pdf: (x, a, b) => {
      if (a <= 0 || b <= 0 || x < 0 || x > 1) return 0;
      return a * b * Math.pow(x, a - 1) * Math.pow(1 - Math.pow(x, a), b - 1);
    },
    rangeCalculator: () => {
      return { min: 0, max: 1 };
    }
  },

  // More PyMC Continuous Distributions
  asymmetricLaplace: {
    name: 'asymmetricLaplace',
    displayName: 'Asymmetric Laplace',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Location (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Location parameter' 
      },
      { 
        name: 'b', 
        displayName: 'Scale (b)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      },
      { 
        name: 'kappa', 
        displayName: 'Asymmetry (κ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Asymmetry parameter' 
      }
    ],
    description: 'The asymmetric Laplace distribution allows for different rates of exponential decay on either side.',
    category: 'Continuous',
    commonUse: 'Quantile regression, asymmetric loss functions, financial modeling',
    pdf: (x, mu, b, kappa) => {
      if (b <= 0 || kappa <= 0) return 0;
      const sign = x >= mu ? 1 : -1;
      const kappaSign = sign > 0 ? kappa : 1/kappa;
      // Correct normalization constant: κ / (b(1 + κ²))
      const normalization = kappa / (b * (1 + kappa * kappa));
      return normalization * Math.exp(-Math.abs(x - mu) * kappaSign / b);
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const b = params.b || 1;
      const kappa = params.kappa || 1;
      const leftScale = b / kappa;
      const rightScale = b * kappa;
      return { min: mu - 6 * leftScale, max: mu + 6 * rightScale };
    }
  },

  skewNormal: {
    name: 'skewNormal',
    displayName: 'Skew Normal',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Location (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Location parameter' 
      },
      { 
        name: 'sigma', 
        displayName: 'Scale (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      },
      { 
        name: 'alpha', 
        displayName: 'Shape (α)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Skewness parameter' 
      }
    ],
    description: 'The skew normal distribution extends the normal distribution to allow for non-zero skewness.',
    category: 'Continuous',
    commonUse: 'Modeling asymmetric data, finance, natural phenomena with skew',
    pdf: (x, mu, sigma, alpha) => {
      if (sigma <= 0) return 0;
      const z = (x - mu) / sigma;
      const phi = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
      const Phi_t = normalCDF(alpha * z);
      return (2 / sigma) * phi * Phi_t;
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const sigma = params.sigma || 1;
      const alpha = params.alpha || 0;
      const extension = Math.abs(alpha) > 2 ? 1.5 : 1;
      return { min: mu - 4 * sigma * extension, max: mu + 4 * sigma * extension };
    }
  },

  halfStudentT: {
    name: 'halfStudentT',
    displayName: 'Half Student-t',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'nu', 
        displayName: 'Degrees of Freedom (ν)', 
        type: 'number', 
        default: 2, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.5, max: 10, step: 0.5 },
        description: 'Degrees of freedom' 
      },
      { 
        name: 'sigma', 
        displayName: 'Scale (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      }
    ],
    description: 'The half Student-t distribution is the positive half of a Student-t distribution.',
    category: 'Continuous',
    commonUse: 'Bayesian priors for scale parameters with heavy tails',
    pdf: (x, nu, sigma) => {
      if (nu <= 0 || sigma <= 0 || x < 0) return 0;
      const t = x / sigma;
      const gammaRatio = gamma((nu + 1) / 2) / gamma(nu / 2);
      return (2 * gammaRatio) / (Math.sqrt(nu * Math.PI) * sigma) * Math.pow(1 + t*t/nu, -(nu + 1)/2);
    },
    rangeCalculator: (params) => {
      const nu = params.nu || 2;
      const sigma = params.sigma || 1;
      const scale = nu > 2 ? Math.sqrt(nu/(nu-2)) : 2;
      return { min: 0, max: 5 * sigma * scale };
    }
  },

  logitNormal: {
    name: 'logitNormal',
    displayName: 'Logit Normal',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Location (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -3, max: 3, step: 0.1 },
        description: 'Location parameter of logit' 
      },
      { 
        name: 'tau', 
        displayName: 'Precision (τ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Precision parameter' 
      }
    ],
    description: 'The logit-normal distribution models variables on (0,1) using the logit transformation of a normal distribution.',
    category: 'Continuous',
    commonUse: 'Modeling proportions, probabilities, rates on (0,1)',
    pdf: (x, mu, tau) => {
      if (tau <= 0 || x <= 0 || x >= 1) return 0;
      const logit_x = Math.log(x / (1 - x));
      const norm_factor = 1 / (x * (1 - x)) * Math.sqrt(tau / (2 * Math.PI));
      return norm_factor * Math.exp(-tau/2 * Math.pow(logit_x - mu, 2));
    },
    rangeCalculator: () => {
      return { min: 0.001, max: 0.999 };
    }
  },

  wald: {
    name: 'wald',
    displayName: 'Wald (Inverse Gaussian)',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Mean (μ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Mean parameter' 
      },
      { 
        name: 'lam', 
        displayName: 'Shape (λ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Shape parameter' 
      }
    ],
    description: 'The Wald (inverse Gaussian) distribution is used to model positive random variables.',
    category: 'Continuous',
    commonUse: 'Modeling first passage times, degradation processes, reliability',
    pdf: (x, mu, lam) => {
      if (mu <= 0 || lam <= 0 || x <= 0) return 0;
      const sqrt_term = Math.sqrt(lam / (2 * Math.PI * x * x * x));
      const exp_term = Math.exp(-lam * Math.pow(x - mu, 2) / (2 * mu * mu * x));
      return sqrt_term * exp_term;
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 1;
      const lam = params.lam || 1;
      const cv = Math.sqrt(mu / lam);
      return { min: 0.001, max: mu + 4 * mu * cv };
    }
  },

  moyal: {
    name: 'moyal',
    displayName: 'Moyal',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Location (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 5, step: 0.1 },
        description: 'Location parameter' 
      },
      { 
        name: 'sigma', 
        displayName: 'Scale (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Scale parameter' 
      }
    ],
    description: 'The Moyal distribution describes energy loss of fast charged particles through matter.',
    category: 'Continuous',
    commonUse: 'Particle physics, energy loss distributions, radiation detection',
    pdf: (x, mu, sigma) => {
      if (sigma <= 0) return 0;
      const z = (x - mu) / sigma;
      return (1 / (Math.sqrt(2 * Math.PI) * sigma)) * Math.exp(-0.5 * (z + Math.exp(-z)));
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const sigma = params.sigma || 1;
      return { min: mu - 3 * sigma, max: mu + 10 * sigma };
    }
  },

  // Advanced PyMC Distributions requiring special functions
  exGaussian: {
    name: 'exGaussian',
    displayName: 'Ex-Gaussian',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Mean (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -2, max: 2, step: 0.1 },
        description: 'Mean of Gaussian component' 
      },
      { 
        name: 'sigma', 
        displayName: 'Sigma (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Standard deviation of Gaussian component' 
      },
      { 
        name: 'lam', 
        displayName: 'Rate (λ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Rate of exponential component' 
      }
    ],
    description: 'The ex-Gaussian distribution is a convolution of normal and exponential distributions.',
    category: 'Continuous',
    commonUse: 'Psychology (reaction times), neuroscience, reliability analysis',
    pdf: (x, mu, sigma, lam) => {
      if (sigma <= 0 || lam <= 0) return 0;
      const exp_part = lam/2 * Math.exp(lam/2 * (2*mu + lam*sigma*sigma - 2*x));
      // Accurate complementary error function using Abramowitz & Stegun approximation
      const u = (mu + lam*sigma*sigma - x) / (Math.sqrt(2) * sigma);
      return exp_part * erfc(u);
    },
    rangeCalculator: (params) => {
      const mu = params.mu || 0;
      const sigma = params.sigma || 1;
      const lam = params.lam || 1;
      return { min: mu - 3*sigma, max: mu + 4*sigma + 3/lam };
    }
  },

  vonMises: {
    name: 'vonMises',
    displayName: 'Von Mises',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Direction (μ)', 
        type: 'number', 
        default: 0, 
        min: -Math.PI, 
        max: Math.PI, 
        step: 0.1,
        sliderRange: { min: -Math.PI, max: Math.PI, step: 0.1 },
        description: 'Mean direction' 
      },
      { 
        name: 'kappa', 
        displayName: 'Concentration (κ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 5, step: 0.1 },
        description: 'Concentration parameter' 
      }
    ],
    description: 'The von Mises distribution is the circular analog of the normal distribution.',
    category: 'Continuous',
    commonUse: 'Directional statistics, wind directions, biological rhythms',
    pdf: (x, mu, kappa) => {
      if (kappa <= 0 || x < -Math.PI || x > Math.PI) return 0;
      return Math.exp(kappa * Math.cos(x - mu)) / (2 * Math.PI * besselI0(kappa));
    },
    rangeCalculator: () => {
      return { min: -Math.PI, max: Math.PI };
    }
  },

  rice: {
    name: 'rice',
    displayName: 'Rice (Rician)',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'nu', 
        displayName: 'Signal (ν)', 
        type: 'number', 
        default: 1, 
        min: 0, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0, max: 3, step: 0.1 },
        description: 'Signal parameter' 
      },
      { 
        name: 'sigma', 
        displayName: 'Noise (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Noise parameter' 
      }
    ],
    description: 'The Rice distribution describes the magnitude of a complex normal random variable.',
    category: 'Continuous',
    commonUse: 'Signal processing, MRI imaging, radar, communications',
    pdf: (x, nu, sigma) => {
      if (sigma <= 0 || nu < 0 || x < 0) return 0;
      const sigma2 = sigma * sigma;
      const z = x * nu / sigma2;
      return (x / sigma2) * Math.exp(-(x*x + nu*nu) / (2*sigma2)) * besselI0(z);
    },
    rangeCalculator: (params) => {
      const nu = params.nu || 1;
      const sigma = params.sigma || 1;
      const mean = sigma * Math.sqrt(Math.PI/2) * Math.exp(-nu*nu/(4*sigma*sigma));
      return { min: 0, max: Math.max(nu + 4*sigma, mean + 4*sigma) };
    }
  },

  truncatedNormal: {
    name: 'truncatedNormal',
    displayName: 'Truncated Normal',
    type: 'continuous',
    plotType: 'line',
    parameters: [
      { 
        name: 'mu', 
        displayName: 'Mean (μ)', 
        type: 'number', 
        default: 0, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -3, max: 3, step: 0.1 },
        description: 'Mean of underlying normal' 
      },
      { 
        name: 'sigma', 
        displayName: 'Sigma (σ)', 
        type: 'number', 
        default: 1, 
        min: 0.001, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0.1, max: 3, step: 0.1 },
        description: 'Standard deviation of underlying normal' 
      },
      { 
        name: 'lower', 
        displayName: 'Lower (a)', 
        type: 'number', 
        default: -2, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: -5, max: 0, step: 0.1 },
        description: 'Lower truncation point' 
      },
      { 
        name: 'upper', 
        displayName: 'Upper (b)', 
        type: 'number', 
        default: 2, 
        min: -Infinity, 
        max: Infinity, 
        step: 0.1,
        sliderRange: { min: 0, max: 5, step: 0.1 },
        description: 'Upper truncation point' 
      }
    ],
    description: 'The truncated normal distribution is a normal distribution restricted to an interval.',
    category: 'Continuous',
    commonUse: 'Constrained optimization, bounded variables, quality control',
    pdf: (x, mu, sigma, lower, upper) => {
      if (sigma <= 0 || x < lower || x > upper || lower >= upper) return 0;
      const z = (x - mu) / sigma;
      const phi = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
      const alpha = (lower - mu) / sigma;
      const beta = (upper - mu) / sigma;
      const Z = normalCDF(beta) - normalCDF(alpha);
      return phi / (sigma * Z);
    },
    rangeCalculator: (params) => {
      const lower = params.lower || -2;
      const upper = params.upper || 2;
      const padding = (upper - lower) * 0.05;
      return { min: lower - padding, max: upper + padding };
    }
  }
};

/**
 * Distribution categories for grouping
 */
export const distributionCategories = {
  'Continuous': ['normal', 'beta', 'gamma', 'exponential', 'uniform', 'lognormal', 'chi2', 'student', 'cauchy', 'laplace', 'logistic', 'gumbel', 'weibull', 'pareto', 'halfNormal', 'halfCauchy', 'inverseGamma', 'triangular', 'kumaraswamy', 'asymmetricLaplace', 'skewNormal', 'halfStudentT', 'logitNormal', 'wald', 'moyal', 'exGaussian', 'vonMises', 'rice', 'truncatedNormal'],
  'Discrete': ['binomial', 'poisson', 'geometric', 'negativeBinomial', 'bernoulli', 'discreteUniform', 'hypergeometric', 'betaBinomial', 'discreteWeibull']
};

// Legacy exports for backward compatibility with existing tests
export const pdfFunctions = Object.fromEntries(
  Object.entries(distributions).map(([name, dist]) => [name, dist.pdf])
);

export const rangeCalculators = Object.fromEntries(
  Object.entries(distributions).map(([name, dist]) => [name, dist.rangeCalculator])
);