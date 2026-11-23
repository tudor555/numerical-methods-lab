export type RunStatus = "converged" | "max-iterations" | "error";

/**
 * Why a scalar run stopped without a valid result.
 * - `zero-derivative`: a denominator such as f′(xₙ) is exactly 0.
 * - `zero-denominator`: a difference of f values in the denominator is exactly 0, as in
 *   f(xₙ) − f(xₙ₋₁) for the secant method or f(xₙ + f(xₙ)) − f(xₙ) for Steffensen's, or Halley's
 *   2f′(xₙ)² − f(xₙ)f″(xₙ) is exactly 0.
 * - `undefined-value`: a value is NaN (for example √ of a negative number).
 * - `overflow`: a value is ±∞.
 * - `diverged`: |xₙ| exceeded {@link DIVERGENCE_LIMIT}.
 */
export type ScalarErrorCode =
  "zero-derivative" | "zero-denominator" | "undefined-value" | "overflow" | "diverged";

/**
 * Why a 2×2 system run stopped without a valid result.
 * - `zero-jacobian`: the Jacobian J = Fₓ·G_y − F_y·Gₓ is exactly 0.
 * - `undefined-value`, `overflow`, `diverged`: as for scalar runs, in either component.
 */
export type SystemErrorCode = "zero-jacobian" | "undefined-value" | "overflow" | "diverged";

export type MethodErrorCode = ScalarErrorCode | SystemErrorCode;

/**
 * |xₙ| above this counts as divergence. It is far past any root the labs look for, and
 * stopping here keeps every value in the table finite.
 */
export const DIVERGENCE_LIMIT = 1e100;

export interface MethodError<Code extends MethodErrorCode = ScalarErrorCode> {
  code: Code;
  /**
   * Index of the iterate the failure is attached to. For `zero-derivative`, `zero-denominator`,
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
export interface RunResult<
  Row = ScalarIterationRow,
  Value = number,
  Code extends MethodErrorCode = ScalarErrorCode,
> {
  status: RunStatus;
  /** Final value (xₙ). Null when status is `error`. */
  result: Value | null;
  /** Number of iterations n performed (the index of the last row). */
  n: number;
  iterations: Row[];
  error?: MethodError<Code>;
}

export type ScalarRunResult = RunResult<ScalarIterationRow, number>;

/** One row of a 2×2 system iteration: n, (xₙ, yₙ), F and G there, and both differences. */
export interface SystemIterationRow {
  n: number;
  x: number;
  y: number;
  /** F(xₙ, yₙ); null when F is undefined there. */
  F: number | null;
  /** G(xₙ, yₙ); null when G is undefined there. */
  G: number | null;
  /** |xₙ − xₙ₋₁|; null for n = 0. */
  dx: number | null;
  /** |yₙ − yₙ₋₁|; null for n = 0. */
  dy: number | null;
}

export interface SystemPoint {
  x: number;
  y: number;
}

/** A system error names the whole point (xₙ, yₙ). */
export interface SystemMethodError extends MethodError<SystemErrorCode> {
  y: number;
}

export interface SystemRunResult extends RunResult<
  SystemIterationRow,
  SystemPoint,
  SystemErrorCode
> {
  error?: SystemMethodError;
}

/** Thrown by a step function to stop a run with a specific error code. */
export class MethodStepError extends Error {
  readonly code: MethodErrorCode;

  constructor(code: MethodErrorCode) {
    super(code);
    this.name = "MethodStepError";
    this.code = code;
  }
}
