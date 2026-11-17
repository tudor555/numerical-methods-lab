import { describe, expect, it, vi } from "vitest";
import { lab1 } from "@/labs/lab-1";
import { lab2 } from "@/labs/lab-2";
import { lab3 } from "@/labs/lab-3";
import type { RunView } from "@/labs/lab-state";
import type { FieldValues } from "@/labs/types";
import { formatValue } from "@/lib/format";
import { elements, render, textOf } from "@/test/render";
import type { ChartSpec } from "./charts";
import { ResultsPanel } from "./results-panel";

// Plotly needs a browser: the stub renders the chart title, and the trace names as an attribute.
vi.mock("./plotly-chart", () => ({
  PlotlyChart: ({ title, spec }: { title: string; spec: ChartSpec }) => (
    <figure data-traces={spec.traces.map((t) => (t as { name?: string }).name ?? "").join("|")}>
      {title}
    </figure>
  ),
}));

const allMethods = [...lab1.methods, ...lab2.methods, ...lab3.methods];

/** Prepares and runs a Lab 1, 2 or 3 method like the page does. */
function view(methodId: string, patch: FieldValues = {}): RunView {
  const method = allMethods.find((m) => m.id === methodId);
  if (!method) throw new Error(methodId);
  const prepared = method.prepare({ ...method.defaults, ...patch });
  if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
  const { run, plot, eps, exact } = prepared.prepared;
  return { result: run(), plot, eps, exact };
}

function panel(run: RunView, lang: "en" | "ro" = "en", valueColumn = "f(x_n)"): string {
  return render(<ResultsPanel view={run} valueColumn={valueColumn} />, lang);
}

/** The status box message. */
const message = (html: string) => textOf(elements(html, "p")[0]);

/** The three stat tiles: label text and value. */
const stats = (html: string) =>
  [
    ...html.matchAll(
      /<div class="text-muted-foreground text-sm">([\s\S]*?)<\/div><div class="mt-2[^"]*">([\s\S]*?)<\/div>/g,
    ),
  ].map(([, label, value]) => ({ label: textOf(label), value: textOf(value) }));

const figures = (html: string) => elements(html, "figure").map(textOf);

/** Legend names of the first chart's traces. */
const traceNames = (html: string) => (/data-traces="([^"]*)"/.exec(html)?.[1] ?? "").split("|");

const ex1 = view("1a");
const capped = view("1a", { eps: "1e-12", maxIter: "3" });
const ex2R0 = view("1a", { f: "x^5 - 5x + 1", df: "5x^4 - 5", a: "-1", b: "1", dda: "-20" });
// Rule R0 with f(a) undefined: no iterate at all.
const noRows = view("1a", { f: "sqrt(x)", df: "1/(2 sqrt(x))", a: "-1", b: "1", dda: "1" });

