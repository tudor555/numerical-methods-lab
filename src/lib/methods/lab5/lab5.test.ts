import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { modifiedNewtonSystem, newtonSystem, type NewtonSystemInput } from "./newton-system";

const xy = ["x", "y"];
const MAX = 1000;
const EPS = [1e-4, 1e-8, 1e-12];

type System = Omit<NewtonSystemInput, "x0" | "y0" | "eps" | "maxIter">;

const system = (F: string, G: string, Fx: string, Fy: string, Gx: string, Gy: string): System => ({
  F: compile(F, xy),
  G: compile(G, xy),
  Fx: compile(Fx, xy),
  Fy: compile(Fy, xy),
  Gx: compile(Gx, xy),
  Gy: compile(Gy, xy),
});

const ex1 = system("2x^3 - y^2 - 1", "x y^3 - y - 4", "6x^2", "-2y", "y^3", "3x y^2 - 1");
const ex2 = system(
  "x^2 + y^2 - 10",
  "sqrt(x + y) - 2",
  "2x",
  "2y",
  "1 / (2 sqrt(x + y))",
  "1 / (2 sqrt(x + y))",
);

const methods = { "5a": newtonSystem, "5b": modifiedNewtonSystem };
const counts = (id: keyof typeof methods, sys: System, x0: number, y0: number) =>
  EPS.map((eps) => methods[id]({ ...sys, x0, y0, eps, maxIter: MAX }).n);

