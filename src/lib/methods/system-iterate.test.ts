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

describe("systemIterate without F and G columns", () => {
  it("leaves the F and G cells out of every row", () => {
    const r = systemIterate({ x0: 1, y0: 1, eps: 0.1, maxIter: 1000, step: (x, y) => [x / 2, y] });
    expect(r.iterations[0]).toEqual({ n: 0, x: 1, y: 1, dx: null, dy: null });
    for (const row of r.iterations) {
      expect(row).not.toHaveProperty("F");
      expect(row).not.toHaveProperty("G");
      expect(row).not.toHaveProperty("z");
    }
  });
});

describe("systemIterate with three unknowns", () => {
  const base3 = { x0: 1, y0: 1, maxIter: 1000 };

  it("adds zₙ and |zₙ − zₙ₋₁| to every row and keeps going while only dz is ≥ ε", () => {
    const r = systemIterate({
      ...base3,
      z0: 1,
      eps: 0.1,
      step: (x, y, z) => [x / 16, y / 16, z / 2],
    });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(4);
    expect(r.result).toEqual({ x: 1 / 65536, y: 1 / 65536, z: 1 / 16 });
    expect(r.iterations[0]).toEqual({ n: 0, x: 1, y: 1, z: 1, dx: null, dy: null, dz: null });
    expect(r.iterations[4]).toMatchObject({ z: 1 / 16, dz: 1 / 16 });
    expect(r.iterations[4].dx).toBeLessThan(0.1);
  });

  it("passes zₙ to the step and names the whole point (xₙ, yₙ, zₙ) in an error", () => {
    const seen: number[][] = [];
    const r = systemIterate({
      ...base3,
      z0: 3,
      eps: 1e-12,
      step: (x, y, z) => {
        seen.push([x, y, z]);
        if (x < 0.3) throw new MethodStepError("undefined-value");
        return [x / 2, y / 2, z / 2];
      },
    });
    expect(seen[0]).toEqual([1, 1, 3]);
    expect(r.error).toEqual({ code: "undefined-value", n: 2, x: 0.25, y: 0.25, z: 0.75 });
    expect(r.iterations).toHaveLength(3);
  });

  it.each([
    [[1, 1, Number.NaN], "undefined-value"],
    [[1, 1, Number.POSITIVE_INFINITY], "overflow"],
  ] as const)("stops on %j in z → %s", (bad, code) => {
    const r = systemIterate({
      ...base3,
      z0: 1,
      eps: 1e-4,
      step: (x, y, z) => (x < 0.6 ? bad : [x / 2, y / 2, z / 2]),
    });
    expect(r.error).toEqual({ code, n: 1, x: 0.5, y: 0.5, z: 0.5 });
  });

  it("detects divergence past 1e100 in z", () => {
    const r = systemIterate({ ...base3, z0: 1, eps: 1e-4, step: (x, y, z) => [x, y, 2 * z + 1] });
    expect(r.error?.code).toBe("diverged");
    const last = r.iterations[r.iterations.length - 1];
    expect(last.z).toBeGreaterThan(1e100);
    expect(r.error).toEqual({ code: "diverged", n: last.n, x: 1, y: 1, z: last.z });
  });

  it("stops at the cap with the last point (xₙ, yₙ, zₙ)", () => {
    const r = systemIterate({
      ...base3,
      z0: 1,
      eps: 1e-12,
      maxIter: 3,
      step: (x, y, z) => [x, y, z / 2],
    });
    expect(r.status).toBe("max-iterations");
    expect(r.result).toEqual({ x: 1, y: 1, z: 1 / 8 });
  });
});
