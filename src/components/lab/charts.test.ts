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
  secants: "secants",
  steffensenSteps: "steffensen",
  halleySteps: "halley",
  chebyshevSteps: "chebyshev",
  combinedSteps: "combined",
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

describe("buildFunctionChart, secant mode", () => {
  const plot: FunctionPlot = { kind: "secant", f: (x) => x * x - 2, interval: [1, 2] };
  // x₀ = 2 and x₁ = 1.4 are given; x₂ and x₃ are secant steps.
  const rows = [row(0, 2, 2), row(1, 1.4, -0.04), row(2, 1.41, -0.01), row(3, 1.414, -0.0006)];

  it("draws each chord from (xₙ₋₁, f(xₙ₋₁)) through (xₙ, f(xₙ)) to (xₙ₊₁, 0), none to x₁", () => {
    const chords = trace(buildFunctionChart(plot, rows, labels), "secants");
    expect(chords.x).toEqual([2, 1.4, 1.41, null, 1.4, 1.41, 1.414, null]);
    expect(chords.y).toEqual([2, -0.04, 0, null, -0.04, -0.01, 0, null]);
  });

  it("drops a dotted line to the curve only at computed iterates", () => {
    const drops = dropLines(buildFunctionChart(plot, rows, labels));
    expect(drops.x).toEqual([1.41, 1.41, null, 1.414, 1.414, null]);
  });

  it("marks every iterate, x₀ and x₁ included", () => {
    expect(trace(buildFunctionChart(plot, rows, labels), "iterates").customdata).toEqual([
      0, 1, 2, 3,
    ]);
  });

  it("skips a chord whose previous point has no f value or sits beyond the plot limit, keeping the drop line", () => {
    const gaps = [row(0, 2, null), row(1, 1.4, -0.04), row(2, 1.41, -0.01), row(3, 1.414, -0.0006)];
    expect(trace(buildFunctionChart(plot, gaps, labels), "secants").x).toEqual([
      1.4,
      1.41,
      1.414,
      null,
    ]);
    // The computed iterates keep their drop lines even where the chord is skipped.
    expect(dropLines(buildFunctionChart(plot, gaps, labels)).x).toEqual([
      1.41,
      1.41,
      null,
      1.414,
      1.414,
      null,
    ]);
    const far = [row(0, 1e7, 1e14), row(1, 1.4, -0.04), row(2, 1.41, -0.01)];
    const farSpec = buildFunctionChart(plot, far, labels);
    expect(trace(farSpec, "secants").x).toEqual([]);
    expect(dropLines(farSpec).x).toEqual([1.41, 1.41, null]);
  });
});

describe("buildFunctionChart, Steffensen mode", () => {
  const plot: FunctionPlot = { kind: "steffensen", f: (x) => x ** 3 - x - 1, interval: [1, 2] };
  const rows = [row(0, 2, 5), row(1, 1.92, 4.16), row(2, 1.84, 3.39)];

  it("draws each step from (xₙ, f(xₙ)) to (xₙ₊₁, 0), leaving out the auxiliary point xₙ + f(xₙ)", () => {
    const spec = buildFunctionChart(plot, rows, labels);
    const steps = trace(spec, "steffensen");
    expect(steps.x).toEqual([2, 1.92, null, 1.92, 1.84, null]);
    expect(steps.y).toEqual([5, 0, null, 4.16, 0, null]);
    // x₀ + f(x₀) = 7 would stretch the chart; the curve stays near [a, b].
    expect(Math.max(...(trace(spec, "f").x as number[]))).toBeLessThan(2.1);
  });
});

