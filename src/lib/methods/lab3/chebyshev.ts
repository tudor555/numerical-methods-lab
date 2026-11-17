import { scalarIterate } from "../scalar-iterate";
import { MethodStepError, type ScalarRunResult } from "../types";

export interface ChebyshevInput {
  f: (x: number) => number;
  df: (x: number) => number;
  ddf: (x: number) => number;
  x0: number;
  eps: number;
  maxIter: number;
}

/**
 * Lab 3b. Chebyshev's method: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ) − f(xₙ)² f″(xₙ) / (2f′(xₙ)³), from a given
 * x₀. f(xₙ) = 0 means xₙ is the root, so xₙ₊₁ = xₙ; otherwise f′(xₙ) = 0 stops the run with
 * `zero-derivative`.
 */
export function chebyshev({ f, df, ddf, x0, eps, maxIter }: ChebyshevInput): ScalarRunResult {
  return scalarIterate({
    x0,
    f,
    eps,
    maxIter,
    step: (x) => {
      const fx = f(x);
      if (fx === 0) return x;
      const dfx = df(x);
      if (dfx === 0) throw new MethodStepError("zero-derivative");
      return x - fx / dfx - (fx * fx * ddf(x)) / (2 * dfx * dfx * dfx);
    },
  });
}
