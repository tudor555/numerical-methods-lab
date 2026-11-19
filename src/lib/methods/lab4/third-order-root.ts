import { scalarIterate } from "../scalar-iterate";
import type { ScalarRunResult } from "../types";

export interface ThirdOrderRootInput {
  /** Radicand a > 0. */
  a: number;
  eps: number;
  maxIter: number;
}

/**
 * Lab 4b. Square root of a with a third-order iteration: xₙ₊₁ = xₙ(xₙ² + 3a)/(3xₙ² + a), from
 * x₀ = a. The f(xₙ) column shows xₙ² − a.
 */
export function thirdOrderRoot({ a, eps, maxIter }: ThirdOrderRootInput): ScalarRunResult {
  return scalarIterate({
    x0: a,
    eps,
    maxIter,
    f: (x) => x * x - a,
    step: (x) => (x * (x * x + 3 * a)) / (3 * x * x + a),
  });
}
