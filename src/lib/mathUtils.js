// Mathematical helper functions for probability distributions

/**
 * Gamma function using Lanczos approximation
 * @param {number} z - Input value
 * @returns {number} Gamma function value
 */
export const gamma = (z) => {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }
  
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
};

/**
 * Beta function with numerical stability improvements
 * @param {number} a - First parameter
 * @param {number} b - Second parameter
 * @returns {number} Beta function value
 */
export const beta = (a, b) => {
  if (a <= 0 || b <= 0) return NaN;
  
  // For large parameters, use log-space calculation to avoid overflow
  // Check sum a + b to prevent overflow in gamma(a + b)
  if (a > 50 || b > 50 || (a + b) > 50) {
    return Math.exp(logGamma(a) + logGamma(b) - logGamma(a + b));
  }
  
  // For moderate parameters, use direct calculation
  try {
    const result = gamma(a) * gamma(b) / gamma(a + b);
    return isFinite(result) ? result : NaN;
  } catch (error) {
    return NaN;
  }
};

/**
 * Natural logarithm of gamma function (more stable for large values)
 * @param {number} z - Input value
 * @returns {number} Log-gamma value
 */
export const logGamma = (z) => {
  if (z <= 0) return NaN;
  
  // For large z, use Stirling's approximation
  if (z > 50) {
    return (z - 0.5) * Math.log(z) - z + 0.5 * Math.log(2 * Math.PI) + 1/(12*z);
  }
  
  // For moderate z, use the regular gamma function in log space
  try {
    const gammaValue = gamma(z);
    return isFinite(gammaValue) && gammaValue > 0 ? Math.log(gammaValue) : NaN;
  } catch (error) {
    return NaN;
  }
};

/**
 * Natural logarithm with safety check
 * @param {number} x - Input value
 * @returns {number} Natural logarithm
 */
export const safeLog = (x) => {
  return x > 0 ? Math.log(x) : -Infinity;
};

/**
 * Power function with safety checks
 * @param {number} base - Base value
 * @param {number} exponent - Exponent
 * @returns {number} Result of base^exponent
 */
export const safePow = (base, exponent) => {
  if (base === 0 && exponent === 0) return 1;
  if (base < 0 && exponent % 1 !== 0) return NaN;
  return Math.pow(base, exponent);
};

/**
 * Helper function for computing log factorial using log-gamma
 * @param {number} n - Input value (non-negative integer)
 * @returns {number} Natural logarithm of n!
 */
export const logFactorial = (n) => {
  if (n < 0) return -Infinity;
  if (n === 0 || n === 1) return 0;
  return logGamma(n + 1);
};

/**
 * Approximation of modified Bessel function I_0
 * @param {number} z - Input value
 * @returns {number} I_0(z)
 */
export const besselI0 = (z) => {
  const absZ = Math.abs(z);
  if (absZ < 3.75) {
    const t = (absZ / 3.75) ** 2;
    return 1 + t * (3.5156229 + t * (3.0899424 + t * (1.2067492 + 
      t * (0.2659732 + t * (0.0360768 + t * 0.0045813)))));
  } else {
    const t = 3.75 / absZ;
    return Math.exp(absZ) / Math.sqrt(absZ) * (0.39894228 + t * (0.01328592 + 
      t * (0.00225319 + t * (-0.00157565 + t * (0.00916281 + 
      t * (-0.02057706 + t * (0.02635537 + t * (-0.01647633 + t * 0.00392377))))))));
  }
};

/**
 * Standard normal cumulative distribution function using erfc for full precision
 * @param {number} z - Input value
 * @returns {number} Φ(z)
 */
export const normalCDF = (z) => {
  return 0.5 * erfc(-z / Math.SQRT2);
};

/**
 * Complementary error function using Abramowitz & Stegun approximation
 * Maximum error ≲ 1.5 × 10⁻⁷ over ℝ
 * @param {number} u - Input value
 * @returns {number} erfc(u)
 */
export const erfc = (u) => {
  // Constants from Abramowitz & Stegun formula 7.1.26
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  // Save sign and work with |u|
  const sign = (u < 0) ? -1 : 1;
  const z = Math.abs(u);

  // Abramowitz & Stegun approximation for erf(z)
  const t = 1 / (1 + p * z);
  const poly = (((((a5 * t) + a4) * t) + a3) * t + a2) * t + a1;
  const erfZ = 1 - poly * Math.exp(-z * z);

  // erfc(u) = 1 – erf(u) for u ≥ 0; = 1 + erf(−u) for u < 0
  return (sign >= 0) ? (1 - erfZ) : (1 + erfZ);
};