import { EvaluationError } from "@/lib/expressions/compile";
import { chooseStartingValue } from "../starting-value";
import { scalarIterate } from "../scalar-iterate";
import { MethodStepError, type ScalarRunResult } from "../types";

/** How x₀ is chosen: rule R0 on [a, b] with dda = f″(a), or entered directly. */
export type NewtonStart = { mode: "r0"; dda: number } | { mode: "manual"; x0: number };

export interface NewtonInput {
  f: (x: number) => number;
  df: (x: number) => number;
  a: number;
  b: number;
  start: NewtonStart;
  eps: number;
  maxIter: number;
}

export interface NewtonResult extends ScalarRunResult {
  /** Which end of [a, b] rule R0 picked; undefined for a manual x₀. */
  x0Rule?: "a" | "b";
}

/**
 * Lab 1a. Newton (tangent) method: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ).
 * x₀ comes from rule R0 (x₀ = a if f(a)·f″(a) > 0, else b) or is entered directly.
 * f′(xₙ) = 0 stops the run with `zero-derivative`.
 */
export function newton({ f, df, a, b, start, eps, maxIter }: NewtonInput): NewtonResult {
  let x0: number;
  let x0Rule: "a" | "b" | undefined;
  if (start.mode === "r0") {
    let fAtA: number;
    try {
      fAtA = f(a);
    } catch (error) {
      if (error instanceof EvaluationError) {
        return {
          status: "error",
          result: null,
          n: 0,
          iterations: [],
          error: { code: error.code, n: 0, x: a },
        };
      }
      throw error;
    }
    x0 = chooseStartingValue(fAtA, start.dda, a, b);
    x0Rule = x0 === a ? "a" : "b";
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
      const dfx = df(x);
      if (dfx === 0) throw new MethodStepError("zero-derivative");
      return x - fx / dfx;
    },
  });
  return x0Rule ? { ...result, x0Rule } : result;
}
