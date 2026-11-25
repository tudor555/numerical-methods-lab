import type { Data } from "plotly.js-dist-min";
import type { FunctionPlot, SystemExactSolution, SystemPlot } from "@/labs/types";
import type { ScalarIterationRow, SystemIterationRow } from "@/lib/methods/types";

/** The data for one chart. Built here without Plotly so it can be tested; PlotlyInner draws it. */
export interface ChartSpec {
  traces: Data[];
  xTitle?: string;
  yTitle?: string;
  yLog?: boolean;
}

export interface ChartLabels {
  f: string;
  iterates: string;
  tangents: string;
  secants: string;
  steffensenSteps: string;
  halleySteps: string;
  chebyshevSteps: string;
  combinedSteps: string;
  phi: string;
  identity: string;
  path: string;
  diff: string;
  eps: string;
  error: string;
  curveF: string;
  curveG: string;
  diffY: string;
  systemError: string;
  curveFixedX: string;
  curveFixedY: string;
  diffZ: string;
  componentX: string;
  componentY: string;
  componentZ: string;
}

const COLORS = {
  accent: "#FF6A1A",
  secondary: "#7FD1FF",
  text: "#F3EEE9",
  muted: "#ABA298",
};

/** Iterates beyond this would squash the function chart, so they are left out of it. */
const PLOT_LIMIT = 1e6;

function plottable(rows: readonly ScalarIterationRow[]): ScalarIterationRow[] {
  return rows.filter((row) => Number.isFinite(row.x) && Math.abs(row.x) <= PLOT_LIMIT);
}

