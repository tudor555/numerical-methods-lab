import { scalarIterate } from "../scalar-iterate";
import { MethodStepError, type ScalarRunResult } from "../types";

export interface CombinedTangentInput {
  f: (x: number) => number;
  df: (x: number) => number;
  x0: number;
  eps: number;
  maxIter: number;
}

/**
 * Lab 4a. The combined tangent method: a Newton step to yₙ = xₙ − f(xₙ)/f′(xₙ), then a second step
 * from yₙ with the same slope, xₙ₊₁ = yₙ − f(yₙ)/f′(xₙ), from a given x₀. f(xₙ) = 0 means xₙ is the
 * root, so xₙ₊₁ = xₙ; otherwise f′(xₙ) = 0 stops the run with `zero-derivative`. f undefined at yₙ
 * stops it with `undefined-value`.
 */
export function combinedTangent({
  f,
  df,
  x0,
  eps,
  maxIter,
}: CombinedTangentInput): ScalarRunResult {
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
      const y = x - fx / dfx;
      return y - f(y) / dfx;
    },
  });
}
