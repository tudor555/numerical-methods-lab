import { startByRuleR0 } from "../starting-value";
import { scalarIterate } from "../scalar-iterate";
import { MethodStepError, type ScalarRunResult } from "../types";

/** How x₀ is chosen: rule R0 on [a, b] with f″(a) from ddf, or entered directly. */
export type HalleyStart = { mode: "r0" } | { mode: "manual"; x0: number };

export interface HalleyInput {
  f: (x: number) => number;
  df: (x: number) => number;
  ddf: (x: number) => number;
  a: number;
  b: number;
  start: HalleyStart;
  eps: number;
  maxIter: number;
}

export interface HalleyResult extends ScalarRunResult {
  /** Which end of [a, b] rule R0 picked; undefined for a manual x₀. */
  x0Rule?: "a" | "b";
}

/**
 * Lab 3a. Halley's method: xₙ₊₁ = xₙ − 2f(xₙ)f′(xₙ) / (2f′(xₙ)² − f(xₙ)f″(xₙ)).
 * x₀ comes from rule R0 (with ddf(a)) or is entered directly. f(xₙ) = 0 means xₙ is the root, so
 * xₙ₊₁ = xₙ; otherwise f′(xₙ) = 0 stops the run with `zero-derivative` and a zero denominator with
 * `zero-denominator`.
 */
export function halley({ f, df, ddf, a, b, start, eps, maxIter }: HalleyInput): HalleyResult {
  let x0: number;
  let x0Rule: "a" | "b" | undefined;
  if (start.mode === "r0") {
    const ruleR0 = startByRuleR0(f, a, b, ddf);
    if (!ruleR0.ok) return ruleR0.failure;
    ({ x0, x0Rule } = ruleR0);
  } else {
    x0 = start.x0;
  }

  const result = scalarIterate({
    x0,
    f,
    eps,
    maxIter,
    step: (x) => {
      const fx = f(x);
      if (fx === 0) return x;
      const dfx = df(x);
      // With f′(xₙ) = 0 the numerator vanishes and xₙ₊₁ = xₙ would "converge" at a non-root.
      if (dfx === 0) throw new MethodStepError("zero-derivative");
      const denominator = 2 * dfx * dfx - fx * ddf(x);
      if (denominator === 0) throw new MethodStepError("zero-denominator");
      return x - (2 * fx * dfx) / denominator;
    },
  });
  return x0Rule ? { ...result, x0Rule } : result;
}