function xRange(xs: readonly number[], interval?: readonly [number, number]): [number, number] {
  // A loop, not Math.min(...xs): spreading ~10⁵ values overflows the call stack.
  let lo = Infinity;
  let hi = -Infinity;
  for (const x of interval ? [...xs, ...interval] : xs) {
    if (x < lo) lo = x;
    if (x > hi) hi = x;
  }
  if (hi - lo < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.08;
  return [lo - pad, hi + pad];
}

function sample(fn: (x: number) => number, [lo, hi]: [number, number], count = 400) {
  const xs: number[] = [];
  const ys: (number | null)[] = [];
  for (let i = 0; i <= count; i++) {
    const x = lo + ((hi - lo) * i) / count;
    let y: number | null;
    try {
      y = fn(x);
      if (!Number.isFinite(y)) y = null;
    } catch {
      y = null;
    }
    xs.push(x);
    ys.push(y);
  }
  return { xs, ys };
}

/** Points per curved step: enough for a smooth arc between two iterates. */
const STEP_SAMPLES = 32;

type StepPlot = Extract<FunctionPlot, { kind: "halley" | "chebyshev" }>;

/**
 * The curve a Halley or Chebyshev step follows from (x, fx) to (next, 0), or null when it can't be
 * drawn as a curve. Halley: the tangent hyperbola g(x) = (f + B·t)/(1 + C·t), t = x − xₙ, with
 * C = −f″/(2f′) and B = f′ + f·C, which matches f, f′ and f″ at xₙ. When 2f′² − f f″ < 0 its pole
 * lies between the two points. Chebyshev: the tangent parabola x(y) = xₙ + (y − f)/f′ −
 * f″(y − f)²/(2f′³), from y = f(xₙ) down to y = 0.
 */
function stepCurve(
  plot: StepPlot,
  x: number,
  fx: number,
  next: number,
): { xs: number[]; ys: number[] } | null {
  let d: number;
  let dd: number;
  try {
    d = plot.df(x);
    dd = plot.ddf(x);
  } catch {
    return null;
  }
  if (!Number.isFinite(d) || !Number.isFinite(dd) || d === 0) return null;
  const xs: number[] = [];
  const ys: number[] = [];
  if (plot.kind === "halley") {
    if (2 * d * d - fx * dd <= 0) return null;
    const c = -dd / (2 * d);
    const b = d + fx * c;
    for (let i = 0; i < STEP_SAMPLES; i++) {
      const t = ((next - x) * i) / STEP_SAMPLES;
      xs.push(x + t);
      ys.push((fx + b * t) / (1 + c * t));
    }
  } else {
    for (let i = 0; i < STEP_SAMPLES; i++) {
      const u = -fx * (i / STEP_SAMPLES); // y − f(xₙ), from 0 to −f(xₙ)
      xs.push(x + u / d - (dd * u * u) / (2 * d * d * d));
      ys.push(fx + u);
    }
  }
  if (!xs.every(Number.isFinite) || !ys.every(Number.isFinite)) return null;
  // The last point is the iterate itself, so the curve ends exactly on the axis at xₙ₊₁.
  xs.push(next);
  ys.push(0);
  return { xs, ys };
}

/**
 * The helper point of a combined tangent step: Newton's iterate yₙ = xₙ − f(xₙ)/f′(xₙ) and f(yₙ),
 * or null when f′(xₙ) is 0 or not finite, or f(yₙ) is undefined or not finite.
 */
function combinedHelper(
  plot: Extract<FunctionPlot, { kind: "combined-tangent" }>,
  x: number,
  fx: number,
): { y: number; fy: number } | null {
  try {
    const d = plot.df(x);
    if (!Number.isFinite(d) || d === 0) return null;
    const y = x - fx / d;
    const fy = plot.f(y);
    return Number.isFinite(y) && Number.isFinite(fy) ? { y, fy } : null;
  } catch {
    return null;
  }
}

const hoverIterate = "n = %{customdata}<br>x = %{x:.12g}<br>y = %{y:.6g}<extra></extra>";

/**
 * The function chart. For f it shows the iterates and, for each step, the line that produced xₙ₊₁:
 * Newton's tangent at xₙ, the secant through xₙ₋₁ and xₙ, Steffensen's step from xₙ straight to
 * the axis, or the arc of Halley's tangent hyperbola or Chebyshev's tangent parabola between
 * (xₙ, f(xₙ)) and (xₙ₊₁, 0); an arc that can't be drawn (a pole in between, f′ = 0 or undefined)
 * falls back to a straight step. A combined tangent step is two parallel segments: Newton's tangent
 * to (yₙ, 0), then the same slope from (yₙ, f(yₙ)) to (xₙ₊₁, 0), with a dotted line between them.
 * Steffensen's helper point xₙ + f(xₙ) is left out on purpose: it can land far outside [a, b] (at 7
 * in the lab's example) and would squash the rest of the chart.
 * For φ it shows y = x and the cobweb path.
 */
export function buildFunctionChart(
  plot: FunctionPlot,
  rows: readonly ScalarIterationRow[],
  labels: ChartLabels,
): ChartSpec | null {
  const points = plottable(rows);
  if (points.length === 0) return null;
  const range = xRange(
    points.map((r) => r.x),
    plot.kind === "cobweb" ? undefined : plot.interval,
  );

  if (plot.kind !== "cobweb") {
    const curve = sample(plot.f, range);
    const withValue = points.filter((r): r is ScalarIterationRow & { fx: number } => r.fx !== null);
    const stepX: (number | null)[] = [];
    const stepY: (number | null)[] = [];
    const dropX: (number | null)[] = [];
    const dropY: (number | null)[] = [];
    for (let i = 0; i + 1 < points.length; i++) {
      const from = points[i];
      const to = points[i + 1];
      if (from.fx === null || to.n !== from.n + 1) continue;
      if (plot.kind === "secant") {
        // x₁ is given, not computed, so the first chord ends at x₂ and x₁ gets no drop line.
        if (to.n === 1) continue;
        const before = points[i - 1];
        if (before && before.fx !== null && before.n === from.n - 1) {
          stepX.push(before.x, from.x, to.x, null);
          stepY.push(before.fx, from.fx, 0, null);
        }
      } else if (plot.kind === "combined-tangent") {
        const helper = combinedHelper(plot, from.x, from.fx);
        if (helper) {
          // Newton's tangent to (yₙ, 0), up or down to the curve, then the same slope to xₙ₊₁.
          stepX.push(from.x, helper.y, null, helper.y, to.x, null);
          stepY.push(from.fx, 0, null, helper.fy, 0, null);
          dropX.push(helper.y, helper.y, null);
          dropY.push(0, helper.fy, null);
        } else {
          stepX.push(from.x, to.x, null);
          stepY.push(from.fx, 0, null);
        }
      } else {
        const curve =
          plot.kind === "halley" || plot.kind === "chebyshev"
            ? stepCurve(plot, from.x, from.fx, to.x)
            : null;
        stepX.push(...(curve?.xs ?? [from.x, to.x]), null);
        stepY.push(...(curve?.ys ?? [from.fx, 0]), null);
      }
      if (to.fx !== null) {
        dropX.push(to.x, to.x, null);
        dropY.push(0, to.fx, null);
      }
    }
    const stepName = {
      tangent: labels.tangents,
      secant: labels.secants,
      steffensen: labels.steffensenSteps,
      halley: labels.halleySteps,
      chebyshev: labels.chebyshevSteps,
      "combined-tangent": labels.combinedSteps,
    }[plot.kind];
    return {
      xTitle: "x",
      yTitle: "y",
      traces: [
        {
          type: "scatter",
          mode: "lines",
          name: labels.f,
          x: curve.xs,
          y: curve.ys,
          line: { color: COLORS.accent, width: 2 },
          hovertemplate: "x = %{x:.6g}<br>f(x) = %{y:.6g}<extra></extra>",
        },
        {
          type: "scatter",
          mode: "lines",
          name: stepName,
          x: stepX,
          y: stepY,
          line: { color: COLORS.secondary, width: 1.5 },
          hoverinfo: "skip",
        },
        {
          type: "scatter",
          mode: "lines",
          showlegend: false,
          x: dropX,
          y: dropY,
          line: { color: COLORS.secondary, width: 1, dash: "dot" },
          hoverinfo: "skip",
        },
        {
          type: "scatter",
          mode: "markers",
          name: labels.iterates,
          x: withValue.map((r) => r.x),
          y: withValue.map((r) => r.fx),
          customdata: withValue.map((r) => r.n),
          marker: { color: COLORS.text, size: 7, line: { color: COLORS.accent, width: 1.5 } },
          hovertemplate: hoverIterate,
        },
      ],
    };
  }

  const curve = sample(plot.phi, range);
  const pathX: number[] = [];
  const pathY: number[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const from = points[i];
    const to = points[i + 1];
    if (to.n !== from.n + 1) break;
    pathX.push(from.x, from.x, to.x);
    pathY.push(from.x, to.x, to.x);
  }
  return {
    xTitle: "x",
    yTitle: "y",
    traces: [
      {
        type: "scatter",
        mode: "lines",
        name: labels.phi,
        x: curve.xs,
        y: curve.ys,
        line: { color: COLORS.accent, width: 2 },
        hovertemplate: "x = %{x:.6g}<br>φ(x) = %{y:.6g}<extra></extra>",
      },
      {
        type: "scatter",
        mode: "lines",
        name: labels.identity,
        x: range,
        y: range,
        line: { color: COLORS.muted, width: 1, dash: "dash" },
        hoverinfo: "skip",
      },
      {
        type: "scatter",
        mode: "lines",
        name: labels.path,
        x: pathX,
        y: pathY,
        line: { color: COLORS.secondary, width: 1.5 },
        hoverinfo: "skip",
      },
      {
        type: "scatter",
        mode: "markers",
        name: labels.iterates,
        x: points.map((r) => r.x),
        y: points.map((r) => r.x),
        customdata: points.map((r) => r.n),
        marker: { color: COLORS.text, size: 7, line: { color: COLORS.accent, width: 1.5 } },
        hovertemplate: hoverIterate,
      },
    ],
  };
}

/** |xₙ − xₙ₋₁| per iteration on a log scale, with ε as a reference line. */
export function buildConvergenceChart(
  rows: readonly ScalarIterationRow[],
  eps: number,
  labels: ChartLabels,
  exact?: number,
): ChartSpec | null {
  const steps = rows.filter((r) => r.diff !== null && r.diff > 0 && Number.isFinite(r.diff));
  if (steps.length === 0) return null;
  const lastN = rows[rows.length - 1].n;
  // A run that stops at n = 1 would give a zero-length line, so give it some width around n = 1.
  const epsSpan = lastN > 1 ? [1, lastN] : [0.5, 1.5];
  return {
    xTitle: "n",
    yTitle: labels.diff,
    yLog: true,
    traces: [
      {
        type: "scatter",
        mode: "lines+markers",
        name: labels.diff,
        x: steps.map((r) => r.n),
        y: steps.map((r) => r.diff),
        line: { color: COLORS.accent, width: 2 },
        marker: { color: COLORS.accent, size: 6 },
        hovertemplate: "n = %{x}<br>|xₙ − xₙ₋₁| = %{y:.3e}<extra></extra>",
      },
      {
        type: "scatter",
        mode: "lines",
        name: labels.eps,
        x: epsSpan,
        y: [eps, eps],
        line: { color: COLORS.muted, width: 1.5, dash: "dash" },
        hovertemplate: `ε = ${eps}<extra></extra>`,
      },
      ...(exact === undefined ? [] : [errorTrace(rows, exact, labels)]),
    ],
  };
}

/** |xₙ − exact| per iterate, for methods whose exact solution is known. Zero errors can't sit on a log axis. */
function errorTrace(rows: readonly ScalarIterationRow[], exact: number, labels: ChartLabels): Data {
  const points = rows
    .map((r) => ({ n: r.n, error: Math.abs(r.x - exact) }))
    .filter((p) => p.error > 0 && Number.isFinite(p.error));
  return {
    type: "scatter",
    mode: "lines+markers",
    name: labels.error,
    x: points.map((p) => p.n),
    y: points.map((p) => p.error),
    line: { color: COLORS.secondary, width: 2 },
    marker: { color: COLORS.secondary, size: 6 },
    hovertemplate: "n = %{x}<br>|xₙ − x*| = %{y:.3e}<extra></extra>",
  };
}

/** Grid points per axis for the F = 0 and G = 0 contours. */
const GRID = 80;

/** fn at (x, y), or null when it throws or is not finite. */
function finiteAt(fn: (x: number, y: number) => number, x: number, y: number): number | null {
  try {
    const z = fn(x, y);
    return Number.isFinite(z) ? z : null;
  } catch {
    return null;
  }
}

/**
 * F or G on the grid, row by row (z[j][i] at xs[i], ys[j]); a throwing or non-finite value is a
 * gap. A sign change between neighbouring cells that jumps through a pole (2/y across y = 0) is no
 * zero: when the midpoint is undefined or larger than both ends, both cells become gaps, so no
 * contour is drawn along the pole.
 */
function grid(
  fn: (x: number, y: number) => number,
  xs: readonly number[],
  ys: readonly number[],
): (number | null)[][] {
  const z = ys.map((y) => xs.map((x) => finiteAt(fn, x, y)));
  const blank: [number, number][] = [];
  const check = (j: number, i: number, j2: number, i2: number) => {
    const [a, b] = [z[j][i], z[j2][i2]];
    if (a === null || b === null || a * b >= 0) return;
    const mid = finiteAt(fn, (xs[i] + xs[i2]) / 2, (ys[j] + ys[j2]) / 2);
    if (mid === null || Math.abs(mid) > Math.max(Math.abs(a), Math.abs(b))) {
      blank.push([j, i], [j2, i2]);
    }
  };
  for (let j = 0; j < ys.length; j++) {
    for (let i = 0; i < xs.length; i++) {
      if (i + 1 < xs.length) check(j, i, j, i + 1);
      if (j + 1 < ys.length) check(j, i, j + 1, i);
    }
  }
  for (const [j, i] of blank) z[j][i] = null;
  return z;
}

function axis([lo, hi]: [number, number]): number[] {
  return Array.from({ length: GRID }, (_, i) => lo + ((hi - lo) * i) / (GRID - 1));
}

/**
 * The iteration path in the (x, y) plane over two curves whose crossing is the solution, drawn as
 * zero contours on a grid around the iterates: F = 0 and G = 0 for a system F = G = 0, or x = F(x, y)
 * and y = G(x, y) (the zero contours of x − F and y − G) for a fixed-point system. A system with
 * three unknowns has no such chart.
 */
export function buildPathChart(
  plot: SystemPlot,
  rows: readonly SystemIterationRow[],
  labels: ChartLabels,
): ChartSpec | null {
  if (plot.kind === "fixed-point-3d") return null;
  const points = rows.filter(
    (r) =>
      Number.isFinite(r.x) &&
      Number.isFinite(r.y) &&
      Math.abs(r.x) <= PLOT_LIMIT &&
      Math.abs(r.y) <= PLOT_LIMIT,
  );
  if (points.length === 0) return null;
  const xs = axis(xRange(points.map((r) => r.x)));
  const ys = axis(xRange(points.map((r) => r.y)));
  const curve = (fn: (x: number, y: number) => number, name: string, color: string): Data => ({
    type: "contour",
    name,
    x: xs,
    y: ys,
    z: grid(fn, xs, ys),
    contours: { start: 0, end: 0, size: 1, coloring: "none" },
    line: { color, width: 2 },
    showscale: false,
    showlegend: true,
    hoverinfo: "skip",
  });

  // A gap in n (an iterate left out above) breaks the line instead of joining across it.
  const pathX: (number | null)[] = [];
  const pathY: (number | null)[] = [];
  const pathN: (number | null)[] = [];
  points.forEach((r, i) => {
    if (i > 0 && r.n !== points[i - 1].n + 1) {
      pathX.push(null);
      pathY.push(null);
      pathN.push(null);
    }
    pathX.push(r.x);
    pathY.push(r.y);
    pathN.push(r.n);
  });

  return {
    xTitle: "x",
    yTitle: "y",
    traces: [
      ...(plot.kind === "system"
        ? [
            curve(plot.F, labels.curveF, COLORS.accent),
            curve(plot.G, labels.curveG, COLORS.secondary),
          ]
        : [
            curve((x, y) => x - plot.F(x, y), labels.curveFixedX, COLORS.accent),
            curve((x, y) => y - plot.G(x, y), labels.curveFixedY, COLORS.secondary),
          ]),
      {
        type: "scatter",
        mode: "lines+markers",
        name: labels.path,
        x: pathX,
        y: pathY,
        customdata: pathN,
        line: { color: COLORS.text, width: 1.5 },
        marker: { color: COLORS.text, size: 7, line: { color: COLORS.accent, width: 1.5 } },
        hovertemplate: "n = %{customdata}<br>x = %{x:.12g}<br>y = %{y:.12g}<extra></extra>",
      },
    ],
  };
}

/**
 * |xₙ − xₙ₋₁|, |yₙ − yₙ₋₁| (and |zₙ − zₙ₋₁| with three unknowns) per iteration on a log scale, with
 * ε as a reference line and, when the exact solution is known, max(|xₙ − x*|, |yₙ − y*|).
 */
export function buildSystemConvergenceChart(
  rows: readonly SystemIterationRow[],
  eps: number,
  labels: ChartLabels,
  exact?: SystemExactSolution,
): ChartSpec | null {
  // Each difference drops its own zero and non-finite points, which a log axis cannot show.
  const positive = (pick: (r: SystemIterationRow) => number | null) =>
    rows
      .map((r) => ({ n: r.n, value: pick(r) }))
      .filter(
        (p): p is { n: number; value: number } =>
          p.value !== null && p.value > 0 && Number.isFinite(p.value),
      );
  const dx = positive((r) => r.dx);
  const dy = positive((r) => r.dy);
  const hasZ = rows.some((r) => r.z !== undefined);
  const dz = hasZ ? positive((r) => r.dz ?? null) : [];
  if (dx.length === 0 && dy.length === 0 && dz.length === 0) return null;
  const lastN = rows[rows.length - 1].n;
  const epsSpan = lastN > 1 ? [1, lastN] : [0.5, 1.5];
  const series = (
    points: { n: number; value: number }[],
    name: string,
    color: string,
    hover: string,
    dash?: "dot",
  ): Data => ({
    type: "scatter",
    mode: "lines+markers",
    name,
    x: points.map((p) => p.n),
    y: points.map((p) => p.value),
    line: { color, width: 2, dash },
    marker: { color, size: 6 },
    hovertemplate: `n = %{x}<br>${hover} = %{y:.3e}<extra></extra>`,
  });
  const traces: Data[] = [
    series(dx, labels.diff, COLORS.accent, "|xₙ − xₙ₋₁|"),
    series(dy, labels.diffY, COLORS.text, "|yₙ − yₙ₋₁|"),
    ...(hasZ ? [series(dz, labels.diffZ, COLORS.secondary, "|zₙ − zₙ₋₁|", "dot")] : []),
    {
      type: "scatter",
      mode: "lines",
      name: labels.eps,
      x: epsSpan,
      y: [eps, eps],
      line: { color: COLORS.muted, width: 1.5, dash: "dash" },
      hovertemplate: `ε = ${eps}<extra></extra>`,
    },
  ];
  if (exact) {
    const error = positive((r) => Math.max(Math.abs(r.x - exact.x), Math.abs(r.y - exact.y)));
    traces.push(series(error, labels.systemError, COLORS.secondary, "max(|xₙ − x*|, |yₙ − y*|)"));
  }
  return { xTitle: "n", yLog: true, traces };
}

/**
 * xₙ, yₙ and zₙ against n, for a system with three unknowns, where no path chart fits on a plane.
 * Non-finite values are left out of their line.
 */
export function buildComponentsChart(
  rows: readonly SystemIterationRow[],
  labels: ChartLabels,
): ChartSpec | null {
  if (rows.length === 0) return null;
  const component = (
    pick: (r: SystemIterationRow) => number | undefined,
    name: string,
    color: string,
    symbol: string,
  ): Data => {
    const points = rows.flatMap((r) => {
      const value = pick(r);
      return value !== undefined && Number.isFinite(value) && Math.abs(value) <= PLOT_LIMIT
        ? [{ n: r.n, value }]
        : [];
    });
    return {
      type: "scatter",
      mode: "lines+markers",
      name,
      x: points.map((p) => p.n),
      y: points.map((p) => p.value),
      line: { color, width: 2 },
      marker: { color, size: 6 },
      hovertemplate: `n = %{x}<br>${symbol} = %{y:.12g}<extra></extra>`,
    };
  };
  return {
    xTitle: "n",
    traces: [
      component((r) => r.x, labels.componentX, COLORS.accent, "xₙ"),
      component((r) => r.y, labels.componentY, COLORS.text, "yₙ"),
      component((r) => r.z, labels.componentZ, COLORS.secondary, "zₙ"),
    ],
  };
}

/** Scales a [lo, hi] range around its centre: a factor below 1 zooms in, above 1 zooms out. */
export function zoomRange(range: readonly number[], factor: number): [number, number] {
  const [lo, hi] = range;
  const centre = (lo + hi) / 2;
  const half = ((hi - lo) / 2) * factor;
  return [centre - half, centre + half];
}

/** A PNG file name from the chart title: ASCII letters and digits joined by dashes. */
export function fileName(title: string): string {
  const slug = title
    // Spell out the Greek letters the chart titles use, so "φ(x)" keeps its meaning.
    .replace(/φ/g, " phi ")
    .replace(/ε/g, " epsilon ")
    .replace(/π/g, " pi ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return slug || "chart";
}