describe("ResultsPanel", () => {
  it("reports a converged run with its stats, charts and table", () => {
    const html = panel(ex1);
    expect(html).toContain('role="status"');
    expect(html).toContain("lucide-circle-check");
    expect(message(html)).toBe("|xₙ − xₙ₋₁| < ε after n = 5 iterations.");
    const [value, n, start] = stats(html);
    expect(value.value).toBe(formatValue(ex1.result.result as number));
    expect(value.value).toMatch(/^1\.32471795724/);
    expect(n.value).toBe("5");
    expect(start.value).toBe("2");
    expect(start.label).toContain("chosen by R0 (x₀ = b)");
    expect(figures(html)).toEqual([
      "f(x) with the tangent steps",
      "Convergence: |xₙ − xₙ₋₁| on a log scale",
    ]);
    expect(textOf(html)).toContain("Iterations");
    expect(elements(html.slice(html.indexOf("<tbody")), "tr")).toHaveLength(6);
  });

  it("reports the iteration cap as a warning, with the last iterate", () => {
    const html = panel(capped);
    expect(html).toContain('role="alert"');
    expect(html).toContain("lucide-triangle-alert");
    expect(message(html)).toMatch(/^Stopped at the cap of 3 iterations/);
    expect(stats(html)[1].value).toBe("3");
    expect(stats(html)[0].value).toBe(formatValue(capped.result.result as number));
  });

  it("reports an error, keeps the partial rows and highlights the failing row", () => {
    const html = panel(ex2R0);
    expect(html).toContain('role="alert"');
    expect(html).toContain("lucide-octagon-x");
    expect(message(html)).toBe(
      "The derivative is zero at n = 0, xₙ = 1. The step divides by zero, so xₙ₊₁ is undefined. " +
        "The iterations computed before the error are kept below.",
    );
    const [value, n, start] = stats(html);
    expect(value.value).toBe("—");
    expect(n.value).toBe("0");
    expect(start.value).toBe("1");
    expect(start.label).toContain("chosen by R0 (x₀ = b)");
    const rows = elements(html.slice(html.indexOf("<tbody")), "tr");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toContain("bg-error/10");
  });

  it("leaves out the partial-rows sentence, the table and the charts when there are no rows", () => {
    expect(noRows.result.iterations).toEqual([]);
    const html = panel(noRows);
    expect(message(html)).toBe(
      "A value is undefined (NaN) in the step from n = 0, xₙ = -1. Check the domain of the " +
        "functions (√ of a negative number, ln of a non-positive one).",
    );
    expect(html).not.toContain("<table");
    expect(figures(html)).toEqual([]);
    expect(stats(html).map((s) => s.value)).toEqual(["—", "0", "—"]);
  });

  it("does not mention rule R0 for a manual x₀", () => {
    const manual = view("1a", { x0Mode: "manual", x0: "1.5" });
    expect(manual.result.x0Rule).toBeUndefined();
    const [, , start] = stats(panel(manual));
    expect(start.value).toBe("1.5");
    expect(start.label).not.toContain("R0");
  });

  it("titles the cobweb chart for successive approximations and drops the f(xₙ) column", () => {
    const html = render(<ResultsPanel view={view("1c")} />);
    expect(figures(html)[0]).toBe("φ(x), y = x and the iteration path");
    expect(elements(html, "th")).toHaveLength(3);
  });

  it("uses the Romanian wording", () => {
    const converged = panel(ex1, "ro");
    expect(message(converged)).toBe(
      "Precizia dorită a fost atinsă la iterația n = 5: |xₙ − xₙ₋₁| < ε.",
    );
    expect(textOf(converged)).toContain("Converge");
    expect(stats(converged)[2].label).toContain("aleasă prin regula R0 (x₀ = b)");
    expect(figures(converged)).toEqual([
      "Graficul lui f și tangentele succesive",
      "Convergența: |xₙ − xₙ₋₁| pe scară logaritmică",
    ]);
    expect(textOf(converged)).toContain("Tabelul iterațiilor");

    const failed = panel(ex2R0, "ro");
    expect(message(failed)).toMatch(/^Derivata se anulează la n = 0, în xₙ = 1/);
    expect(message(failed)).toMatch(/Iterațiile calculate până la eroare sunt afișate mai jos\.$/);
  });
});

describe("ResultsPanel with a known exact solution (CAP-5)", () => {
  it("shows the exact value ᵏ√c and the final error for the k-th root", () => {
    const html = panel(view("1b", { c: "2", k: "2", eps: "1e-8" }), "en", "x_n^{\\,k} - c");
    const tiles = stats(html);
    expect(tiles.map((t) => t.label)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Exact value"),
        expect.stringContaining("Error"),
      ]),
    );
    const exactTile = tiles.find((t) => t.label.startsWith("Exact value"));
    expect(exactTile?.value).toBe(formatValue(Math.SQRT2));
    const errorTile = tiles.find((t) => t.label.startsWith("Error"));
    expect(Number(errorTile?.value)).toBeLessThan(1e-8);
  });

  it("speaks Romanian", () => {
    const text = textOf(panel(view("1b", { c: "12", k: "3" }), "ro"));
    expect(text).toContain("Valoarea exactă");
    expect(text).toContain("Eroarea");
  });

  it("shows no exact-value tiles for methods without a known exact solution", () => {
    const text = textOf(panel(view("1a")));
    expect(text).not.toContain("Exact value");
  });
});

