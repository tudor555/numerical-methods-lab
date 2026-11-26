import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { solveCauchy, type CauchyStep } from "./cauchy";
import { MethodStepError } from "./types";

const xy = ["x", "y"];
/** yᵢ = yᵢ₋₁ + h·f(xᵢ₋₁, yᵢ₋₁), the simplest step, to test the driver on its own. */
const euler: CauchyStep = (f, x, y, h) => y + h * f(x, y);

describe("solveCauchy", () => {
  it("lays out n + 1 nodes xᵢ = x₀ + i·h and completes with yₙ", () => {
    const r = solveCauchy({ f: () => 1, x0: 2, y0: 0, T: 1, n: 4 }, euler);
    expect(r.status).toBe("completed");
    expect(r.n).toBe(4);
    expect(r.h).toBe(0.25);
    expect(r.rows).toEqual([
      { i: 0, x: 2, y: 0 },
      { i: 1, x: 2.25, y: 0.25 },
      { i: 2, x: 2.5, y: 0.5 },
      { i: 3, x: 2.75, y: 0.75 },
      { i: 4, x: 3, y: 1 },
    ]);
    expect(r.result).toBe(1);
    expect(r.error).toBeUndefined();
  });

  it("computes each xᵢ from i, so the last node is exactly x₀ + T", () => {
    const r = solveCauchy({ f: () => 0, x0: 0, y0: 0, T: 1, n: 10 }, euler);
    expect(r.rows[3].x).toBe(3 * 0.1);
    expect(r.rows[10].x).toBe(1);
  });

  it("passes the step the node it starts from and h", () => {
    const seen: number[][] = [];
    solveCauchy({ f: () => 0, x0: 1, y0: 5, T: 2, n: 2 }, (f, x, y, h) => {
      seen.push([x, y, h]);
      return y + 1;
    });
    expect(seen).toEqual([
      [1, 5, 1],
      [2, 6, 1],
    ]);
  });

  it("takes one step for n = 1", () => {
    const r = solveCauchy({ f: compile("y + x", xy), x0: 0, y0: 1, T: 1, n: 1 }, euler);
    expect(r.rows).toHaveLength(2);
    expect(r.result).toBe(2);
  });

  it("stops with undefined-value at the node the step started from, keeping the rows", () => {
    const r = solveCauchy({ f: compile("sqrt(y - 2)", xy), x0: 0, y0: 1, T: 1, n: 10 }, euler);
    expect(r.status).toBe("error");
    expect(r.result).toBeNull();
    expect(r.error).toEqual({ code: "undefined-value", i: 0, x: 0, y: 1 });
    expect(r.rows).toEqual([{ i: 0, x: 0, y: 1 }]);
  });

  it("reports a step that returns NaN or ±∞ without throwing", () => {
    const nan = solveCauchy({ f: () => 0, x0: 0, y0: 1, T: 1, n: 3 }, (f, x, y) =>
      x > 0 ? Number.NaN : y,
    );
    expect(nan.error).toMatchObject({ code: "undefined-value", i: 1 });
    expect(nan.rows).toHaveLength(2);
    const inf = solveCauchy({ f: () => 0, x0: 0, y0: 1, T: 1, n: 3 }, () => -Infinity);
    expect(inf.error).toEqual({ code: "overflow", i: 0, x: 0, y: 1 });
  });

  it("stops with overflow when f is ±∞ at a node", () => {
    const r = solveCauchy({ f: compile("1 / x", xy), x0: 0, y0: 1, T: 1, n: 2 }, euler);
    expect(r.error).toEqual({ code: "overflow", i: 0, x: 0, y: 1 });
  });

  it("stops with the code a step throws", () => {
    const r = solveCauchy({ f: () => 0, x0: 0, y0: 1, T: 1, n: 2 }, () => {
      throw new MethodStepError("undefined-value");
    });
    expect(r.error?.code).toBe("undefined-value");
  });

  it("lets any other error surface", () => {
    expect(() =>
      solveCauchy({ f: () => 0, x0: 0, y0: 1, T: 1, n: 2 }, () => {
        throw new TypeError("bug");
      }),
    ).toThrow("bug");
  });

  it("stops with diverged at the first node past 10¹⁰⁰, which it keeps", () => {
    const r = solveCauchy({ f: compile("y^2", xy), x0: 0, y0: 1, T: 10, n: 10 }, euler);
    expect(r.status).toBe("error");
    expect(r.error?.code).toBe("diverged");
    expect(r.error?.i).toBe(9);
    expect(r.error?.x).toBe(9);
    expect(r.error?.y).toBeCloseTo(1.6550664732452e104, -90);
    expect(r.rows.map((row) => row.i)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
