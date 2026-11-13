import { EvaluationError } from "@/lib/expressions/compile";
import {
  DIVERGENCE_LIMIT,
  MethodStepError,
  type MethodErrorCode,
  type ScalarIterationRow,
  type ScalarRunResult,
} from "./types";

export interface ScalarIterateInput {
  x0: number;
  /** One step of the method: xₙ ↦ xₙ₊₁. May throw {@link MethodStepError} or {@link EvaluationError}. */
  step: (x: number) => number;
  /** f for the f(xₙ) column. Omit when the method has no f. */
  f?: (x: number) => number;
  /** Tolerance ε > 0. */
  eps: number;
  /** Maximum number of iterations (≥ 1). */
  maxIter: number;
}

/**
 * Shared driver for scalar iterative methods: x₁ first, then repeat while |xₙ − xₙ₋₁| ≥ ε.
 * A NaN, ±∞ or |xₙ| > 1e100 stops the run with an error; the rows so far are kept.
 */
export function scalarIterate({ x0, step, f, eps, maxIter }: ScalarIterateInput): ScalarRunResult {
  const value = (x: number): number | null => {
    if (!f) return null;
    try {
      const fx = f(x);
      return Number.isFinite(fx) ? fx : null;
    } catch (error) {
      // f undefined at xₙ just leaves the f(xₙ) cell empty; any other error is a bug and surfaces,
      // exactly as it does when it comes from a step.
      if (error instanceof EvaluationError) return null;
      throw error;
    }
  };

  const rows: ScalarIterationRow[] = [{ n: 0, x: x0, fx: value(x0), diff: null }];

  const fail = (code: MethodErrorCode, n: number, x: number): ScalarRunResult => ({
    status: "error",
    result: null,
    n: rows[rows.length - 1].n,
    iterations: rows,
    error: { code, n, x },
  });

  /** Appends the next row. Returns an error result if the step fails or diverges, otherwise null. */
  const advance = (): ScalarRunResult | null => {
    const last = rows[rows.length - 1];
    let next: number;
    try {
      next = step(last.x);
    } catch (error) {
      if (error instanceof MethodStepError || error instanceof EvaluationError) {
        return fail(error.code, last.n, last.x);
      }
      throw error;
    }
    if (Number.isNaN(next)) return fail("undefined-value", last.n, last.x);
    if (!Number.isFinite(next)) return fail("overflow", last.n, last.x);
    const row: ScalarIterationRow = {
      n: last.n + 1,
      x: next,
      fx: value(next),
      diff: Math.abs(next - last.x),
    };
    rows.push(row);
    if (Math.abs(next) > DIVERGENCE_LIMIT) return fail("diverged", row.n, row.x);
    return null;
  };

  // The lab computes x₁ before the loop, so every run takes at least one step even when
  // x₀ is already a root. The expected iteration counts depend on it.
  const first = advance();
  if (first) return first;

  while ((rows[rows.length - 1].diff ?? 0) >= eps) {
    if (rows[rows.length - 1].n >= maxIter) {
      const last = rows[rows.length - 1];
      return { status: "max-iterations", result: last.x, n: last.n, iterations: rows };
    }
    const failed = advance();
    if (failed) return failed;
  }

  const last = rows[rows.length - 1];
  return { status: "converged", result: last.x, n: last.n, iterations: rows };
}
