import { scalarIterate } from "../scalar-iterate";
import { MethodStepError, type ScalarRunResult } from "../types";

export interface KthRootInput {
  /** Radicand c > 0. */
  c: number;
  /** Root order k, an integer ≥ 2. */
  k: number;
  eps: number;
  maxIter: number;
}

/** Starting value for 1b: x₀ = c if c > 1, otherwise x₀ = 1. */
export function kthRootStart(c: number): number {
  return c > 1 ? c : 1;
}

/**
 * Lab 1b. k-th root of c by Newton's method on f(x) = xᵏ − c:
 * xₙ = [(k − 1)·xₙ₋₁ + c / xₙ₋₁ᵏ⁻¹] / k, with x₀ = c if c > 1, otherwise 1.
 */
export function kthRoot({ c, k, eps, maxIter }: KthRootInput): ScalarRunResult {
  return scalarIterate({
    x0: kthRootStart(c),
    eps,
    maxIter,
    f: (x) => x ** k - c,
    step: (x) => {
      const power = x ** (k - 1);
      // xₙ₋₁ᵏ⁻¹ = ±∞ would make c / power vanish and fake convergence.
      if (!Number.isFinite(power)) throw new MethodStepError("overflow");
      if (power === 0) throw new MethodStepError("zero-derivative");
      return ((k - 1) * x + c / power) / k;
    },
  });
}
