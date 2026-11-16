import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { newton } from "../lab1/newton";
import { chebyshev } from "./chebyshev";
import { halley } from "./halley";

const x = ["x"];
const MAX = 1000;
const ROOT = 1.324717957244746;
const digits = (eps: number) => (eps === 1e-4 ? 8 : 12);

const ex1 = { f: compile("x^2 - 2", x), df: compile("2x", x), ddf: compile("2", x) };
const ex2 = { f: compile("x^3 - x - 1", x), df: compile("3x^2 - 1", x), ddf: compile("6x", x) };
const fromTwo = { a: 1, b: 2, start: { mode: "manual", x0: 2 } } as const;

describe("3a Halley", () => {
  it.each([
    [1e-4, 3],
    [1e-8, 4],
    [1e-12, 4],
  ])("ex. 1 converges to √2 with ε = %s in n = %i, from x₀ = 2", (eps, n) => {
    const r = halley({ ...ex1, ...fromTwo, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(r.iterations[0]).toEqual({ n: 0, x: 2, fx: 2, diff: null });
    expect(r.x0Rule).toBeUndefined();
    expect(Math.abs((r.result as number) - Math.SQRT2)).toBeLessThan(eps);
  });

  it.each([
    [1e-4, 4],
    [1e-8, 4],
    [1e-12, 5],
  ])("ex. 2 converges with ε = %s in n = %i, from x₀ = 2", (eps, n) => {
    const r = halley({ ...ex2, ...fromTwo, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(r.result).toBeCloseTo(ROOT, digits(eps));
  });

  it("computes x₁ as a separate step: x₁ = 2 − 2·2·4 / (2·16 − 2·2) on ex. 1", () => {
    const r = halley({ ...ex1, ...fromTwo, eps: 1e-4, maxIter: MAX });
    expect(r.iterations[1].x).toBeCloseTo(2 - 16 / 28, 15);
  });

  it.each([
    [1e-4, 3],
    [1e-8, 4],
    [1e-12, 4],
  ])(
    "ex. 1 by rule R0: f(1)·f″(1) = −2 ≤ 0 picks x₀ = b = 2, same n (ε = %s, n = %i)",
    (eps, n) => {
      const r = halley({ ...ex1, a: 1, b: 2, start: { mode: "r0" }, eps, maxIter: MAX });
      expect(r.x0Rule).toBe("b");
      expect(r.iterations[0].x).toBe(2);
      expect(r.n).toBe(n);
    },
  );

  it("rule R0 fails before any row when f″(a) is undefined", () => {
    const r = halley({
      f: compile("x - 1", x),
      df: compile("1", x),
      ddf: compile("ln(x)", x),
      a: -1,
      b: 2,
      start: { mode: "r0" },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: -1 });
    expect(r.iterations).toEqual([]);
  });

  it("stops with zero-denominator when 2f′² − f f″ = 0, keeping row 0 (f = x − 1, f″ = 2, x₀ = 2)", () => {
    const r = halley({
      f: compile("x - 1", x),
      df: compile("1", x),
      ddf: compile("2", x),
      ...fromTwo,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.result).toBeNull();
    expect(r.error).toEqual({ code: "zero-denominator", n: 0, x: 2 });
    expect(r.iterations).toEqual([{ n: 0, x: 2, fx: 1, diff: null }]);
  });

  it("stops with zero-derivative when f′(xₙ) = 0 and f(xₙ) ≠ 0, keeping row 0 (f = x² − 2, x₀ = 0)", () => {
    const r = halley({
      ...ex1,
      a: -1,
      b: 2,
      start: { mode: "manual", x0: 0 },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.result).toBeNull();
    expect(r.error).toEqual({ code: "zero-derivative", n: 0, x: 0 });
    expect(r.iterations).toEqual([{ n: 0, x: 0, fx: -2, diff: null }]);
  });

  it("stays at an exact root: f = x − 1 from x₀ = 1 gives x₁ = 1 and converges at n = 1", () => {
    const r = halley({
      f: compile("x - 1", x),
      df: compile("1", x),
      ddf: compile("0", x),
      a: 0,
      b: 2,
      start: { mode: "manual", x0: 1 },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.iterations.map((row) => row.x)).toEqual([1, 1]);
  });

  it("reports undefined-value when f is undefined at xₙ (f = √x − 3 from x₀ = −1)", () => {
    const r = halley({
      f: compile("sqrt(x) - 3", x),
      df: compile("1 / (2 sqrt(x))", x),
      ddf: compile("-1 / (4 x sqrt(x))", x),
      a: 0,
      b: 1,
      start: { mode: "manual", x0: -1 },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: -1 });
    expect(r.iterations).toEqual([{ n: 0, x: -1, fx: null, diff: null }]);
  });

  it("reports overflow when f(xₙ) is ±∞", () => {
    const r = halley({
      f: compile("exp(x) - 1", x),
      df: compile("exp(x)", x),
      ddf: compile("exp(x)", x),
      a: 0,
      b: 1,
      start: { mode: "manual", x0: 800 },
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.error).toEqual({ code: "overflow", n: 0, x: 800 });
  });

  it("stops at the cap: maxIter = 2 on ex. 2 with ε = 10⁻¹²", () => {
    const r = halley({ ...ex2, ...fromTwo, eps: 1e-12, maxIter: 2 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(2);
    expect(r.result).toBe(r.iterations[2].x);
  });
});

describe("3b Chebyshev", () => {
  it.each([
    [1e-4, 4],
    [1e-8, 4],
    [1e-12, 5],
  ])("the numerical example converges with ε = %s in n = %i, from x₀ = 2", (eps, n) => {
    const r = chebyshev({ ...ex2, x0: 2, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(r.iterations[0]).toEqual({ n: 0, x: 2, fx: 5, diff: null });
    expect(r.result).toBeCloseTo(ROOT, digits(eps));
  });

  it("computes x₁ as a separate step: x₁ = 2 − 5/11 − 25·12 / (2·11³)", () => {
    const r = chebyshev({ ...ex2, x0: 2, eps: 1e-4, maxIter: MAX });
    expect(r.iterations[1].x).toBeCloseTo(2 - 5 / 11 - 300 / (2 * 11 ** 3), 15);
  });

  it("stops with zero-derivative when f′(xₙ) = 0, keeping row 0 (f = x² − 2, x₀ = 0)", () => {
    const r = chebyshev({ ...ex1, x0: 0, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "zero-derivative", n: 0, x: 0 });
    expect(r.iterations).toEqual([{ n: 0, x: 0, fx: -2, diff: null }]);
  });

  it("stays at an exact root, even where f′ = 0 (f = x², x₀ = 0)", () => {
    const r = chebyshev({
      f: compile("x^2", x),
      df: compile("2x", x),
      ddf: compile("2", x),
      x0: 0,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.result).toBe(0);
  });

  it("reports undefined-value and overflow from f, as the other methods do", () => {
    const sqrt = chebyshev({
      f: compile("sqrt(x)", x),
      df: compile("1 / (2 sqrt(x))", x),
      ddf: compile("-1 / (4 x sqrt(x))", x),
      x0: -1,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(sqrt.error).toEqual({ code: "undefined-value", n: 0, x: -1 });
    const exp = chebyshev({
      f: compile("exp(x) - 1", x),
      df: compile("exp(x)", x),
      ddf: compile("exp(x)", x),
      x0: 800,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(exp.error).toEqual({ code: "overflow", n: 0, x: 800 });
  });

  it("stops at the cap: maxIter = 2 on the numerical example", () => {
    const r = chebyshev({ ...ex2, x0: 2, eps: 1e-12, maxIter: 2 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(2);
  });
});

describe("Newton on the Lab 3 examples (the comparisons' reference)", () => {
  it.each([
    ["ex. 1", ex1, [4, 5, 6]],
    ["ex. 2 and the numerical example", ex2, [5, 6, 7]],
  ] as const)("%s from x₀ = 2 takes n = %j", (_, { f, df }, counts) => {
    const ns = [1e-4, 1e-8, 1e-12].map((eps) => newton({ f, df, ...fromTwo, eps, maxIter: MAX }).n);
    expect(ns).toEqual(counts);
  });
});
