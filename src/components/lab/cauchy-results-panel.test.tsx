import { describe, expect, it, vi } from "vitest";
import type { CauchyNodeRow } from "@/lib/methods/types";
import { maxNodeError } from "./cauchy-results-panel";

vi.mock("./plotly-chart", () => ({ PlotlyChart: () => null }));

describe("maxNodeError", () => {
  const rows: CauchyNodeRow[] = [
    { i: 0, x: 0, y: 0 },
    { i: 1, x: 1, y: 1.5 },
    { i: 2, x: 2, y: 2 },
    { i: 3, x: 3, y: 3.25 },
  ];

  it("is the largest |y(xᵢ) − yᵢ|, wherever it falls", () => {
    expect(maxNodeError(rows, (x) => x)).toBe(0.5);
  });

  it("skips a node where the exact solution throws", () => {
    const exact = (x: number) => {
      if (x === 1) throw new Error("undefined");
      return x;
    };
    expect(maxNodeError(rows, exact)).toBe(0.25);
  });

  it("is null when the exact solution is undefined at every node", () => {
    expect(maxNodeError(rows, () => Number.NaN)).toBeNull();
    expect(maxNodeError([], (x) => x)).toBeNull();
  });
});
