import type { CauchyStep } from "../cauchy";

/** Lab 7a. Euler's method: yᵢ = yᵢ₋₁ + h·f(xᵢ₋₁, yᵢ₋₁). */
export const euler: CauchyStep = (f, x, y, h) => y + h * f(x, y);

/**
 * Lab 7b. Modified Euler (midpoint): K = f(xᵢ₋₁, yᵢ₋₁), U = f(xᵢ₋₁ + h/2, yᵢ₋₁ + (h/2)K),
 * yᵢ = yᵢ₋₁ + h·U.
 */
export const modifiedEuler: CauchyStep = (f, x, y, h) => {
  const K = f(x, y);
  const U = f(x + h / 2, y + (h / 2) * K);
  return y + h * U;
};

/**
 * Lab 7c. Euler–Heun: K₁ = f(xᵢ₋₁, yᵢ₋₁), K₂ = f(xᵢ₋₁ + h, yᵢ₋₁ + h·K₁),
 * yᵢ = yᵢ₋₁ + (h/2)(K₁ + K₂).
 */
export const eulerHeun: CauchyStep = (f, x, y, h) => {
  const K1 = f(x, y);
  const K2 = f(x + h, y + h * K1);
  return y + (h / 2) * (K1 + K2);
};
