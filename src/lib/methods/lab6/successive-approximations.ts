import { systemIterate } from "../system-iterate";
import type { SystemRunResult } from "../types";

type Function2 = (x: number, y: number) => number;
type Function3 = (x: number, y: number, z: number) => number;

/** A system written as x = F(x, y), y = G(x, y). */
export interface FixedPointSystemInput {
  F: Function2;
  G: Function2;
  x0: number;
  y0: number;
  eps: number;
  maxIter: number;
}

/** A system written as x = F₁(x, y, z), y = F₂(x, y, z), z = F₃(x, y, z). */
export interface FixedPointSystem3Input {
  F1: Function3;
  F2: Function3;
  F3: Function3;
  x0: number;
  y0: number;
  z0: number;
  eps: number;
  maxIter: number;
}

/** Lab 6a. Successive approximations: xₙ₊₁ = F(xₙ, yₙ), yₙ₊₁ = G(xₙ, yₙ). */
export function successiveApproximations(input: FixedPointSystemInput): SystemRunResult {
  const { F, G, x0, y0, eps, maxIter } = input;
  return systemIterate({ x0, y0, eps, maxIter, step: (x, y) => [F(x, y), G(x, y)] });
}

/**
 * Lab 6c. Gauss–Seidel with two unknowns. The lab's first step uses only the start,
 * (x₁, y₁) = (F(x₀, y₀), G(x₀, y₀)); from n = 1 on, G already takes the new x:
 * xₙ₊₁ = F(xₙ, yₙ), yₙ₊₁ = G(xₙ₊₁, yₙ).
 */
export function gaussSeidel2(input: FixedPointSystemInput): SystemRunResult {
  const { F, G, x0, y0, eps, maxIter } = input;
  let firstStepDone = false;
  return systemIterate({
    x0,
    y0,
    eps,
    maxIter,
    step: (x, y) => {
      const xNext = F(x, y);
      const yNext = G(firstStepDone ? xNext : x, y);
      firstStepDone = true;
      return [xNext, yNext];
    },
  });
}

/**
 * Lab 6b. Gauss–Seidel with three unknowns. The lab's first step uses only the start,
 * (x₁, y₁, z₁) = (F₁, F₂, F₃) at (x₀, y₀, z₀); from n = 1 on, each component takes the ones
 * already updated: xₙ₊₁ = F₁(xₙ, yₙ, zₙ), yₙ₊₁ = F₂(xₙ₊₁, yₙ, zₙ), zₙ₊₁ = F₃(xₙ₊₁, yₙ₊₁, zₙ).
 */
export function gaussSeidel3(input: FixedPointSystem3Input): SystemRunResult {
  const { F1, F2, F3, x0, y0, z0, eps, maxIter } = input;
  let firstStepDone = false;
  return systemIterate({
    x0,
    y0,
    z0,
    eps,
    maxIter,
    step: (x, y, z) => {
      const xNext = F1(x, y, z);
      const yNext = F2(firstStepDone ? xNext : x, y, z);
      const zNext = firstStepDone ? F3(xNext, yNext, z) : F3(x, y, z);
      firstStepDone = true;
      return [xNext, yNext, zNext];
    },
  });
}