describe("ResultsPanel for Lab 2", () => {
  it.each([
    ["2a", "en", "f(x) with the secant lines"],
    ["2b", "en", "f(x) with the Steffensen steps"],
    ["2a", "ro", "Graficul lui f și secantele succesive"],
    ["2b", "ro", "Graficul lui f și pașii metodei lui Steffensen"],
  ] as const)("titles the %s function chart in %s", (methodId, lang, title) => {
    expect(figures(panel(view(methodId), lang))[0]).toBe(title);
  });

  it.each([
    ["2a", "en", "Secant lines"],
    ["2b", "en", "Steffensen steps"],
    ["2a", "ro", "Secante"],
    ["2b", "ro", "Pașii metodei lui Steffensen"],
  ] as const)("names the %s step trace in %s", (methodId, lang, name) => {
    expect(traceNames(panel(view(methodId), lang))[1]).toBe(name);
  });

  it("shows the Steffensen start as chosen by rule R0", () => {
    const [, n, start] = stats(panel(view("2b")));
    expect(n.value).toBe("11");
    expect(start.value).toBe("2");
    expect(start.label).toContain("chosen by R0 (x₀ = b)");
  });

  it("explains a zero denominator and keeps the partial table", () => {
    const failed = view("2a", { f: "x^2", a: "-2", b: "2", x0: "1", x1: "-1" });
    const html = panel(failed);
    expect(message(html)).toBe(
      "The denominator is zero at n = 1, xₙ = -1: f takes the same value at both points, so xₙ₊₁ " +
        "is undefined. The iterations computed before the error are kept below.",
    );
    expect(elements(html.slice(html.indexOf("<tbody")), "tr")).toHaveLength(2);
    expect(message(panel(failed, "ro"))).toMatch(/^Numitorul se anulează la n = 1, în xₙ = -1/);
  });
});

describe("ResultsPanel for Lab 3", () => {
  const halley = allMethods.find((m) => m.id === "3a");

  it.each([
    ["3a", "en", "f(x) with Halley's tangent hyperbolas", "Tangent hyperbolas"],
    ["3b", "en", "f(x) with Chebyshev's tangent parabolas", "Tangent parabolas"],
    ["3a", "ro", "Graficul lui f și hiperbolele tangente", "Hiperbole tangente"],
    ["3b", "ro", "Graficul lui f și parabolele tangente", "Parabole tangente"],
  ] as const)(
    "titles the %s function chart in %s and names its steps",
    (methodId, lang, title, name) => {
      const html = panel(view(methodId), lang);
      expect(figures(html)).toEqual([
        title,
        lang === "en"
          ? "Convergence: |xₙ − xₙ₋₁| on a log scale"
          : "Convergența: |xₙ − xₙ₋₁| pe scară logaritmică",
      ]);
      expect(traceNames(html)[1]).toBe(name);
    },
  );

  it("shows the Halley preset's x₀ = 2 as entered, and R0's pick when chosen", () => {
    const [, n, start] = stats(panel(view("3a")));
    expect(n.value).toBe("3");
    expect(start.value).toBe("2");
    expect(start.label).not.toContain("R0");
    const [, , byRule] = stats(panel(view("3a", { x0Mode: "r0", x0: "" })));
    expect(byRule.label).toContain("chosen by R0 (x₀ = b)");
  });

  it("names Halley's own denominator when it is zero, and keeps row 0", () => {
    const failed = view("3a", { f: "x - 1", df: "1", ddf: "2", a: "0" });
    const html = render(
      <ResultsPanel view={failed} valueColumn="f(x_n)" errorKeys={halley?.errorKeys} />,
    );
    expect(message(html)).toBe(
      "The denominator 2f′(xₙ)² − f(xₙ)f″(xₙ) is zero at n = 0, xₙ = 2, so xₙ₊₁ is undefined. " +
        "The iterations computed before the error are kept below.",
    );
    expect(elements(html.slice(html.indexOf("<tbody")), "tr")).toHaveLength(1);
    const ro = render(
      <ResultsPanel view={failed} valueColumn="f(x_n)" errorKeys={halley?.errorKeys} />,
      "ro",
    );
    expect(message(ro)).toMatch(
      /^Numitorul 2f′\(xₙ\)² − f\(xₙ\)f″\(xₙ\) se anulează la n = 0, în xₙ = 2/,
    );
  });

  it("gives Chebyshev's zero derivative the same message as Newton's", () => {
    const failed = view("3b", { f: "x^2 - 2", df: "2x", ddf: "2", a: "-1", x0: "0" });
    expect(message(panel(failed))).toMatch(/^The derivative is zero at n = 0, xₙ = 0\./);
  });
});
