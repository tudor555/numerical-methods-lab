import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { solveCauchy } from "../cauchy";
import { euler, eulerHeun, modifiedEuler } from "./euler";

const xy = ["x", "y"];

/** Ex. 1: y′ = x² − y, y(0) = 1 on [0, 4], with y = x² − 2x + 2 − e⁻ˣ. */
const ex1 = { f: compile("x^2 - y", xy), x0: 0, y0: 1, T: 4 };
const ex1Exact = (x: number) => x * x - 2 * x + 2 - Math.exp(-x);

/** Ex. 2 and the numerical example: y′ = y + x, y(0) = 1 on [0, 1], with y = 2eˣ − x − 1. */
const ex2 = { f: compile("y + x", xy), x0: 0, y0: 1, T: 1 };
const ex2Exact = (x: number) => 2 * Math.exp(x) - x - 1;

describe("7a Euler", () => {
  it.each([
    [16, 9.7424831, 0.2392],
    [32, 9.8628026, 0.1189],
    [64, 9.9224293, 0.0593],
  ])("ex. 1 with n = %i reaches y = %f at x = 4, error %f", (n, yn, error) => {
    const r = solveCauchy({ ...ex1, n }, euler);
    expect(r.status).toBe("completed");
    expect(r.rows).toHaveLength(n + 1);
    expect(r.h).toBe(4 / n);
    expect(r.result).toBeCloseTo(yn, 7);
    expect(Math.abs(ex1Exact(4) - (r.result ?? Number.NaN))).toBeCloseTo(error, 4);
  });

  it("ex. 1 halves its error at x = 4 when h halves (order 1)", () => {
    const errors = [16, 32, 64].map((n) =>
      Math.abs(ex1Exact(4) - (solveCauchy({ ...ex1, n }, euler).result ?? Number.NaN)),
    );
    expect(errors[0] / errors[1]).toBeCloseTo(2, 0);
    expect(errors[1] / errors[2]).toBeCloseTo(2, 0);
  });

  it("ex. 2 gives y₁ = 1.1 and y₁₀ = 3.1874849, error 0.2490788 against y(1) = 3.4365637", () => {
    const r = solveCauchy({ ...ex2, n: 10 }, euler);
    expect(r.rows[1].y).toBeCloseTo(1.1, 12);
    expect(r.result).toBeCloseTo(3.1874849, 7);
    expect(ex2Exact(1)).toBeCloseTo(3.4365637, 7);
    // 0.24907874: the spec's 0.2490788 is the difference of the two rounded values.
    expect(ex2Exact(1) - (r.result ?? Number.NaN)).toBeCloseTo(0.2490788, 6);
  });

  it("takes one step for n = 1: y₁ = 2", () => {
    expect(solveCauchy({ ...ex2, n: 1 }, euler).result).toBe(2);
  });

  it("stops with undefined-value from node 0 for f = √(y − 2), keeping row 0", () => {
    const r = solveCauchy({ f: compile("sqrt(y - 2)", xy), x0: 0, y0: 1, T: 1, n: 10 }, euler);
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", i: 0, x: 0, y: 1 });
    expect(r.rows).toHaveLength(1);
  });

  it("diverges at i = 9 for f = y² (y₉ ≈ 1.66·10¹⁰⁴), keeping rows 0–9", () => {
    const r = solveCauchy({ f: compile("y^2", xy), x0: 0, y0: 1, T: 10, n: 10 }, euler);
    expect(r.error?.code).toBe("diverged");
    expect(r.error?.i).toBe(9);
    expect((r.error?.y ?? 0) / 1e104).toBeCloseTo(1.655, 3);
    expect(r.rows).toHaveLength(10);
  });
});

describe("7b modified Euler and 7c Euler–Heun", () => {
  it.each([
    ["7b", modifiedEuler],
    ["7c", eulerHeun],
  ] as const)(
    "%s on the numerical example gives y₁ = 1.11, y₁₀ = 3.4281617, error 0.0084020",
    (_, step) => {
      const r = solveCauchy({ ...ex2, n: 10 }, step);
      expect(r.status).toBe("completed");
      expect(r.rows[1].y).toBeCloseTo(1.11, 12);
      expect(r.result).toBeCloseTo(3.4281617, 7);
      expect(ex2Exact(1) - (r.result ?? Number.NaN)).toBeCloseTo(0.008402, 7);
    },
  );

  it("agree at every node on y′ = y + x, where each step multiplies y + x + 1 by 1 + h + h²/2", () => {
    const midpoint = solveCauchy({ ...ex2, n: 10 }, modifiedEuler).rows;
    const heun = solveCauchy({ ...ex2, n: 10 }, eulerHeun).rows;
    midpoint.forEach((row, i) => {
      expect(heun[i].y).toBeCloseTo(row.y, 12);
      expect(row.y + row.x + 1).toBeCloseTo(2 * 1.105 ** i, 12);
    });
  });

  it("differ on a nonlinear f, where the midpoint and the trapezoid weigh the slopes differently", () => {
    const f = compile("x^2 - y", xy);
    const a = solveCauchy({ f, x0: 0, y0: 1, T: 4, n: 16 }, modifiedEuler).result ?? 0;
    const b = solveCauchy({ f, x0: 0, y0: 1, T: 4, n: 16 }, eulerHeun).result ?? 0;
    expect(Math.abs(a - b)).toBeGreaterThan(1e-4);
  });

  it("evaluate the midpoint slope U at (xᵢ₋₁ + h/2, yᵢ₋₁ + (h/2)K) and K₂ at (xᵢ₋₁ + h, yᵢ₋₁ + hK₁)", () => {
    const calls: number[][] = [];
    const f = (x: number, y: number) => {
      calls.push([x, y]);
      return 2;
    };
    expect(modifiedEuler(f, 1, 3, 0.5)).toBe(4);
    expect(calls).toEqual([
      [1, 3],
      [1.25, 3.5],
    ]);
    calls.length = 0;
    expect(eulerHeun(f, 1, 3, 0.5)).toBe(4);
    expect(calls).toEqual([
      [1, 3],
      [1.5, 4],
    ]);
  });
});
