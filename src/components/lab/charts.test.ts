import { describe, expect, it } from "vitest";
import type { FunctionPlot } from "@/labs/types";
import type { ScalarIterationRow } from "@/lib/methods/types";
import {
  buildConvergenceChart,
  buildFunctionChart,
  fileName,
  zoomRange,
  type ChartLabels,
  type ChartSpec,
} from "./charts";

const labels: ChartLabels = {
  f: "f",
  iterates: "iterates",
  tangents: "tangents",
  phi: "phi",
  identity: "identity",
  path: "path",
  diff: "diff",
  eps: "eps",
  error: "error",
};

interface Trace {
  name?: string;
  showlegend?: boolean;
  x: (number | null)[];
  y: (number | null)[];
  customdata?: number[];
}

function trace(spec: ChartSpec | null, name: string): Trace {
  const found = spec?.traces.find((t) => (t as Trace).name === name);
  if (!found) throw new Error(`no trace named ${name}`);
  return found as Trace;
}

/** The tangent chart's dotted drop lines are the one trace without a legend entry. */
function dropLines(spec: ChartSpec | null): Trace {
  const found = spec?.traces.find((t) => (t as Trace).showlegend === false);
  if (!found) throw new Error("no drop-line trace");
  return found as Trace;
}

const row = (n: number, x: number, fx: number | null = null): ScalarIterationRow => ({
  n,
  x,
  fx,
  diff: n === 0 ? null : 1,
});

describe("buildFunctionChart, tangent mode", () => {
  const plot: FunctionPlot = { kind: "tangent", f: (x) => x * x - 2 };
  const rows = [row(0, 2, 2), row(1, 1.5, 0.25), row(2, 1.4, -0.04)];

  it("draws one tangent per step, from (xₙ, f(xₙ)) to (xₙ₊₁, 0)", () => {
    const tangents = trace(buildFunctionChart(plot, rows, labels), "tangents");
    expect(tangents.x).toEqual([2, 1.5, null, 1.5, 1.4, null]);
    expect(tangents.y).toEqual([2, 0, null, 0.25, 0, null]);
  });

  it("drops a dotted line from (xₙ₊₁, 0) up or down to the curve", () => {
    const drops = dropLines(buildFunctionChart(plot, rows, labels));
    expect(drops.x).toEqual([1.5, 1.5, null, 1.4, 1.4, null]);
    expect(drops.y).toEqual([0, 0.25, null, 0, -0.04, null]);
  });

  it("marks each iterate at (xₙ, f(xₙ)) with n as hover data", () => {
    const iterates = trace(buildFunctionChart(plot, rows, labels), "iterates");
    expect(iterates.x).toEqual([2, 1.5, 1.4]);
    expect(iterates.y).toEqual([2, 0.25, -0.04]);
    expect(iterates.customdata).toEqual([0, 1, 2]);
  });

  it("skips rows where f(xₙ) is null: no marker, no tangent from them, no drop line to them", () => {
    const spec = buildFunctionChart(
      plot,
      [row(0, 2, 2), row(1, 1, null), row(2, 0.5, 0.1)],
      labels,
    );
    expect(trace(spec, "iterates").x).toEqual([2, 0.5]);
    expect(trace(spec, "tangents").x).toEqual([2, 1, null]);
    expect(dropLines(spec).x).toEqual([]);
  });

  it("leaves out iterates beyond ±1e6 and draws no tangent across the gap", () => {
    const spec = buildFunctionChart(plot, [row(0, 1, -1), row(1, 1e7, 1e14), row(2, 2, 2)], labels);
    expect(trace(spec, "iterates").x).toEqual([1, 2]);
    expect(trace(spec, "tangents").x).toEqual([]);
    expect(Math.max(...(trace(spec, "f").x as number[]))).toBeLessThan(3);
  });

  it("samples the curve at 401 points across the iterates plus 8% padding", () => {
    const curve = trace(buildFunctionChart(plot, [row(0, 1, -1), row(1, 2, 2)], labels), "f");
    expect(curve.x).toHaveLength(401);
    expect(curve.x[0]).toBeCloseTo(0.92, 12);
    expect(curve.x[400]).toBeCloseTo(2.08, 12);
  });

  it("widens the x-range to include the [a, b] interval", () => {
    const spec = buildFunctionChart({ ...plot, interval: [0, 3] }, rows, labels);
    const curve = trace(spec, "f");
    expect(curve.x[0]).toBeCloseTo(-0.24, 12);
    expect(curve.x[400]).toBeCloseTo(3.24, 12);
  });

  it("widens a single-point range by 1 on each side", () => {
    const curve = trace(buildFunctionChart(plot, [row(0, 5, 23)], labels), "f");
    expect(curve.x[0]).toBeCloseTo(3.84, 12);
    expect(curve.x[400]).toBeCloseTo(6.16, 12);
  });

  it("leaves gaps in the curve where f throws or is not finite", () => {
    const f = (x: number) => {
      if (x < -0.5) throw new Error("undefined");
      return x > 0.5 ? Infinity : x;
    };
    const curve = trace(
      buildFunctionChart({ kind: "tangent", f }, [row(0, -1, null), row(1, 1, null)], labels),
      "f",
    );
    expect(curve.y[0]).toBeNull();
    expect(curve.y[200]).toBeCloseTo(0, 12);
    expect(curve.y[400]).toBeNull();
  });
});

