import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import {
  gaussSeidel2,
  gaussSeidel3,
  successiveApproximations,
  type FixedPointSystemInput,
} from "./successive-approximations";

const xy = ["x", "y"];
const xyz = ["x", "y", "z"];
const MAX = 1000;
const EPS = [1e-4, 1e-8, 1e-12];

type System = Pick<FixedPointSystemInput, "F" | "G">;

const system = (F: string, G: string): System => ({ F: compile(F, xy), G: compile(G, xy) });

const ex1 = system("sqrt((x * (y + 5) - 1) / 2)", "sqrt(x + 3 lg(x))");

/** Ex. 2's four ways of writing x² + y² = 5, xy = 2, one per solution, each from its preset start. */
const ex2 = [
  ["near (2, 1)", system("sqrt(5 - y^2)", "2 / x"), { x: 2, y: 1 }, 1.5],
  ["near (1, 2)", system("2 / y", "sqrt(5 - x^2)"), { x: 1, y: 2 }, 1.5],
  ["near (−1, −2)", system("2 / y", "-sqrt(5 - x^2)"), { x: -1, y: -2 }, -1.5],
  ["near (−2, −1)", system("-sqrt(5 - y^2)", "2 / x"), { x: -2, y: -1 }, -1.5],
] as const;
const near21 = ex2[0][1];

const ex3 = {
  F1: compile("sqrt(0.5 (y z + 5x - 1))", xyz),
  F2: compile("sqrt(2x + ln(z))", xyz),
  F3: compile("sqrt(x y + 2z + 8)", xyz),
};

