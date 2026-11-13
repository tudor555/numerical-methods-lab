import { describe, expect, it } from "vitest";
import type { ScalarIterationRow } from "@/lib/methods/types";
import { elements, render, texOf, textOf } from "@/test/render";
import { IterationTable, splitRows } from "./iteration-table";

const rows: ScalarIterationRow[] = [
  { n: 0, x: 2, fx: 5, diff: null },
  { n: 1, x: 1.5454545454545454, fx: 1.1457, diff: 0.45454545 },
  { n: 2, x: 1.359614915915184, fx: null, diff: 0.1858 },
];

const body = (html: string) => html.slice(html.indexOf("<tbody"));
const cells = (row: string) => elements(row, "td").map(textOf);

describe("IterationTable", () => {
  it("renders one body row per iterate, in order", () => {
    const html = render(<IterationTable rows={rows} valueColumn="f(x_n)" />);
    const trs = elements(body(html), "tr");
    expect(trs).toHaveLength(3);
    expect(cells(trs[0])).toEqual(["0", "2", "5.000e+0", "—"]);
    expect(cells(trs[1])).toEqual(["1", "1.54545454545455", "1.146e+0", "4.545e-1"]);
    expect(cells(trs[2])[2]).toBe("—");
  });

  it("shows the f(xₙ) column only when valueColumn is given", () => {
    const withValue = render(<IterationTable rows={rows} valueColumn="x_n^{\,k} - c" />);
    expect(elements(withValue, "th")).toHaveLength(4);
    expect(texOf(withValue)).toEqual(["n", "x_n", "x_n^{\\,k} - c", "|x_n - x_{n-1}|"]);

    const without = render(<IterationTable rows={rows} />);
    expect(elements(without, "th")).toHaveLength(3);
    expect(texOf(without)).toEqual(["n", "x_n", "|x_n - x_{n-1}|"]);
    expect(cells(elements(body(without), "tr")[0])).toEqual(["0", "2", "—"]);
  });

  it("highlights only the row the run failed at", () => {
    const html = render(<IterationTable rows={rows} errorAt={1} />);
    const trs = elements(body(html), "tr");
    expect(trs.map((tr) => tr.includes("bg-error/10"))).toEqual([false, true, false]);
  });

  it("highlights nothing without an error", () => {
    const html = render(<IterationTable rows={rows} />);
    expect(html).not.toContain("bg-error/10");
  });
});

describe("IterationTable with a known exact solution", () => {
  const exact = { value: Math.SQRT2, tex: "\\sqrt{2}" };
  const sqrtRows: ScalarIterationRow[] = [
    { n: 0, x: 2, fx: 2, diff: null },
    { n: 1, x: 1.5, fx: 0.25, diff: 0.5 },
  ];

  it("adds an |xₙ − exact| column with the error of every iterate", () => {
    const html = render(<IterationTable rows={sqrtRows} exact={exact} />);
    expect(texOf(html)).toContain("|x_n - \\sqrt{2}|");
    const trs = elements(body(html), "tr");
    expect(cells(trs[0]).at(-1)).toBe((2 - Math.SQRT2).toExponential(3));
    expect(cells(trs[1]).at(-1)).toBe((1.5 - Math.SQRT2).toExponential(3));
  });

  it("has no error column without an exact solution", () => {
    const html = render(<IterationTable rows={sqrtRows} />);
    expect(texOf(html).some((t) => t.includes("sqrt"))).toBe(false);
  });
});

describe("splitRows", () => {
  const many = Array.from({ length: 1500 }, (_, n) => n);

  it("keeps every row up to the default cap (n = 0…1000)", () => {
    const rows = Array.from({ length: 1001 }, (_, n) => n);
    expect(splitRows(rows)).toEqual({ head: rows, tail: [], hidden: 0 });
  });

  it("keeps the first and last 50 rows of a longer run and counts the rest", () => {
    const { head, tail, hidden } = splitRows(many);
    expect(head).toEqual(many.slice(0, 50));
    expect(tail).toEqual(many.slice(-50));
    expect(hidden).toBe(1400);
  });

  it("shows everything when the limit is lifted", () => {
    expect(splitRows(many, Infinity).hidden).toBe(0);
  });
});

describe("IterationTable for a very long run", () => {
  const long: ScalarIterationRow[] = Array.from({ length: 1200 }, (_, n) => ({
    n,
    x: n,
    fx: null,
    diff: n === 0 ? null : 1,
  }));

  it("renders the first and last rows with a hidden-rows line and a show-all button", () => {
    const html = render(<IterationTable rows={long} />);
    const trs = elements(body(html), "tr");
    expect(trs).toHaveLength(101);
    expect(textOf(html)).toContain("Hidden iterations: 1100");
    expect(textOf(html)).toContain("Show all");
    expect(cells(trs[0])[0]).toBe("0");
    expect(cells(trs[100])[0]).toBe("1199");
  });

  it("speaks Romanian", () => {
    const text = textOf(render(<IterationTable rows={long} />, "ro"));
    expect(text).toContain("Iterații ascunse: 1100");
    expect(text).toContain("Arată toate");
  });
});
