export type RunStatus = "converged" | "max-iterations" | "error";

/**
 * Why a run stopped without a valid result.
 * - `zero-derivative`: a denominator such as f′(xₙ) is exactly 0.
 * - `undefined-value`: a value is NaN (for example √ of a negative number).
 * - `overflow`: a value is ±∞.
 * - `diverged`: |xₙ| exceeded {@link DIVERGENCE_LIMIT}.
 */
export type MethodErrorCode = "zero-derivative" | "undefined-value" | "overflow" | "diverged";

/**
 * |xₙ| above this counts as divergence. It is far past any root the labs look for, and
 * stopping here keeps every value in the table finite.
 */
export const DIVERGENCE_LIMIT = 1e100;

export interface MethodError {
  code: MethodErrorCode;
  /**
   * Index of the iterate the failure is attached to. For `zero-derivative`,
   * `undefined-value` and `overflow` it is the last valid iterate xₙ (the step from xₙ
   * failed). For `diverged` it is the first iterate whose size exceeded the limit.
   */
  n: number;
  x: number;
}

/** One row of a scalar iteration: n, xₙ, f(xₙ) and |xₙ − xₙ₋₁|. */
export interface ScalarIterationRow {
  n: number;
  x: number;
  /** f(xₙ) for methods that solve f(x) = 0; null when the method has no f or it is undefined at xₙ. */
  fx: number | null;
  /** |xₙ − xₙ₋₁|; null for n = 0. */
  diff: number | null;
}

/**
 * Result of any method. `iterations` holds every row computed so far, including the
 * starting row n = 0, also when the run ends in an error. The one exception: when x₀
 * itself cannot be determined (e.g. rule R0 with f(a) undefined), there is no row.
 */
export interface RunResult<Row = ScalarIterationRow, Value = number> {
  status: RunStatus;
  /** Final value (xₙ). Null when status is `error`. */
  result: Value | null;
  /** Number of iterations n performed (the index of the last row). */
  n: number;
  iterations: Row[];
  error?: MethodError;
}

export type ScalarRunResult = RunResult<ScalarIterationRow, number>;

/** Thrown by a step function to stop a run with a specific error code. */
export class MethodStepError extends Error {
  readonly code: MethodErrorCode;

  constructor(code: MethodErrorCode) {
    super(code);
    this.name = "MethodStepError";
    this.code = code;
  }
}
