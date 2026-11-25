import { EvaluationError } from "@/lib/expressions/compile";
import {
  DIVERGENCE_LIMIT,
  MethodStepError,
  type SystemErrorCode,
  type SystemIterationRow,
  type SystemPoint,
  type SystemRunResult,
} from "./types";

type Function2 = (x: number, y: number) => number;

interface SystemIterateCommon {
  x0: number;
  y0: number;
  /**
   * F and G for the F(xₙ, yₙ) and G(xₙ, yₙ) columns of a system solved as F = G = 0. Left out for
   * fixed-point systems, whose F and G are the iteration itself.
   */
  F?: Function2;
  G?: Function2;
  /** Tolerance ε > 0. */
  eps: number;
  /** Maximum number of iterations (≥ 1). */
  maxIter: number;
}

/** A step may throw {@link MethodStepError} or {@link EvaluationError} to stop the run. */
export type SystemIterateInput = SystemIterateCommon &
  (
    | {
        z0?: undefined;
        /** One step: (xₙ, yₙ) ↦ (xₙ₊₁, yₙ₊₁). (x₁, y₁) is its first step. */
        step: (x: number, y: number) => readonly [number, number];
      }
    | {
        /** z₀ makes it a run with three unknowns. */
        z0: number;
        /** One step: (xₙ, yₙ, zₙ) ↦ (xₙ₊₁, yₙ₊₁, zₙ₊₁). (x₁, y₁, z₁) is its first step. */
        step: (x: number, y: number, z: number) => readonly [number, number, number];
      }
  );

/** The differences of a row: [dx, dy] or [dx, dy, dz]. */
const differencesOf = (row: SystemIterationRow): (number | null)[] =>
  row.z === undefined ? [row.dx, row.dy] : [row.dx, row.dy, row.dz ?? null];

/**
 * Shared driver for system methods with two or three unknowns: the first step from the start,
 * then repeat while any component difference is ≥ ε. A NaN, ±∞ or a component above 1e100 stops
 * the run with an error; the rows so far are kept.
 */
export function systemIterate(input: SystemIterateInput): SystemRunResult {
  const { x0, y0, z0, F, G, eps, maxIter } = input;
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
  const row = (
    n: number,
    point: readonly number[],
    previous?: SystemIterationRow,
  ): SystemIterationRow => {
    const [x, y, z] = point;
    const difference = (now: number, before: number | undefined) =>
      previous ? Math.abs(now - (before ?? Number.NaN)) : null;
    return {
      n,
      x,
      y,
      ...(z === undefined ? {} : { z }),
      ...(F ? { F: value(F, x, y) } : {}),
      ...(G ? { G: value(G, x, y) } : {}),
      dx: difference(x, previous?.x),
      dy: difference(y, previous?.y),
      ...(z === undefined ? {} : { dz: difference(z, previous?.z) }),
    };
  };
  const pointOf = (r: SystemIterationRow): SystemPoint =>
    r.z === undefined ? { x: r.x, y: r.y } : { x: r.x, y: r.y, z: r.z };

  const rows: SystemIterationRow[] = [row(0, z0 === undefined ? [x0, y0] : [x0, y0, z0])];
  const last = () => rows[rows.length - 1];

  const fail = (code: SystemErrorCode, at: SystemIterationRow): SystemRunResult => ({
    status: "error",
    result: null,
    n: last().n,
    iterations: rows,
    error: { code, n: at.n, ...pointOf(at) },
  });

  const stepFrom = (from: SystemIterationRow): readonly number[] =>
    input.z0 === undefined
      ? input.step(from.x, from.y)
      : input.step(from.x, from.y, from.z ?? Number.NaN);

  /** Appends the next row. Returns an error result if the step fails or diverges, otherwise null. */
  const advance = (): SystemRunResult | null => {
    const from = last();
    let next: readonly number[];
    try {
      next = stepFrom(from);
    } catch (error) {
      if (error instanceof MethodStepError || error instanceof EvaluationError) {
        // A system step only ever throws a system code.
        return fail(error.code as SystemErrorCode, from);
      }
      throw error;
    }
    if (next.some(Number.isNaN)) return fail("undefined-value", from);
    if (!next.every(Number.isFinite)) return fail("overflow", from);
    const added = row(from.n + 1, next, from);
    rows.push(added);
    if (next.some((c) => Math.abs(c) > DIVERGENCE_LIMIT)) return fail("diverged", added);
    return null;
  };

  // The lab computes the first step before the loop, so every run takes at least one step.
  const first = advance();
  if (first) return first;

  const unfinished = (r: SystemIterationRow) => differencesOf(r).some((d) => (d ?? 0) >= eps);
  while (unfinished(last())) {
    if (last().n >= maxIter) {
      return { status: "max-iterations", result: pointOf(last()), n: last().n, iterations: rows };
    }
    const failed = advance();
    if (failed) return failed;
  }

  return { status: "converged", result: pointOf(last()), n: last().n, iterations: rows };
}
