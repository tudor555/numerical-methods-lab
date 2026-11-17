import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { kthRoot } from "../lab1/kth-root";
import { newton } from "../lab1/newton";
import { combinedTangent } from "./combined-tangent";
import { thirdOrderRoot } from "./third-order-root";

const x = ["x"];
const MAX = 1000;
const ROOT = 1.324717957244746;
const EPS = [1e-4, 1e-8, 1e-12];
const digits = (eps: number) => (eps === 1e-4 ? 8 : 12);

const ex1 = { f: compile("x^2 - 2", x), df: compile("2x", x) };
const ex2 = { f: compile("x^3 - x - 1", x), df: compile("3x^2 - 1", x) };

describe("4a combined tangent method", () => {
  it.each([
    [1e-4, 3],
    [1e-8, 4],
    [1e-12, 4],
  ])("ex. 1 converges to √2 with ε = %s in n = %i, from x₀ = 2", (eps, n) => {
    const r = combinedTangent({ ...ex1, x0: 2, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(r.iterations[0]).toEqual({ n: 0, x: 2, fx: 2, diff: null });
    expect(Math.abs((r.result as number) - Math.SQRT2)).toBeLessThan(eps);
  });

  it.each([
    [1e-4, 4],
    [1e-8, 5],
    [1e-12, 5],
  ])("ex. 2 converges with ε = %s in n = %i, from x₀ = 2", (eps, n) => {
    const r = combinedTangent({ ...ex2, x0: 2, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(r.result).toBeCloseTo(ROOT, digits(eps));
  });

  it("computes x₁ as a separate step: y₀ = 2 − 2/4 = 1.5, x₁ = 1.5 − f(1.5)/f′(2) on ex. 1", () => {
    const r = combinedTangent({ ...ex1, x0: 2, eps: 1e-4, maxIter: MAX });
    expect(r.iterations[1].x).toBeCloseTo(1.5 - 0.25 / 4, 15);
  });

  it("stops with zero-derivative when f′(xₙ) = 0, keeping row 0 (f = x² − 2, x₀ = 0)", () => {
    const r = combinedTangent({ ...ex1, x0: 0, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.result).toBeNull();
    expect(r.error).toEqual({ code: "zero-derivative", n: 0, x: 0 });
    expect(r.iterations).toEqual([{ n: 0, x: 0, fx: -2, diff: null }]);
  });

  it("stays at an exact root: f = x − 1 from x₀ = 1 gives x₁ = 1 and converges at n = 1", () => {
    const r = combinedTangent({
      f: compile("x - 1", x),
      df: compile("1", x),
      x0: 1,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.iterations.map((row) => row.x)).toEqual([1, 1]);
  });

  it("stays at an exact root even where f′ = 0 (f = x², x₀ = 0)", () => {
    const r = combinedTangent({
      f: compile("x^2", x),
      df: compile("2x", x),
      x0: 0,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("converged");
    expect(r.result).toBe(0);
  });

  it("reports undefined-value when f is undefined at the helper point yₙ (f = ln x, x₀ = 3, y₀ < 0)", () => {
    const r = combinedTangent({
      f: compile("ln(x)", x),
      df: compile("1/x", x),
      x0: 3,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(3 - Math.log(3) * 3).toBeLessThan(0);
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: 3 });
    expect(r.iterations).toEqual([{ n: 0, x: 3, fx: Math.log(3), diff: null }]);
  });

  it("reports undefined-value and overflow from f at xₙ, as the other methods do", () => {
    const sqrt = combinedTangent({
      f: compile("sqrt(x)", x),
      df: compile("1 / (2 sqrt(x))", x),
      x0: -1,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(sqrt.error).toEqual({ code: "undefined-value", n: 0, x: -1 });
    const exp = combinedTangent({
      f: compile("exp(x) - 1", x),
      df: compile("exp(x)", x),
      x0: 800,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(exp.error).toEqual({ code: "overflow", n: 0, x: 800 });
  });

  it("reports divergence when |xₙ| passes the limit (f = ∛x, x₀ = 1: each step moves away from 0)", () => {
    const r = combinedTangent({
      f: compile("cbrt(x)", x),
      df: compile("1 / (3 cbrt(x)^2)", x),
      x0: 1,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.error?.code).toBe("diverged");
  });

  it("stops at the cap: maxIter = 2 on ex. 2 with ε = 10⁻¹²", () => {
    const r = combinedTangent({ ...ex2, x0: 2, eps: 1e-12, maxIter: 2 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(2);
    expect(r.result).toBe(r.iterations[2].x);
  });
});

describe("4b third-order square root", () => {
  it.each([
    [2, [3, 4, 4]],
    [3, [3, 4, 4]],
    [5, [4, 4, 5]],
  ])("√%i from x₀ = a takes n = %j for ε = 10⁻⁴, 10⁻⁸, 10⁻¹²", (a, counts) => {
    const runs = EPS.map((eps) => thirdOrderRoot({ a, eps, maxIter: MAX }));
    expect(runs.map((r) => r.n)).toEqual(counts);
    runs.forEach((r, i) => {
      expect(r.status).toBe("converged");
      expect(r.iterations[0]).toEqual({ n: 0, x: a, fx: a * a - a, diff: null });
      expect(Math.abs((r.result as number) - Math.sqrt(a))).toBeLessThan(EPS[i]);
    });
  });

  it("computes x₁ as a separate step: x₁ = 2(4 + 6)/(12 + 2) for a = 2", () => {
    const r = thirdOrderRoot({ a: 2, eps: 1e-4, maxIter: MAX });
    expect(r.iterations[1].x).toBe(20 / 14);
    expect(r.iterations[1].fx).toBeCloseTo((20 / 14) ** 2 - 2, 15);
  });

  it("stays at the root for a = 1: x₁ = 1 and converges at n = 1", () => {
    const r = thirdOrderRoot({ a: 1, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.iterations.map((row) => row.x)).toEqual([1, 1]);
  });

  it("converges for the largest allowed radicand, a = 10⁶, and for a small one, a = 10⁻⁶", () => {
    for (const a of [1e6, 1e-6]) {
      const r = thirdOrderRoot({ a, eps: 1e-12, maxIter: MAX });
      expect(r.status).toBe("converged");
      expect(r.result).toBeCloseTo(Math.sqrt(a), 9);
    }
  });

  it("stops at the cap: maxIter = 2 for √5 with ε = 10⁻¹²", () => {
    const r = thirdOrderRoot({ a: 5, eps: 1e-12, maxIter: 2 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(2);
  });
});

describe("The Lab 4 comparisons' reference methods", () => {
  it.each([
    ["ex. 1", ex1, [4, 5, 6]],
    ["ex. 2", ex2, [5, 6, 7]],
  ] as const)("Newton on 4a %s from x₀ = 2 takes n = %j", (_, { f, df }, counts) => {
    const ns = EPS.map(
      (eps) => newton({ f, df, a: 1, b: 2, start: { mode: "manual", x0: 2 }, eps, maxIter: MAX }).n,
    );
    expect(ns).toEqual(counts);
  });

  it.each([
    [2, [4, 5, 6]],
    [3, [4, 5, 6]],
    [5, [5, 6, 6]],
  ])("1b with c = %i, k = 2 takes n = %j, from the same x₀ = c", (c, counts) => {
    const runs = EPS.map((eps) => kthRoot({ c, k: 2, eps, maxIter: MAX }));
    expect(runs.map((r) => r.n)).toEqual(counts);
    expect(runs[0].iterations[0].x).toBe(c);
  });
});
