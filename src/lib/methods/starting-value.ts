import { EvaluationError } from "@/lib/expressions/compile";
import type { ScalarRunResult } from "./types";

/** Rule R0 from the lab: start at x₀ = a if f(a)·f″(a) > 0, otherwise at x₀ = b. */
export function chooseStartingValue(
  fAtA: number,
  secondDerivativeAtA: number,
  a: number,
  b: number,
): number {
  return fAtA * secondDerivativeAtA > 0 ? a : b;
}

/** x₀ from rule R0 and the end it picked, or the finished error run when f(a) is undefined. */
export type RuleR0Start =
  { ok: true; x0: number; x0Rule: "a" | "b" } | { ok: false; failure: ScalarRunResult };

/**
 * Applies rule R0 with f evaluated at a and dda = f″(a). When f(a) is undefined there is no x₀,
 * so the run fails before its first row.
 */
export function startByRuleR0(
  f: (x: number) => number,
  a: number,
  b: number,
  dda: number,
): RuleR0Start {
  let fAtA: number;
  try {
    fAtA = f(a);
  } catch (error) {
    if (error instanceof EvaluationError) {
      return {
        ok: false,
        failure: {
          status: "error",
          result: null,
          n: 0,
          iterations: [],
          error: { code: error.code, n: 0, x: a },
        },
      };
    }
    throw error;
  }
  const x0 = chooseStartingValue(fAtA, dda, a, b);
  return { ok: true, x0, x0Rule: x0 === a ? "a" : "b" };
}
