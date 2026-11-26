/**
 * How a run ended. `completed` is for methods with no convergence to wait for, such as the
 * Cauchy-problem methods, which compute y at a fixed set of nodes.
 */
export type RunStatus = "converged" | "max-iterations" | "error" | "completed";

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
 * Why a system run stopped without a valid result.
 * - `zero-jacobian`: the Jacobian J = Fₓ·G_y − F_y·Gₓ is exactly 0 (Newton's method only).
 * - `undefined-value`, `overflow`, `diverged`: as for scalar runs, in any component.
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

/**
 * One row of a system iteration: n, the point (xₙ, yₙ) or (xₙ, yₙ, zₙ), and each difference. A 2×2
 * system solved as F = G = 0 also has F and G there; a fixed-point system x = F(x, y), y = G(x, y)
 * has none, since F(xₙ, yₙ) would only repeat the next iterate.
 */
export interface SystemIterationRow {
  n: number;
  x: number;
  y: number;
  /** zₙ, only in a run with three unknowns. */
  z?: number;
  /** F(xₙ, yₙ); null when F is undefined there. */
  F?: number | null;
  /** G(xₙ, yₙ); null when G is undefined there. */
  G?: number | null;
  /** |xₙ − xₙ₋₁|; null for n = 0. */
  dx: number | null;
  /** |yₙ − yₙ₋₁|; null for n = 0. */
  dy: number | null;
  /** |zₙ − zₙ₋₁|; null for n = 0; only in a run with three unknowns. */
  dz?: number | null;
}

export interface SystemPoint {
  x: number;
  y: number;
  z?: number;
}

/** A system error names the whole point (xₙ, yₙ) or (xₙ, yₙ, zₙ). */
export interface SystemMethodError extends MethodError<SystemErrorCode> {
  y: number;
  z?: number;
}

export interface SystemRunResult extends RunResult<
  SystemIterationRow,
  SystemPoint,
  SystemErrorCode
> {
  error?: SystemMethodError;
}

/** One node of a Cauchy problem: i, xᵢ = x₀ + i·h and the approximation yᵢ ≈ y(xᵢ). */
export interface CauchyNodeRow {
  i: number;
  x: number;
  y: number;
}

/** Why a Cauchy run stopped before the last node: as for scalar runs, in some yᵢ. */
export type CauchyErrorCode = "undefined-value" | "overflow" | "diverged";

/**
 * The node a Cauchy run failed at. For `undefined-value` and `overflow` it is the last valid node,
 * the one the failing step started from; for `diverged` it is the first node whose |yᵢ| passed
 * {@link DIVERGENCE_LIMIT}, which is kept as a row.
 */
export interface CauchyMethodError {
  code: CauchyErrorCode;
  i: number;
  x: number;
  y: number;
}

/**
 * Result of a Cauchy-problem method. `rows` holds every node computed so far, from i = 0, also
 * when the run ends in an error.
 */
export interface CauchyRunResult {
  status: "completed" | "error";
  /** yₙ, the approximation at x₀ + T. Null when status is `error`. */
  result: number | null;
  /** The number of steps n asked for, so the last node is i = n. */
  n: number;
  /** The step h = T/n. */
  h: number;
  rows: CauchyNodeRow[];
  error?: CauchyMethodError;
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
