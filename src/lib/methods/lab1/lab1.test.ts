import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { fixedPoint } from "./fixed-point";
import { kthRoot } from "./kth-root";
import { newton } from "./newton";

const EPS = [1e-4, 1e-8, 1e-12] as const;
const x = ["x"];
const MAX = 1000;

describe("1a Newton", () => {
  const f = compile("x^3 - x - 1", x);
  const df = compile("3x^2 - 1", x);

  // Ex. 1: x³ − x − 1 on [1, 2], dda = f″(1) = 6. Rule R0 gives x₀ = 2.
  it.each([
    [1e-4, 5],
    [1e-8, 6],
    [1e-12, 7],
  ])("ex. 1 converges with ε = %s in n = %i", (eps, n) => {
    const r = newton({ f, df, a: 1, b: 2, start: { mode: "r0", dda: 6 }, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.x0Rule).toBe("b");
    expect(r.iterations[0].x).toBe(2);
    expect(r.n).toBe(n);
    expect(r.result).toBeCloseTo(1.324717957244746, eps === 1e-4 ? 8 : 12);
    expect(r.iterations[0].fx).toBe(5);
  });

  // Ex. 2: x⁵ − 5x + 1 on [−1, 1]. Rule R0 gives x₀ = 1, where f′ = 0.
  it("ex. 2 with rule R0 stops with zero-derivative at x₀ = 1", () => {
    const r = newton({
      f: compile("x^5 - 5x + 1", x),
      df: compile("5x^4 - 5", x),
      a: -1,
      b: 1,
      start: { mode: "r0", dda: -20 },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.result).toBeNull();
    expect(r.error).toEqual({ code: "zero-derivative", n: 0, x: 1 });
    expect(r.iterations).toHaveLength(1);
  });

  it.each([
    [1e-4, 2],
    [1e-8, 3],
    [1e-12, 4],
  ])("ex. 2 with manual x₀ = 0 converges with ε = %s in n = %i", (eps, n) => {
    const r = newton({
      f: compile("x^5 - 5x + 1", x),
      df: compile("5x^4 - 5", x),
      a: -1,
      b: 1,
      start: { mode: "manual", x0: 0 },
      eps,
      maxIter: MAX,
    });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(r.result).toBeCloseTo(0.2000641026299754, eps === 1e-4 ? 8 : 12);
  });

  // Ex. 3 (Kepler): f = x − sin x − 0.25, x₀ = 3π/8.
  it.each([
    [1e-4, 2],
    [1e-8, 3],
    [1e-12, 4],
  ])("Kepler converges with ε = %s in n = %i", (eps, n) => {
    const r = newton({
      f: compile("x - sin(x) - 0.25", x),
      df: compile("1 - cos(x)", x),
      a: Math.PI / 4,
      b: Math.PI / 2,
      start: { mode: "manual", x0: (3 * Math.PI) / 8 },
      eps,
      maxIter: MAX,
    });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(r.result).toBeCloseTo(1.171229652501666, eps === 1e-4 ? 8 : 12);
  });

  it("reports undefined-value when f is NaN (f = sqrt(x) leaves the domain)", () => {
    // x₀ = 1 → x₁ = 1 − 1/(1/2) = −1, where sqrt is undefined.
    const r = newton({
      f: compile("sqrt(x)", x),
      df: compile("1/(2 sqrt(x))", x),
      a: 0,
      b: 2,
      start: { mode: "manual", x0: 1 },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 1, x: -1 });
    expect(r.iterations.map((row) => row.x)).toEqual([1, -1]);
    expect(r.iterations[1].fx).toBeNull();
  });

  it("reports overflow when a value becomes ±∞", () => {
    // f = exp(x) − 1, f′ = exp(x): from x₀ = 800, exp(800) = ∞.
    const r = newton({
      f: compile("exp(x) - 1", x),
      df: compile("exp(x)", x),
      a: 0,
      b: 1000,
      start: { mode: "manual", x0: 800 },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.error?.code).toBe("overflow");
    expect(r.iterations).toHaveLength(1);
  });

  it.each([
    // f = x² − 2 on [2, 3]: f(2) = 2 > 0, f″ = 2 > 0.
    ["both positive", "x^2 - 2", "2x", 2, 3, 2],
    // f = 2 − x² on [2, 3]: f(2) = −2 < 0, f″ = −2 < 0.
    ["both negative", "2 - x^2", "-2x", 2, 3, -2],
  ])("rule R0 picks x₀ = a when f(a) and f″(a) are %s", (_, fSrc, dfSrc, a, b, dda) => {
    const r = newton({
      f: compile(fSrc, x),
      df: compile(dfSrc, x),
      a,
      b,
      start: { mode: "r0", dda },
      eps: 1e-12,
      maxIter: MAX,
    });
    expect(r.x0Rule).toBe("a");
    expect(r.iterations[0].x).toBe(a);
    expect(r.status).toBe("converged");
    expect(r.result).toBeCloseTo(Math.SQRT2, 12);
  });

  it("rule R0 with f(a) undefined stops before any row (f = sqrt(x), a = −1)", () => {
    const r = newton({
      f: compile("sqrt(x)", x),
      df: compile("1/(2 sqrt(x))", x),
      a: -1,
      b: 1,
      start: { mode: "r0", dda: 1 },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: -1 });
    expect(r.iterations).toEqual([]);
  });

  it("re-throws an unexpected error from f(a) under rule R0", () => {
    const bug = new TypeError("bug in f");
    const run = () =>
      newton({
        f: () => {
          throw bug;
        },
        df,
        a: 1,
        b: 2,
        start: { mode: "r0", dda: 6 },
        eps: 1e-4,
        maxIter: MAX,
      });
    expect(run).toThrow(bug);
  });

  it("re-throws an unexpected error from f inside a step", () => {
    // The f(xₙ) column swallows the error (fx = null); the step must not.
    const bug = new TypeError("bug in f");
    const run = () =>
      newton({
        f: () => {
          throw bug;
        },
        df,
        a: 1,
        b: 2,
        start: { mode: "manual", x0: 1.5 },
        eps: 1e-4,
        maxIter: MAX,
      });
    expect(run).toThrow(bug);
  });

  it("stops at the cap: maxIter = 3 on ex. 1 with ε = 10⁻¹²", () => {
    const r = newton({ f, df, a: 1, b: 2, start: { mode: "r0", dda: 6 }, eps: 1e-12, maxIter: 3 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(3);
    expect(r.iterations.filter((row) => row.n >= 1)).toHaveLength(3);
    expect(r.result).toBe(r.iterations[3].x);
  });
});

describe("1b k-th root", () => {
  it.each([
    [2, 2, [4, 5, 6]],
    [3, 2, [4, 5, 6]],
    [5, 2, [5, 6, 6]],
    [2, 3, [5, 6, 6]],
    [3, 3, [6, 7, 7]],
    [12, 3, [8, 9, 10]],
  ])("c = %i, k = %i converges to ᵏ√c with n = %j", (c, k, ns) => {
    EPS.forEach((eps, i) => {
      const r = kthRoot({ c, k, eps, maxIter: MAX });
      expect(r.status).toBe("converged");
      expect(r.iterations[0].x).toBe(c);
      expect(r.n).toBe(ns[i]);
      expect(Math.abs((r.result as number) - c ** (1 / k))).toBeLessThan(eps);
    });
  });

  it("reports overflow instead of false convergence when xᵏ⁻¹ overflows (c = 2, k = 10⁶)", () => {
    const r = kthRoot({ c: 2, k: 1e6, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "overflow", n: 0, x: 2 });
    expect(r.result).toBeNull();
  });

  it("starts at x₀ = 1 when c ≤ 1", () => {
    const r = kthRoot({ c: 0.5, k: 2, eps: 1e-12, maxIter: MAX });
    expect(r.iterations[0].x).toBe(1);
    expect(r.result).toBeCloseTo(Math.SQRT1_2, 12);
  });
});

describe("1c successive approximations", () => {
  it.each([
    [1e-4, 5],
    [1e-8, 15],
    [1e-12, 25],
  ])("Kepler φ = sin x + 0.25 from 3π/8 with ε = %s takes n = %i", (eps, n) => {
    const r = fixedPoint({
      phi: compile("sin(x) + 0.25", x),
      x0: (3 * Math.PI) / 8,
      eps,
      maxIter: MAX,
    });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(Math.abs((r.result as number) - 1.171229652501666)).toBeLessThan(10 * eps);
    expect(r.iterations[1].fx).toBeNull();
  });

  it.each([
    [2, [6, 12, 17]],
    [3, [9, 16, 23]],
    [5, [12, 22, 31]],
  ])("√%i with φ = (x + c)/(x + 1), x₀ = c takes n = %j", (c, ns) => {
    const phi = compile(`(x + ${c}) / (x + 1)`, x);
    EPS.forEach((eps, i) => {
      const r = fixedPoint({ phi, x0: c, eps, maxIter: MAX });
      expect(r.status).toBe("converged");
      expect(r.n).toBe(ns[i]);
      expect(Math.abs((r.result as number) - Math.sqrt(c))).toBeLessThan(10 * eps);
    });
  });

  it("φ = 2x + 1 from x₀ = 1 diverges", () => {
    const r = fixedPoint({ phi: compile("2x + 1", x), x0: 1, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error?.code).toBe("diverged");
    expect(r.iterations.length).toBeGreaterThan(300);
  });
});
