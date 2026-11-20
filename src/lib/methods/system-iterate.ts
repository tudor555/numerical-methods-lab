import { EvaluationError } from "@/lib/expressions/compile";
import {
  DIVERGENCE_LIMIT,
  MethodStepError,
  type SystemErrorCode,
  type SystemIterationRow,
  type SystemRunResult,
} from "./types";

type Function2 = (x: number, y: number) => number;

/** A step may throw {@link MethodStepError} or {@link EvaluationError} to stop the run. */
export interface SystemIterateInput {
  x0: number;
  y0: number;
  /** F and G for the F(xₙ, yₙ) and G(xₙ, yₙ) columns. */
  F: Function2;
  G: Function2;
  /** Tolerance ε > 0. */
  eps: number;
  /** Maximum number of iterations (≥ 1). */
  maxIter: number;
  /** One step of the method: (xₙ, yₙ) ↦ (xₙ₊₁, yₙ₊₁). (x₁, y₁) is its first step. */
  step: (x: number, y: number) => readonly [number, number];
}

/**
 * Shared driver for 2×2 system methods: (x₁, y₁) first, then repeat while |xₙ − xₙ₋₁| ≥ ε or
 * |yₙ − yₙ₋₁| ≥ ε. A NaN, ±∞ or a component above 1e100 stops the run with an error; the rows so
 * far are kept.
 */
export function systemIterate(input: SystemIterateInput): SystemRunResult {
  const { x0, y0, F, G, eps, maxIter, step } = input;
  const value = (fn: Function2, x: number, y: number): number | null => {
    try {
      const v = fn(x, y);
      return Number.isFinite(v) ? v : null;
    } catch (error) {
      // Undefined at (xₙ, yₙ) leaves the cell empty; any other error is a bug and surfaces.
      if (error instanceof EvaluationError) return null;
      throw error;
    }
  };
  const row = (n: number, x: number, y: number, previous?: SystemIterationRow) => ({
    n,
    x,
    y,
    F: value(F, x, y),
    G: value(G, x, y),
    dx: previous ? Math.abs(x - previous.x) : null,
    dy: previous ? Math.abs(y - previous.y) : null,
  });

  const rows: SystemIterationRow[] = [row(0, x0, y0)];
  const last = () => rows[rows.length - 1];

  const fail = (code: SystemErrorCode, at: SystemIterationRow): SystemRunResult => ({
    status: "error",
    result: null,
    n: last().n,
    iterations: rows,
    error: { code, n: at.n, x: at.x, y: at.y },
  });

  /** Appends the next row. Returns an error result if the step fails or diverges, otherwise null. */
  const advance = (): SystemRunResult | null => {
    const from = last();
    let next: readonly [number, number];
    try {
      next = step(from.x, from.y);
    } catch (error) {
      if (error instanceof MethodStepError || error instanceof EvaluationError) {
        // A system step only ever throws a system code.
        return fail(error.code as SystemErrorCode, from);
      }
      throw error;
    }
    const [x, y] = next;
    if (Number.isNaN(x) || Number.isNaN(y)) return fail("undefined-value", from);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return fail("overflow", from);
    const added = row(from.n + 1, x, y, from);
    rows.push(added);
    if (Math.abs(x) > DIVERGENCE_LIMIT || Math.abs(y) > DIVERGENCE_LIMIT) {
      return fail("diverged", added);
    }
    return null;
  };

  // The lab computes (x₁, y₁) before the loop, so every run takes at least one step.
  const first = advance();
  if (first) return first;

  const unfinished = (r: SystemIterationRow) => (r.dx ?? 0) >= eps || (r.dy ?? 0) >= eps;
  while (unfinished(last())) {
    if (last().n >= maxIter) {
      const { n, x, y } = last();
      return { status: "max-iterations", result: { x, y }, n, iterations: rows };
    }
    const failed = advance();
    if (failed) return failed;
  }

  const { n, x, y } = last();
  return { status: "converged", result: { x, y }, n, iterations: rows };
}
