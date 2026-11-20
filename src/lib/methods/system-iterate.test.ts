import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { systemIterate } from "./system-iterate";
import { MethodStepError } from "./types";

const zero = () => 0;
const base = { F: zero, G: zero, eps: 0.1, maxIter: 1000 };

describe("systemIterate", () => {
  it("computes (x₁, y₁) as its own step and stops when both differences are below ε", () => {
    // x halves, y quarters: |yₙ − yₙ₋₁| drops below 0.1 first, so x decides: n = 4.
    const r = systemIterate({ ...base, x0: 1, y0: 1, step: (x, y) => [x / 2, y / 4] });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(4);
    expect(r.result).toEqual({ x: 1 / 16, y: 1 / 256 });
    expect(r.iterations.map((row) => row.n)).toEqual([0, 1, 2, 3, 4]);
    expect(r.iterations[0]).toEqual({ n: 0, x: 1, y: 1, F: 0, G: 0, dx: null, dy: null });
    expect(r.iterations[4]).toMatchObject({ dx: 1 / 16, dy: 3 / 256 });
  });

  it("keeps going while only the y difference is still ≥ ε", () => {
    const r = systemIterate({ ...base, x0: 1, y0: 1, step: (x, y) => [x / 16, y / 2] });
    expect(r.n).toBe(4);
    expect(r.iterations[4].dx).toBeLessThan(0.1);
  });

  it("always performs the first step, even when (x₁, y₁) = (x₀, y₀)", () => {
    const r = systemIterate({ ...base, x0: 3, y0: 4, step: (x, y) => [x, y] });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
  });

  it("fills F and G per row, leaving a cell empty where its function is undefined", () => {
    const r = systemIterate({
      ...base,
      F: compile("x + y", ["x", "y"]),
      G: compile("sqrt(y)", ["x", "y"]),
      x0: 1,
      y0: -4,
      eps: 2,
      step: (x, y) => [x, y + 8],
    });
    expect(r.iterations[0]).toMatchObject({ F: -3, G: null });
    expect(r.iterations[1]).toMatchObject({ F: 5, G: 2, dx: 0, dy: 8 });
  });

  it("re-throws an unexpected error from F or from a step", () => {
    const bug = () => {
      throw new Error("bug");
    };
    expect(() => systemIterate({ ...base, F: bug, x0: 1, y0: 1, step: (x, y) => [x, y] })).toThrow(
      "bug",
    );
    expect(() => systemIterate({ ...base, x0: 1, y0: 1, step: bug })).toThrow("bug");
  });

  it("passes step errors through with n and the whole point (xₙ, yₙ)", () => {
    const r = systemIterate({
      ...base,
      x0: 1,
      y0: 2,
      eps: 1e-12,
      step: (x, y) => {
        if (x < 0.3) throw new MethodStepError("zero-jacobian");
        return [x / 2, y / 2];
      },
    });
    expect(r.status).toBe("error");
    expect(r.result).toBeNull();
    expect(r.error).toEqual({ code: "zero-jacobian", n: 2, x: 0.25, y: 0.5 });
    expect(r.iterations).toHaveLength(3);
  });

  it("turns an evaluation error into its code", () => {
    const sqrt = compile("sqrt(x)", ["x", "y"]);
    const r = systemIterate({ ...base, x0: -1, y0: 0, step: (x, y) => [sqrt(x, y), y] });
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: -1, y: 0 });
    expect(r.iterations).toHaveLength(1);
  });

  it.each([
    [[Number.NaN, 1], "undefined-value"],
    [[1, Number.NaN], "undefined-value"],
    [[Number.POSITIVE_INFINITY, 1], "overflow"],
    [[1, Number.NEGATIVE_INFINITY], "overflow"],
  ] as const)("stops with %j → %s, in either component", (bad, code) => {
    const r = systemIterate({
      ...base,
      x0: 1,
      y0: 1,
      eps: 1e-4,
      step: (x, y) => (x < 0.6 ? bad : [x / 2, y / 2]),
    });
    expect(r.error).toEqual({ code, n: 1, x: 0.5, y: 0.5 });
    expect(r.iterations).toHaveLength(2);
  });

  it.each([
    ["x", (x: number, y: number) => [2 * x + 1, y] as const],
    ["y", (x: number, y: number) => [x, 2 * y + 1] as const],
  ])("detects divergence past 1e100 in %s", (_, step) => {
    const r = systemIterate({ ...base, x0: 1, y0: 1, eps: 1e-4, step });
    expect(r.status).toBe("error");
    expect(r.error?.code).toBe("diverged");
    const last = r.iterations[r.iterations.length - 1];
    expect(Math.max(Math.abs(last.x), Math.abs(last.y))).toBeGreaterThan(1e100);
    expect(r.error).toEqual({ code: "diverged", n: last.n, x: last.x, y: last.y });
  });

  it("stops at the cap with max-iterations and the last point", () => {
    const r = systemIterate({
      ...base,
      x0: 1,
      y0: 1,
      eps: 1e-12,
      maxIter: 3,
      step: (x, y) => [x / 2, y],
    });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(3);
    expect(r.result).toEqual({ x: 1 / 8, y: 1 });
  });
});
