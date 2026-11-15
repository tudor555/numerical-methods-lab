import { startByRuleR0 } from "../starting-value";
import { scalarIterate } from "../scalar-iterate";
import { MethodStepError, type ScalarRunResult } from "../types";

export interface SteffensenInput {
  f: (x: number) => number;
  a: number;
  b: number;
  /** f″(a), for rule R0. */
  dda: number;
  eps: number;
  maxIter: number;
}

export interface SteffensenResult extends ScalarRunResult {
  /** Which end of [a, b] rule R0 picked; absent when f(a) is undefined. */
  x0Rule?: "a" | "b";
}

/**
 * Lab 2b. Steffensen's method: xₙ₊₁ = xₙ − f(xₙ)² / (f(xₙ + f(xₙ)) − f(xₙ)), with x₀ from rule R0.
 * f(xₙ) = 0 means xₙ is the root, so xₙ₊₁ = xₙ; otherwise a zero denominator stops the run with
 * `zero-denominator`.
 */
export function steffensen({ f, a, b, dda, eps, maxIter }: SteffensenInput): SteffensenResult {
  const start = startByRuleR0(f, a, b, dda);
  if (!start.ok) return start.failure;
  const result = scalarIterate({
    x0: start.x0,
    f,
    eps,
    maxIter,
    step: (x) => {
      const fx = f(x);
      if (fx === 0) return x;
      const denominator = f(x + fx) - fx;
      if (denominator === 0) throw new MethodStepError("zero-denominator");
      return x - (fx * fx) / denominator;
    },
  });
  return { ...result, x0Rule: start.x0Rule };
}