describe("buildFunctionChart, cobweb mode", () => {
  const plot: FunctionPlot = { kind: "cobweb", phi: (x) => Math.cos(x) };

  it("draws the path vertically to y = xₙ₊₁, then across to the diagonal", () => {
    const path = trace(
      buildFunctionChart(plot, [row(0, 1), row(1, 2), row(2, 1.5)], labels),
      "path",
    );
    expect(path.x).toEqual([1, 1, 2, 2, 2, 1.5]);
    expect(path.y).toEqual([1, 2, 2, 2, 1.5, 1.5]);
  });

  it("stops the path at the first gap in n", () => {
    const rows = [row(0, 1), row(1, 2), row(2, 1e7), row(3, 3)];
    const spec = buildFunctionChart(plot, rows, labels);
    expect(trace(spec, "path").x).toEqual([1, 1, 2]);
    expect(trace(spec, "iterates").customdata).toEqual([0, 1, 3]);
  });

  it("marks each iterate on the diagonal y = x", () => {
    const iterates = trace(buildFunctionChart(plot, [row(0, 1), row(1, 2)], labels), "iterates");
    expect(iterates.x).toEqual([1, 2]);
    expect(iterates.y).toEqual([1, 2]);
  });

  it("draws y = x across the full x-range", () => {
    const identity = trace(buildFunctionChart(plot, [row(0, 0), row(1, 1)], labels), "identity");
    expect(identity.x).toEqual(identity.y);
    expect(identity.x[0]).toBeCloseTo(-0.08, 12);
    expect(identity.x[1]).toBeCloseTo(1.08, 12);
  });
});

describe("buildFunctionChart with nothing to plot", () => {
  const plot: FunctionPlot = { kind: "tangent", f: (x) => x };

  it("returns null for no rows", () => {
    expect(buildFunctionChart(plot, [], labels)).toBeNull();
  });

  it("returns null when every iterate is beyond the plot limit or not finite", () => {
    expect(buildFunctionChart(plot, [row(0, 2e6), row(1, Number.NaN)], labels)).toBeNull();
  });
});