describe("5a Newton's method for systems", () => {
  it("ex. 1 from (1.2, 1.7) converges to (1.2342745, 1.6615265) in n = 3", () => {
    const r = newtonSystem({ ...ex1, x0: 1.2, y0: 1.7, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(3);
    expect(r.result?.x).toBeCloseTo(1.2342745, 7);
    expect(r.result?.y).toBeCloseTo(1.6615265, 7);
    expect(r.iterations[0]).toMatchObject({ n: 0, x: 1.2, y: 1.7, dx: null, dy: null });
  });

  it.each([
    [0.9, 3.1, { x: 1, y: 3 }, 1e-10],
    [2.9, 1.1, { x: 3, y: 1 }, 1e-9],
  ])("ex. 2 from (%s, %s) reaches %j in n = 3", (x0, y0, root, within) => {
    const r = newtonSystem({ ...ex2, x0, y0, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(3);
    expect(Math.abs((r.result?.x ?? 0) - root.x)).toBeLessThan(within);
    expect(Math.abs((r.result?.y ?? 0) - root.y)).toBeLessThan(within);
  });

  it("computes (x₁, y₁) from the formulas at (x₀, y₀)", () => {
    const r = newtonSystem({ ...ex2, x0: 0.9, y0: 3.1, eps: 1e-4, maxIter: MAX });
    const [F, G] = [0.81 + 9.61 - 10, 0];
    const [Fx, Fy, Gx, Gy] = [1.8, 6.2, 0.25, 0.25];
    const J = Fx * Gy - Fy * Gx;
    expect(r.iterations[1].x).toBeCloseTo(0.9 - (F * Gy - G * Fy) / J, 14);
    expect(r.iterations[1].y).toBeCloseTo(3.1 - (Fx * G - Gx * F) / J, 14);
  });
});

describe("The ε matrix of ex. 3", () => {
  it.each([
    ["5b", "ex. 2", ex2, 0.9, 3.1, [4, 8, 12]],
    ["5a", "ex. 2", ex2, 0.9, 3.1, [3, 4, 5]],
    ["5b", "ex. 2", ex2, 2.9, 1.1, [4, 9, 13]],
    ["5a", "ex. 2", ex2, 2.9, 1.1, [3, 4, 5]],
    ["5b", "ex. 1", ex1, 1.2, 1.7, [3, 6, 9]],
    ["5a", "ex. 1", ex1, 1.2, 1.7, [3, 4, 4]],
  ] as const)("%s on %s from (%s, %s) takes n = %j", (id, _, sys, x0, y0, expected) => {
    expect(counts(id, sys, x0, y0)).toEqual(expected);
  });

  it.each([
    [0.9, 3.1, { x: 1, y: 3 }],
    [2.9, 1.1, { x: 3, y: 1 }],
  ])("5b from (%s, %s) converges to %j within each ε", (x0, y0, root) => {
    for (const eps of EPS) {
      const r = modifiedNewtonSystem({ ...ex2, x0, y0, eps, maxIter: MAX });
      expect(r.status).toBe("converged");
      expect(Math.abs((r.result?.x ?? 0) - root.x)).toBeLessThan(eps);
      expect(Math.abs((r.result?.y ?? 0) - root.y)).toBeLessThan(eps);
    }
  });

  it("5b keeps the partial derivatives of (x₀, y₀): its second step differs from 5a's", () => {
    const newton = newtonSystem({ ...ex2, x0: 0.9, y0: 3.1, eps: 1e-12, maxIter: MAX });
    const modified = modifiedNewtonSystem({ ...ex2, x0: 0.9, y0: 3.1, eps: 1e-12, maxIter: MAX });
    expect(modified.iterations[1]).toEqual(newton.iterations[1]);
    expect(modified.iterations[2].x).not.toBe(newton.iterations[2].x);
  });

  it("5b evaluates the partial derivatives only at (x₀, y₀)", () => {
    const points: [number, number][] = [];
    const Fx = (x: number, y: number) => {
      points.push([x, y]);
      return 2 * x;
    };
    modifiedNewtonSystem({ ...ex2, Fx, x0: 0.9, y0: 3.1, eps: 1e-12, maxIter: MAX });
    expect(points).toEqual([[0.9, 3.1]]);
  });
});

describe.each([
  ["5a", newtonSystem],
  ["5b", modifiedNewtonSystem],
] as const)("%s edge cases", (_, method) => {
  it("stays at a root it starts on: (1, 3) gives (x₁, y₁) = (1, 3), converged at n = 1", () => {
    const r = method({ ...ex2, x0: 1, y0: 3, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.iterations[1]).toMatchObject({ x: 1, y: 3, F: 0, G: 0 });
  });

  it("stops with zero-jacobian at n = 0 and keeps row 0 (F = x + y, G = x + y − 1, (0, 0))", () => {
    const r = method({
      ...system("x + y", "x + y - 1", "1", "1", "1", "1"),
      x0: 0,
      y0: 0,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(r.status).toBe("error");
    expect(r.result).toBeNull();
    expect(r.error).toEqual({ code: "zero-jacobian", n: 0, x: 0, y: 0 });
    expect(r.iterations).toEqual([{ n: 0, x: 0, y: 0, F: 0, G: -1, dx: null, dy: null }]);
  });

  it("stops with undefined-value at (−5, −5) on ex. 2, keeping row 0 with an empty G cell", () => {
    const r = method({ ...ex2, x0: -5, y0: -5, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: -5, y: -5 });
    expect(r.iterations).toEqual([{ n: 0, x: -5, y: -5, F: 40, G: null, dx: null, dy: null }]);
  });

  it("reports overflow from F, and divergence once a component passes 10¹⁰⁰", () => {
    const overflow = method({
      ...system("exp(x) - 1", "y", "exp(x)", "0", "0", "1"),
      x0: 800,
      y0: 0,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(overflow.error).toEqual({ code: "overflow", n: 0, x: 800, y: 0 });
    // A wrong sign in ∂F/∂x pushes every step away from the root at 0.
    const diverged = method({
      ...system("x^2", "y", "-2x", "0", "0", "1"),
      x0: 1,
      y0: 0,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(diverged.status).toBe("error");
    expect(diverged.error?.code).toBe("diverged");
    expect(Math.abs(diverged.error?.x ?? 0)).toBeGreaterThan(1e100);
  });

  it("stops at the cap: maxIter = 2 on ex. 2 with ε = 10⁻¹²", () => {
    const r = method({ ...ex2, x0: 0.9, y0: 3.1, eps: 1e-12, maxIter: 2 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(2);
    expect(r.result).toEqual({ x: r.iterations[2].x, y: r.iterations[2].y });
  });
});