describe("6a successive approximations", () => {
  it("ex. 1 from (3.5, 2.2) converges to (3.4872672, 2.2615452) in n = 9", () => {
    const r = successiveApproximations({ ...ex1, x0: 3.5, y0: 2.2, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(9);
    expect(r.result?.x).toBeCloseTo(3.4872672, 7);
    expect(r.result?.y).toBeCloseTo(2.2615452, 7);
    // The lab's (x₆, y₆) ≈ (3.487, 2.262), within a unit of its last digit.
    expect(Math.abs(r.iterations[6].x - 3.487)).toBeLessThan(1e-3);
    expect(Math.abs(r.iterations[6].y - 2.262)).toBeLessThan(1e-3);
  });

  it("has no F or G columns: F and G are the iteration itself", () => {
    const r = successiveApproximations({ ...ex1, x0: 3.5, y0: 2.2, eps: 1e-4, maxIter: MAX });
    expect(r.iterations[0]).toEqual({ n: 0, x: 3.5, y: 2.2, dx: null, dy: null });
    expect(r.iterations[1]).not.toHaveProperty("F");
    expect(r.iterations[1]).not.toHaveProperty("z");
  });

  it.each(ex2)(
    "ex. 2 %s reaches it within 7·10⁻⁵ in n = 14, every step in its quadrant",
    (_, sys, root, start) => {
      const r = successiveApproximations({ ...sys, x0: start, y0: start, eps: 1e-4, maxIter: MAX });
      expect(r.status).toBe("converged");
      expect(r.n).toBe(14);
      expect(Math.abs((r.result?.x ?? 0) - root.x)).toBeLessThan(7e-5);
      expect(Math.abs((r.result?.y ?? 0) - root.y)).toBeLessThan(7e-5);
      for (const { x, y } of r.iterations) {
        expect([Math.sign(x), Math.sign(y)]).toEqual([Math.sign(root.x), Math.sign(root.y)]);
      }
    },
  );

  it("takes both new components from the old point", () => {
    const r = successiveApproximations({ ...near21, x0: 1.5, y0: 1.5, eps: 1e-4, maxIter: MAX });
    const [one, two] = [r.iterations[1], r.iterations[2]];
    expect(one).toMatchObject({ x: Math.sqrt(5 - 2.25), y: 2 / 1.5 });
    expect(two.x).toBeCloseTo(Math.sqrt(5 - one.y ** 2), 14);
    expect(two.y).toBeCloseTo(2 / one.x, 14);
  });
});

describe("6b Gauss–Seidel with three equations", () => {
  it("ex. 3 from (10, 10, 10) converges to (4.5298512, 3.2913483, 5.8897793) in n = 14", () => {
    const r = gaussSeidel3({ ...ex3, x0: 10, y0: 10, z0: 10, eps: 1e-3, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(14);
    expect(r.result?.x).toBeCloseTo(4.5298512, 7);
    expect(r.result?.y).toBeCloseTo(3.2913483, 7);
    expect(r.result?.z).toBeCloseTo(5.8897793, 7);
    expect(r.iterations[0]).toEqual({
      n: 0,
      x: 10,
      y: 10,
      z: 10,
      dx: null,
      dy: null,
      dz: null,
    });
  });

  it("computes (x₁, y₁, z₁) from the start only, then uses each new component at once", () => {
    const r = gaussSeidel3({ ...ex3, x0: 10, y0: 10, z0: 10, eps: 1e-3, maxIter: MAX });
    const [one, two] = [r.iterations[1], r.iterations[2]];
    expect(one.x).toBeCloseTo(ex3.F1(10, 10, 10), 14);
    expect(one.y).toBeCloseTo(ex3.F2(10, 10, 10), 14);
    expect(one.z).toBeCloseTo(ex3.F3(10, 10, 10), 14);
    const z1 = one.z ?? Number.NaN;
    expect(two.x).toBeCloseTo(ex3.F1(one.x, one.y, z1), 14);
    expect(two.y).toBeCloseTo(ex3.F2(two.x, one.y, z1), 14);
    expect(two.z).toBeCloseTo(ex3.F3(two.x, two.y, z1), 14);
  });

  it("stops with undefined-value from (−10, −10, −10), keeping row 0", () => {
    const r = gaussSeidel3({ ...ex3, x0: -10, y0: -10, z0: -10, eps: 1e-3, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: -10, y: -10, z: -10 });
    expect(r.iterations).toHaveLength(1);
  });
});

describe("6c Gauss–Seidel with two equations", () => {
  it("ex. 4 from (1.5, 1.5) converges to (1.99998, 1.00001) in n = 9", () => {
    const r = gaussSeidel2({ ...near21, x0: 1.5, y0: 1.5, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(9);
    expect(r.result?.x).toBeCloseTo(1.99998, 5);
    expect(r.result?.y).toBeCloseTo(1.00001, 5);
  });

  it("computes (x₁, y₁) as 6a does, then takes G at the new x", () => {
    const seidel = gaussSeidel2({ ...near21, x0: 1.5, y0: 1.5, eps: 1e-4, maxIter: MAX });
    const plain = successiveApproximations({
      ...near21,
      x0: 1.5,
      y0: 1.5,
      eps: 1e-4,
      maxIter: MAX,
    });
    expect(seidel.iterations[1]).toEqual(plain.iterations[1]);
    const [one, two] = [seidel.iterations[1], seidel.iterations[2]];
    expect(two.x).toBeCloseTo(Math.sqrt(5 - one.y ** 2), 14);
    expect(two.y).toBeCloseTo(2 / two.x, 14);
  });
});

describe("The ε matrix of ex. 4", () => {
  it.each([
    ["6c", "9/16/22", gaussSeidel2, [9, 16, 22]],
    ["6a", "14/27/40", successiveApproximations, [14, 27, 40]],
  ] as const)("%s near (2, 1) from (1.5, 1.5) takes n = %s", (_, _counts, method, expected) => {
    const counts = EPS.map((eps) => method({ ...near21, x0: 1.5, y0: 1.5, eps, maxIter: MAX }).n);
    expect(counts).toEqual(expected);
  });
});

describe.each([
  ["6a", successiveApproximations],
  ["6c", gaussSeidel2],
] as const)("%s edge cases", (_, method) => {
  it("stays at a solution it starts on: (2, 1) gives (x₁, y₁) = (2, 1), converged at n = 1", () => {
    const r = method({ ...near21, x0: 2, y0: 1, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.iterations[1]).toMatchObject({ x: 2, y: 1, dx: 0, dy: 0 });
  });

  it("stops with undefined-value from (3, 3), keeping row 0", () => {
    const r = method({ ...near21, x0: 3, y0: 3, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: 3, y: 3 });
    expect(r.iterations).toEqual([{ n: 0, x: 3, y: 3, dx: null, dy: null }]);
  });

  it("diverges on F = 2x, G = 2y from (1, 1), keeping the row past 10¹⁰⁰", () => {
    const r = method({ ...system("2x", "2y"), x0: 1, y0: 1, eps: 1e-4, maxIter: MAX });
    expect(r.status).toBe("error");
    expect(r.error?.code).toBe("diverged");
    const last = r.iterations[r.iterations.length - 1];
    expect(last.x).toBeGreaterThan(1e100);
    expect(r.error).toEqual({ code: "diverged", n: last.n, x: last.x, y: last.y });
  });

  it("stops at the cap: maxIter = 10 on F = 2x, G = 2y", () => {
    const r = method({ ...system("2x", "2y"), x0: 1, y0: 1, eps: 1e-4, maxIter: 10 });
    expect(r.status).toBe("max-iterations");
    expect(r.n).toBe(10);
    expect(r.result).toEqual({ x: 1024, y: 1024 });
  });
});