describe("buildConvergenceChart", () => {
  const diffRow = (n: number, diff: number | null): ScalarIterationRow => ({
    n,
    x: 0,
    fx: null,
    diff,
  });

  it("plots |xₙ − xₙ₋₁| against n on a log scale", () => {
    const spec = buildConvergenceChart(
      [diffRow(0, null), diffRow(1, 0.5), diffRow(2, 1e-3)],
      1e-4,
      labels,
    );
    expect(spec?.yLog).toBe(true);
    expect(trace(spec, "diff").x).toEqual([1, 2]);
    expect(trace(spec, "diff").y).toEqual([0.5, 1e-3]);
  });

  it("skips null, zero and non-finite differences, which a log axis cannot show", () => {
    const rows = [
      diffRow(0, null),
      diffRow(1, Infinity),
      diffRow(2, 0.1),
      diffRow(3, Number.NaN),
      diffRow(4, 0),
    ];
    expect(trace(buildConvergenceChart(rows, 1e-4, labels), "diff").x).toEqual([2]);
  });

  it("draws ε as a horizontal line from n = 1 to the last row", () => {
    const rows = [diffRow(0, null), diffRow(1, 0.5), diffRow(2, 0.01), diffRow(3, 0)];
    const eps = trace(buildConvergenceChart(rows, 1e-8, labels), "eps");
    expect(eps.x).toEqual([1, 3]);
    expect(eps.y).toEqual([1e-8, 1e-8]);
  });

  it("keeps the ε line visible when the run stops at n = 1", () => {
    const rows = [diffRow(0, null), diffRow(1, 0.5)];
    const eps = trace(buildConvergenceChart(rows, 1e-4, labels), "eps");
    expect(eps.x).toEqual([0.5, 1.5]);
  });

  it("returns null when no step has a positive, finite difference", () => {
    expect(buildConvergenceChart([], 1e-4, labels)).toBeNull();
    expect(buildConvergenceChart([diffRow(0, null), diffRow(1, 0)], 1e-4, labels)).toBeNull();
  });
});

describe("zoomRange", () => {
  it("zooms in around the centre with a factor below 1", () => {
    expect(zoomRange([0, 10], 0.5)).toEqual([2.5, 7.5]);
  });

  it("zooms out around the centre with a factor above 1", () => {
    expect(zoomRange([0, 10], 2)).toEqual([-5, 15]);
  });

  it("works on negative ranges, such as log10 units of a log axis", () => {
    expect(zoomRange([-12, -2], 0.5)).toEqual([-9.5, -4.5]);
  });

  it("leaves the range unchanged with a factor of 1", () => {
    expect(zoomRange([-3, 7], 1)).toEqual([-3, 7]);
  });
});

describe("fileName", () => {
  it("turns a title into a lower-case, dash-separated slug", () => {
    expect(fileName("f(x) with the tangent steps")).toBe("f-x-with-the-tangent-steps");
  });

  it("strips Romanian diacritics", () => {
    expect(fileName("Graficul lui f și tangentele succesive")).toBe(
      "graficul-lui-f-si-tangentele-succesive",
    );
    expect(fileName("Convergența: |xₙ − xₙ₋₁| pe scară logaritmică")).toBe(
      "convergenta-x-x-pe-scara-logaritmica",
    );
  });

  it("drops leading and trailing punctuation", () => {
    expect(fileName("  (Chart 1)!  ")).toBe("chart-1");
  });

  it("falls back to 'chart' when nothing usable is left", () => {
    expect(fileName("")).toBe("chart");
    expect(fileName(" — ")).toBe("chart");
  });

  it("spells out the Greek letters used in chart titles", () => {
    expect(fileName("φ(x), y = x and the iteration path")).toBe("phi-x-y-x-and-the-iteration-path");
    expect(fileName("φ — ε")).toBe("phi-epsilon");
  });
});

describe("buildConvergenceChart with a known exact solution", () => {
  const rows: ScalarIterationRow[] = [
    { n: 0, x: 0, fx: null, diff: null },
    { n: 1, x: 1, fx: null, diff: 1 },
    { n: 2, x: 2, fx: null, diff: 1 },
  ];

  it("adds an |xₙ − exact| line, one point per iterate, leaving out zero errors", () => {
    // With exact = 1 the error is zero at n = 1, which a log axis can't show.
    const spec = buildConvergenceChart(rows, 1e-4, labels, 1);
    const error = trace(spec, "error");
    expect(error.x).toEqual([0, 2]);
    expect(error.y).toEqual([1, 1]);
  });

  it("has no error line without an exact solution", () => {
    const spec = buildConvergenceChart(rows, 1e-4, labels);
    expect(spec?.traces.some((t) => (t as { name?: string }).name === "error")).toBe(false);
  });
});
