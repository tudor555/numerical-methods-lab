import { EvaluationError } from "@/lib/expressions/compile";
import {
  DIVERGENCE_LIMIT,
  MethodStepError,
  type CauchyErrorCode,
  type CauchyNodeRow,
  type CauchyRunResult,
} from "./types";

/** The right-hand side f(x, y) of y′ = f(x, y). */
export type CauchyFunction = (x: number, y: number) => number;

/**
 * One step of a Cauchy-problem method: from the node (xᵢ₋₁, yᵢ₋₁) with step h to yᵢ. It may
 * throw {@link MethodStepError} or {@link EvaluationError} to stop the run.
 */
export type CauchyStep = (f: CauchyFunction, x: number, y: number, h: number) => number;

/** The Cauchy problem y′ = f(x, y), y(x₀) = y₀ on [x₀, x₀ + T], with n steps. */
export interface CauchyInput {
  f: CauchyFunction;
  x0: number;
  y0: number;
  /** Length of the interval, T > 0. */
  T: number;
  /** Number of steps (≥ 1). */
  n: number;
}

/**
 * Shared node driver for Labs 7–9: h = T/n, xᵢ = x₀ + i·h, and yᵢ from yᵢ₋₁ by `step` for
 * i = 1..n. A NaN, ±∞ or |yᵢ| above 1e100 stops the run with an error; the nodes so far are kept.
 */
export function solveCauchy(input: CauchyInput, step: CauchyStep): CauchyRunResult {
  const { f, x0, y0, T, n } = input;
  const h = T / n;
  // From i, not by adding h n times, so rounding does not build up along the nodes.
  const node = (i: number) => x0 + i * h;
  const rows: CauchyNodeRow[] = [{ i: 0, x: x0, y: y0 }];

  const fail = (code: CauchyErrorCode, at: CauchyNodeRow): CauchyRunResult => ({
    status: "error",
    result: null,
    n,
    h,
    rows,
    error: { code, i: at.i, x: at.x, y: at.y },
  });

  for (let i = 1; i <= n; i++) {
    const from = rows[i - 1];
    let y: number;
    try {
      y = step(f, from.x, from.y, h);
    } catch (error) {
      if (error instanceof MethodStepError || error instanceof EvaluationError) {
        // A Cauchy step only ever throws one of these codes.
        return fail(error.code as CauchyErrorCode, from);
      }
      throw error;
    }
    if (Number.isNaN(y)) return fail("undefined-value", from);
    if (!Number.isFinite(y)) return fail("overflow", from);
    const added = { i, x: node(i), y };
    rows.push(added);
    if (Math.abs(y) > DIVERGENCE_LIMIT) return fail("diverged", added);
  }

  return { status: "completed", result: rows[n].y, n, h, rows };
}
