import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { scalarIterate } from "./scalar-iterate";
import { MethodStepError } from "./types";

describe("scalarIterate", () => {
  it("computes x₁ as its own step and stops when |xₙ − xₙ₋₁| < ε", () => {
    // xₙ₊₁ = xₙ / 2 from 1: differences 0.5, 0.25, 0.125 → stops at n = 4 with ε = 0.1.
    const r = scalarIterate({ x0: 1, step: (x) => x / 2, eps: 0.1, maxIter: 1000 });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(4);
    expect(r.result).toBe(1 / 16);
    expect(r.iterations.map((row) => row.n)).toEqual([0, 1, 2, 3, 4]);
    expect(r.iterations[0].diff).toBeNull();
    expect(r.iterations[4].diff).toBe(1 / 16);
  });

  it("always performs the first step, even when x₁ = x₀", () => {
    const r = scalarIterate({ x0: 3, step: (x) => x, eps: 1e-4, maxIter: 1000 });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
  });

  it("detects divergence past 1e100 (φ = 2x + 1, x₀ = 1)", () => {
    const r = scalarIterate({ x0: 1, step: compile("2x + 1", ["x"]), eps: 1e-4, maxIter: 1000 });
    expect(r.status).toBe("error");
    expect(r.error?.code).toBe("diverged");
    expect(r.result).toBeNull();
    const last = r.iterations[r.iterations.length - 1];
    expect(Math.abs(last.x)).toBeGreaterThan(1e100);
    expect(r.error?.n).toBe(last.n);
    expect(r.iterations.length).toBe(last.n + 1);
  });

  it("reports overflow when a value becomes ±∞ and keeps the partial table", () => {
    const r = scalarIterate({ x0: 10, step: compile("exp(x)", ["x"]), eps: 1e-4, maxIter: 1000 });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "overflow", n: 1, x: Math.exp(10) });
    expect(r.iterations).toHaveLength(2);
  });

  it("reports undefined-value for NaN", () => {
    const r = scalarIterate({
      x0: 4,
      step: compile("sqrt(x) - 5", ["x"]),
      eps: 1e-4,
      maxIter: 1000,
    });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 1, x: -3 });
    expect(r.iterations.map((row) => row.x)).toEqual([4, -3]);
  });

  it("passes step errors through with the current n and xₙ", () => {
    const r = scalarIterate({
      x0: 1,
      step: (x) => {
        if (x < 0.3) throw new MethodStepError("zero-derivative");
        return x / 2;
      },
      eps: 1e-12,
      maxIter: 1000,
    });
    expect(r.error).toEqual({ code: "zero-derivative", n: 2, x: 0.25 });
    expect(r.iterations).toHaveLength(3);
  });

  it.each([
    [Number.NaN, "undefined-value"],
    [Number.POSITIVE_INFINITY, "overflow"],
    [Number.NEGATIVE_INFINITY, "overflow"],
  ])("stops with %s → %s when a step returns it without throwing", (bad, code) => {
    const r = scalarIterate({
      x0: 1,
      step: (x) => (x < 0.6 ? bad : x / 2),
      eps: 1e-4,
      maxIter: 10,
    });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code, n: 1, x: 0.5 });
    expect(r.iterations.map((row) => row.x)).toEqual([1, 0.5]);
  });

  it("re-throws an unexpected error from a step instead of turning it into a result", () => {
    const bug = new TypeError("bug in step");
    const step = () => {
      throw bug;
    };
    expect(() => scalarIterate({ x0: 1, step, eps: 1e-4, maxIter: 10 })).toThrow(bug);
  });

  it("leaves f(xₙ) empty where f is undefined, but re-throws an unexpected error from f", () => {
    const undefinedAtZero = scalarIterate({
      x0: 0,
      step: (x) => x + 1,
      f: compile("ln(x)", ["x"]),
      eps: 2,
      maxIter: 10,
    });
    expect(undefinedAtZero.iterations[0].fx).toBeNull();
    expect(undefinedAtZero.iterations[1].fx).toBe(0);

    const buggy = () => {
      throw new Error("bug in f");
    };
    expect(() =>
      scalarIterate({ x0: 1, step: (x) => x / 2, f: buggy, eps: 1e-4, maxIter: 10 }),
    ).toThrow("bug in f");
  });

  it("stops at the cap with max-iterations", () => {
    const r = scalarIterate({ x0: 1, step: (x) => x / 2, eps: 1e-12, maxIter: 3 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(3);
    expect(r.result).toBe(1 / 8);
  });
});
