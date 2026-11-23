import { systemIterate } from "../system-iterate";
import { MethodStepError, type SystemRunResult } from "../types";

type Function2 = (x: number, y: number) => number;

export interface NewtonSystemInput {
  F: Function2;
  G: Function2;
  /** ∂F/∂x, ∂F/∂y, ∂G/∂x, ∂G/∂y. */
  Fx: Function2;
  Fy: Function2;
  Gx: Function2;
  Gy: Function2;
  x0: number;
  y0: number;
  eps: number;
  maxIter: number;
}

interface Partials {
  Fx: number;
  Fy: number;
  Gx: number;
  Gy: number;
  J: number;
}

/** The partial derivatives and J = Fₓ·G_y − F_y·Gₓ at (x, y); J = 0 stops the run. */
function partialsAt(input: NewtonSystemInput, x: number, y: number): Partials {
  const Fx = input.Fx(x, y);
  const Fy = input.Fy(x, y);
  const Gx = input.Gx(x, y);
  const Gy = input.Gy(x, y);
  const J = Fx * Gy - Fy * Gx;
  if (J === 0) throw new MethodStepError("zero-jacobian");
  return { Fx, Fy, Gx, Gy, J };
}

/** One Newton step from (x, y) with the given partials. */
function newtonStep(
  x: number,
  y: number,
  F: number,
  G: number,
  { Fx, Fy, Gx, Gy, J }: Partials,
): readonly [number, number] {
  return [x - (F * Gy - G * Fy) / J, y - (Fx * G - Gx * F) / J];
}

function run(input: NewtonSystemInput, partials: (x: number, y: number) => Partials) {
  const { F, G, x0, y0, eps, maxIter } = input;
  return systemIterate({
    x0,
    y0,
    F,
    G,
    eps,
    maxIter,
    step: (x, y) => {
      const f = F(x, y);
      const g = G(x, y);
      // (xₙ, yₙ) solves the system exactly, so it stays, as Labs 1–4 do for f(xₙ) = 0.
      if (f === 0 && g === 0) return [x, y];
      return newtonStep(x, y, f, g, partials(x, y));
    },
  });
}

/**
 * Lab 5a. Newton's method for F(x, y) = 0, G(x, y) = 0: with J = Fₓ·G_y − F_y·Gₓ,
 * xₙ₊₁ = xₙ − (F·G_y − G·F_y)/J and yₙ₊₁ = yₙ − (Fₓ·G − Gₓ·F)/J, all at (xₙ, yₙ).
 * J = 0 stops the run with `zero-jacobian`.
 */
export function newtonSystem(input: NewtonSystemInput): SystemRunResult {
  return run(input, (x, y) => partialsAt(input, x, y));
}

/**
 * Lab 5b. Modified Newton: the same step, but the partial derivatives and J stay fixed at
 * (x₀, y₀); only F and G are evaluated at (xₙ, yₙ). They are computed in the first step, so J₀ = 0
 * or an undefined partial at (x₀, y₀) stops the run at n = 0.
 */
export function modifiedNewtonSystem(input: NewtonSystemInput): SystemRunResult {
  let fixed: Partials | null = null;
  return run(input, () => {
    fixed ??= partialsAt(input, input.x0, input.y0);
    return fixed;
  });
}