describe("buildFunctionChart, Halley mode", () => {
  const f = (x: number) => x * x - 2;
  const plot: FunctionPlot = {
    kind: "halley",
    f,
    df: (x) => 2 * x,
    ddf: () => 2,
    interval: [1, 2],
  };
  // Halley's x₁ from x₀ = 2 on ex. 1: 2 − 16/28.
  const x1 = 2 - 16 / 28;
  const rows = [row(0, 2, 2), row(1, x1, f(x1))];

  /** The points of each step, split at the nulls between steps. */
  const arcs = (spec: ChartSpec | null) => {
    const steps = trace(spec, "halley");
    const result: [number, number][][] = [[]];
    steps.x.forEach((x, i) => {
      if (x === null) result.push([]);
      else result[result.length - 1].push([x, steps.y[i] as number]);
    });
    return result.filter((arc) => arc.length > 0);
  };

  it("draws the tangent hyperbola from (xₙ, f(xₙ)) to (xₙ₊₁, 0)", () => {
    const [arc] = arcs(buildFunctionChart(plot, rows, labels));
    expect(arc.length).toBeGreaterThan(2);
    expect(arc[0]).toEqual([2, 2]);
    expect(arc[arc.length - 1]).toEqual([x1, 0]);
    // g(x) = (f + B·t)/(1 + C·t) with C = −f″/(2f′) = −1/4, B = f′ + f·C = 3.5.
    for (const [x, y] of arc.slice(0, -1)) {
      const t = x - 2;
      expect(y).toBeCloseTo((2 + 3.5 * t) / (1 - t / 4), 12);
    }
  });

  it("matches f, f′ and f″ at xₙ, and its last sampled point is already close to the axis", () => {
    const [arc] = arcs(buildFunctionChart(plot, rows, labels));
    const [, [xa, ya]] = arc;
    // One small step along the arc follows f to second order.
    expect(Math.abs(ya - f(xa))).toBeLessThan(Math.abs(xa - 2) ** 3);
    expect(Math.abs(arc[arc.length - 2][1])).toBeLessThan(0.1);
  });

  it("draws a straight step when 2f′² − f f″ < 0: the hyperbola's pole lies in between", () => {
    // At f = 2, f′ = 1, f″ = 20: 2·1 − 2·20 < 0.
    const pole: FunctionPlot = { ...plot, df: () => 1, ddf: () => 20 };
    expect(arcs(buildFunctionChart(pole, [row(0, 2, 2), row(1, 2.1, 2.41)], labels))).toEqual([
      [
        [2, 2],
        [2.1, 0],
      ],
    ]);
  });

  it("draws a straight step when f′ or f″ is undefined at xₙ", () => {
    const broken: FunctionPlot = {
      ...plot,
      ddf: () => {
        throw new Error("undefined");
      },
    };
    expect(trace(buildFunctionChart(broken, rows, labels), "halley").x).toEqual([2, x1, null]);
  });

  it("draws a straight step when f′(xₙ) is zero or not finite", () => {
    for (const df of [() => 0, () => Infinity]) {
      const flat: FunctionPlot = { ...plot, df };
      expect(trace(buildFunctionChart(flat, rows, labels), "halley").x).toEqual([2, x1, null]);
    }
  });
});

describe("buildFunctionChart, Chebyshev mode", () => {
  const f = (x: number) => x ** 3 - x - 1;
  const plot: FunctionPlot = {
    kind: "chebyshev",
    f,
    df: (x) => 3 * x * x - 1,
    ddf: (x) => 6 * x,
    interval: [1, 2],
  };
  const x1 = 2 - 5 / 11 - 300 / (2 * 11 ** 3);
  const rows = [row(0, 2, 5), row(1, x1, f(x1))];

  it("draws the tangent parabola x(y) from (xₙ, f(xₙ)) to (xₙ₊₁, 0)", () => {
    const steps = trace(buildFunctionChart(plot, rows, labels), "chebyshev");
    const last = steps.x.length - 2;
    expect([steps.x[0], steps.y[0]]).toEqual([2, 5]);
    expect([steps.x[last], steps.y[last]]).toEqual([x1, 0]);
    expect(steps.x[last + 1]).toBeNull();
    // x(y) = xₙ + (y − f)/f′ − f″(y − f)²/(2f′³), with f = 5, f′ = 11, f″ = 12.
    for (let i = 0; i < last; i++) {
      const u = (steps.y[i] as number) - 5;
      expect(steps.x[i]).toBeCloseTo(2 + u / 11 - (12 * u * u) / (2 * 11 ** 3), 12);
    }
    // The y values run from f(xₙ) down to 0, so the parabola is drawn sideways.
    expect(steps.y.slice(0, last + 1)).toEqual(
      [...steps.y.slice(0, last + 1)].sort((a, b) => b! - a!),
    );
  });

  it("draws the arc upward from a point below the axis, f(xₙ) < 0", () => {
    // From x = 1.2: f = −0.472, f′ = 3.32, f″ = 7.2.
    const x0 = 1.2;
    const f0 = f(x0);
    const next = x0 - f0 / 3.32 - (f0 * f0 * 7.2) / (2 * 3.32 ** 3);
    const steps = trace(
      buildFunctionChart(plot, [row(0, x0, f0), row(1, next, f(next))], labels),
      "chebyshev",
    );
    const last = steps.x.length - 2;
    expect([steps.x[0], steps.y[0]]).toEqual([x0, f0]);
    expect([steps.x[last], steps.y[last]]).toEqual([next, 0]);
    const ys = steps.y.slice(0, last + 1) as number[];
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1]);
  });

  it("draws a straight step when the parabola's points overflow", () => {
    // f′ = 10⁻¹²⁰ makes 2f′³ underflow to 0, so the curved x values are infinite.
    const steep: FunctionPlot = { ...plot, df: () => 1e-120 };
    expect(trace(buildFunctionChart(steep, rows, labels), "chebyshev").x).toEqual([2, x1, null]);
  });

  it("names the step trace for the legend", () => {
    const spec = buildFunctionChart(plot, rows, labels);
    expect(spec?.traces.map((t) => (t as Trace).name)).toContain("chebyshev");
  });
});

