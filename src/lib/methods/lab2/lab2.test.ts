import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { secant } from "./secant";
import { steffensen } from "./steffensen";

const x = ["x"];
const MAX = 1000;
const digits = (eps: number) => (eps === 1e-4 ? 8 : 12);

describe("2a secant", () => {
  // Ex. 1: √2 from f = x² − 2 on [1, 2], x₀ = 2, x₁ = 1.4.
  it.each([
    [1e-4, 4],
    [1e-8, 6],
    [1e-12, 6],
  ])("ex. 1 converges to √2 with ε = %s in n = %i", (eps, n) => {
    const r = secant({ f: compile("x^2 - 2", x), x0: 2, x1: 1.4, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(Math.abs((r.result as number) - Math.SQRT2)).toBeLessThan(eps);
  });

  // Ex. 2: x³ − x − 1 on [1, 2], x₀ = 2, x₁ = 1.5.
  it.each([
    [1e-4, 6],
    [1e-8, 7],
    [1e-12, 8],
  ])("ex. 2 converges with ε = %s in n = %i", (eps, n) => {
    const r = secant({ f: compile("x^3 - x - 1", x), x0: 2, x1: 1.5, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(r.result).toBeCloseTo(1.324717957244746, digits(eps));
  });

  it("takes x₁ as given: row 1 is x₁, with |x₁ − x₀| and f(x₁)", () => {
    const r = secant({ f: compile("x^2 - 2", x), x0: 2, x1: 1.4, eps: 1e-4, maxIter: MAX });
    expect(r.iterations[0]).toEqual({ n: 0, x: 2, fx: 2, diff: null });
    expect(r.iterations[1].x).toBe(1.4);
    expect(r.iterations[1].diff).toBeCloseTo(0.6, 15);
    expect(r.iterations[1].fx).toBeCloseTo(-0.04, 15);
    // x₂ = x₁ − f(x₁)(x₁ − x₀)/(f(x₁) − f(x₀)).
    expect(r.iterations[2].x).toBeCloseTo(1.4 - (-0.04 * -0.6) / (-0.04 - 2), 15);
  });

  it("stops with zero-denominator when f(xₙ) = f(xₙ₋₁) ≠ 0, keeping the rows (f = x², 1, −1)", () => {
    const r = secant({ f: compile("x^2", x), x0: 1, x1: -1, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.result).toBeNull();
    expect(r.error).toEqual({ code: "zero-denominator", n: 1, x: -1 });
    expect(r.iterations.map((row) => row.x)).toEqual([1, -1]);
  });

  it("stays at an exact root: f(xₙ) = 0 gives xₙ₊₁ = xₙ, even when f(xₙ₋₁) = 0 too", () => {
    // f = x² − 1 with x₀ = −1, x₁ = 1: both are roots, so the denominator would be 0.
    const r = secant({ f: compile("x^2 - 1", x), x0: -1, x1: 1, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(2);
    expect(r.result).toBe(1);
  });

  it("converges at n = 1 when |x₁ − x₀| < ε already", () => {
    const r = secant({ f: compile("x^2 - 2", x), x0: 1.41, x1: 1.41001, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.result).toBe(1.41001);
  });

  it("reports undefined-value when a step leaves the domain of f", () => {
    // f = √x − 1 from 4, 9: f(4) = 1, f(9) = 2, x₂ = 9 − 2·5/1 = −1, where √ is undefined.
    const r = secant({ f: compile("sqrt(x) - 1", x), x0: 4, x1: 9, eps: 1e-4, maxIter: MAX });
    expect(r.iterations.map((row) => row.x)).toEqual([4, 9, -1]);
    expect(r.error).toEqual({ code: "undefined-value", n: 2, x: -1 });
  });

  it("blames x₀, not x₁, when f(x₀) is undefined (f = √x, x₀ = −1, x₁ = 4)", () => {
    const r = secant({ f: compile("sqrt(x)", x), x0: -1, x1: 4, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: -1 });
    expect(r.iterations.map((row) => row.x)).toEqual([-1, 4]);
  });

  it("still blames x₁ when f(x₁) is the undefined one (f = √x, x₀ = 4, x₁ = −1)", () => {
    const r = secant({ f: compile("sqrt(x)", x), x0: 4, x1: -1, eps: 1e-4, maxIter: MAX });
    expect(r.error).toEqual({ code: "undefined-value", n: 1, x: -1 });
  });

  it("reports overflow when f(xₙ) becomes ±∞", () => {
    const r = secant({ f: compile("exp(x) - 1", x), x0: 1, x1: 800, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "overflow", n: 1, x: 800 });
  });

  it("stops at the cap: maxIter = 3 on ex. 2 with ε = 10⁻¹²", () => {
    const r = secant({ f: compile("x^3 - x - 1", x), x0: 2, x1: 1.5, eps: 1e-12, maxIter: 3 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(3);
    expect(r.result).toBe(r.iterations[3].x);
  });
});

describe("2b Steffensen", () => {
  const f = compile("x^3 - x - 1", x);

  // The lab's numerical example: x³ − x − 1 on [1, 2], dda = f″(1) = 6. Rule R0 gives x₀ = 2.
  it.each([
    [1e-4, 11],
    [1e-8, 12],
    [1e-12, 13],
  ])("the numerical example converges with ε = %s in n = %i, from x₀ = b = 2", (eps, n) => {
    const r = steffensen({ f, a: 1, b: 2, dda: 6, eps, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.x0Rule).toBe("b");
    expect(r.iterations[0]).toEqual({ n: 0, x: 2, fx: 5, diff: null });
    expect(r.n).toBe(n);
    expect(r.result).toBeCloseTo(1.324717957244746, digits(eps));
  });

  it("computes x₁ as a separate step: x₁ = 2 − 5²/(f(7) − 5)", () => {
    const r = steffensen({ f, a: 1, b: 2, dda: 6, eps: 1e-4, maxIter: MAX });
    expect(r.iterations[1].x).toBeCloseTo(2 - 25 / 330, 15);
  });

  it("stays at an exact root: f = x − 1 on [0, 2] reaches x₁ = x₂ = 1 and converges at n = 2", () => {
    const r = steffensen({ f: compile("x - 1", x), a: 0, b: 2, dda: 0, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.x0Rule).toBe("b");
    expect(r.iterations.map((row) => row.x)).toEqual([2, 1, 1]);
    expect(r.n).toBe(2);
  });

  it("stops with zero-denominator when f(xₙ + f(xₙ)) = f(xₙ) ≠ 0, keeping x₀", () => {
    // f = x² − 1.25 on [0, 0.5]: R0 picks x₀ = 0.5, f(x₀) = −1 and f(x₀ + f(x₀)) = f(−0.5) = −1.
    const r = steffensen({
      f: compile("x^2 - 1.25", x),
      a: 0,
      b: 0.5,
      dda: 2,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.x0Rule).toBe("b");
    expect(r.error).toEqual({ code: "zero-denominator", n: 0, x: 0.5 });
    expect(r.iterations).toHaveLength(1);
  });

  it("rule R0 with f(a) undefined stops before any row (f = √x, a = −1)", () => {
    const r = steffensen({
      f: compile("sqrt(x)", x),
      a: -1,
      b: 2,
      dda: 1,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: -1 });
    expect(r.iterations).toEqual([]);
    expect(r.x0Rule).toBeUndefined();
  });

  it("stops at the cap: maxIter = 5 on the numerical example", () => {
    const r = steffensen({ f, a: 1, b: 2, dda: 6, eps: 1e-12, maxIter: 5 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(5);
  });
});
