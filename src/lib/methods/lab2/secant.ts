import { scalarIterate } from "../scalar-iterate";
import { MethodStepError, type ScalarRunResult } from "../types";

export interface SecantInput {
  f: (x: number) => number;
  x0: number;
  x1: number;
  eps: number;
  maxIter: number;
}

/**
 * Lab 2a. Secant method: xₙ₊₁ = xₙ − f(xₙ)(xₙ − xₙ₋₁) / (f(xₙ) − f(xₙ₋₁)).
 * x₀ and x₁ are both given, so the loop starts at n = 1. f(xₙ) = 0 means xₙ is the root, so
 * xₙ₊₁ = xₙ; otherwise f(xₙ) = f(xₙ₋₁) stops the run with `zero-denominator`.
 */
export function secant({ f, x0, x1, eps, maxIter }: SecantInput): ScalarRunResult {
  const result = scalarIterate({
    x0,
    x1,
    f,
    eps,
    maxIter,
    twoPointStep: (x, prev) => {
      const fx = f(x);
      if (fx === 0) return x;
      const denominator = fx - f(prev);
      if (denominator === 0) throw new MethodStepError("zero-denominator");
      return x - (fx * (x - prev)) / denominator;
    },
  });
  // The driver only meets f(x₀) inside the step from x₁, so it would blame x₁. When x₁ is fine and
  // x₀ is outside f's domain, point the user at x₀ instead.
  const [start, given] = result.iterations;
  if (result.error?.n === 1 && start.fx === null && given.fx !== null) {
    return { ...result, error: { ...result.error, n: 0, x: start.x } };
  }
  return result;
}