describe("buildFunctionChart, combined tangent mode", () => {
  const f = (x: number) => x * x - 2;
  const plot: FunctionPlot = { kind: "combined-tangent", f, df: (x) => 2 * x, interval: [1, 2] };
  // Ex. 1 from x₀ = 2: y₀ = 2 − 2/4 = 1.5, f(1.5) = 0.25, x₁ = 1.5 − 0.25/4.
  const x1 = 1.5 - 0.25 / 4;
  const rows = [row(0, 2, 2), row(1, x1, f(x1))];

  it("draws Newton's tangent to (yₙ, 0), then the same slope from (yₙ, f(yₙ)) to (xₙ₊₁, 0)", () => {
    const steps = trace(buildFunctionChart(plot, rows, labels), "combined");
    expect(steps.x).toEqual([2, 1.5, null, 1.5, x1, null]);
    expect(steps.y).toEqual([2, 0, null, 0.25, 0, null]);
    // Both segments have the slope f′(xₙ) = 4.
    const slope = (i: number) =>
      ((steps.y[i] as number) - (steps.y[i + 1] as number)) /
      ((steps.x[i] as number) - (steps.x[i + 1] as number));
    expect(slope(0)).toBe(4);
    expect(slope(3)).toBeCloseTo(4, 12);
  });

  it("joins (yₙ, 0) to (yₙ, f(yₙ)) in the dotted drop-line trace, before the drop at xₙ₊₁", () => {
    const drops = dropLines(buildFunctionChart(plot, rows, labels));
    expect(drops.x).toEqual([1.5, 1.5, null, x1, x1, null]);
    expect(drops.y).toEqual([0, 0.25, null, 0, f(x1), null]);
  });

  it("falls back to one straight step when f′(xₙ) is zero, not finite or undefined", () => {
    const throws = () => {
      throw new Error("undefined");
    };
    for (const df of [() => 0, () => Infinity, () => NaN, throws]) {
      const spec = buildFunctionChart({ ...plot, df }, rows, labels);
      expect(trace(spec, "combined").x).toEqual([2, x1, null]);
      expect(trace(spec, "combined").y).toEqual([2, 0, null]);
      expect(dropLines(spec).x).toEqual([x1, x1, null]);
    }
  });

  it("falls back to one straight step when f(yₙ) is undefined or not finite", () => {
    const at = (bad: (x: number) => number) => (x: number) => (x === 1.5 ? bad(x) : f(x));
    const throws = () => {
      throw new Error("undefined");
    };
    for (const broken of [at(() => NaN), at(() => Infinity), at(throws)]) {
      const spec = buildFunctionChart({ ...plot, f: broken }, rows, labels);
      expect(trace(spec, "combined").x).toEqual([2, x1, null]);
      expect(dropLines(spec).x).toEqual([x1, x1, null]);
    }
  });

  it("names the step trace for the legend", () => {
    const spec = buildFunctionChart(plot, rows, labels);
    expect(spec?.traces.map((t) => (t as Trace).name)).toContain("combined");
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
