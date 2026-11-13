import { scalarIterate } from "../scalar-iterate";
import type { ScalarRunResult } from "../types";

export interface FixedPointInput {
  phi: (x: number) => number;
  x0: number;
  eps: number;
  maxIter: number;
}

/** Lab 1c. Scalar successive approximations: xₙ₊₁ = φ(xₙ). */
export function fixedPoint({ phi, x0, eps, maxIter }: FixedPointInput): ScalarRunResult {
  return scalarIterate({ x0, eps, maxIter, step: phi });
}
