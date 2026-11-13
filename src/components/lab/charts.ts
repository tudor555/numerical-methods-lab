import type { Data } from "plotly.js-dist-min";
import type { FunctionPlot } from "@/labs/types";
import type { ScalarIterationRow } from "@/lib/methods/types";

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
  phi: string;
  identity: string;
  path: string;
  diff: string;
  eps: string;
  error: string;
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

const hoverIterate = "n = %{customdata}<br>x = %{x:.12g}<br>y = %{y:.6g}<extra></extra>";

/** f with its iterates and Newton's tangent steps, or φ with y = x and the cobweb path. */
export function buildFunctionChart(
  plot: FunctionPlot,
  rows: readonly ScalarIterationRow[],
  labels: ChartLabels,
): ChartSpec | null {
  const points = plottable(rows);
  if (points.length === 0) return null;
  const range = xRange(
    points.map((r) => r.x),
    plot.kind === "tangent" ? plot.interval : undefined,
  );

  if (plot.kind === "tangent") {
    const curve = sample(plot.f, range);
    const withValue = points.filter((r): r is ScalarIterationRow & { fx: number } => r.fx !== null);
    const tangentX: (number | null)[] = [];
    const tangentY: (number | null)[] = [];
    const dropX: (number | null)[] = [];
    const dropY: (number | null)[] = [];
    for (let i = 0; i + 1 < points.length; i++) {
      const from = points[i];
      const to = points[i + 1];
      if (from.fx === null || to.n !== from.n + 1) continue;
      tangentX.push(from.x, to.x, null);
      tangentY.push(from.fx, 0, null);
      if (to.fx !== null) {
        dropX.push(to.x, to.x, null);
        dropY.push(0, to.fx, null);
      }
    }
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
          name: labels.tangents,
          x: tangentX,
          y: tangentY,
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
