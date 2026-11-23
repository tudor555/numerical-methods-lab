import { describe, expect, it, vi } from "vitest";
import type { ScalarIterationRow, SystemIterationRow } from "@/lib/methods/types";
import { elements, render, texOf } from "@/test/render";
import { IterationTable } from "./iteration-table";
import { SystemIterationTable } from "./system-iteration-table";

// Server rendering has no viewport, so the phone layout is forced here.
const phone = vi.hoisted(() => ({ value: true }));
vi.mock("./table-layout", async (original) => ({
  ...(await original<typeof import("./table-layout")>()),
  useIsPhone: () => phone.value,
}));

const scalarRows: ScalarIterationRow[] = [
  { n: 0, x: 2, fx: 5, diff: null },
  { n: 1, x: 1.5, fx: 1.25, diff: 0.5 },
];
const systemRows: SystemIterationRow[] = [
  { n: 0, x: 0.9, y: 3.1, F: 0.42, G: 0, dx: null, dy: null },
  { n: 1, x: 1, y: 3, F: 0, G: 0, dx: 0.1, dy: 0.1 },
];
const firstRow = (html: string) => elements(html.slice(html.indexOf("<tbody")), "tr")[0];

describe("iteration tables on a phone", () => {
  it("labels every cell of a scalar row with its column, and hides the header row", () => {
    phone.value = true;
    const html = render(<IterationTable rows={scalarRows} valueColumn="f(x_n)" />);
    expect(html).toMatch(/<thead[^>]*max-sm:hidden/);
    expect(texOf(firstRow(html))).toEqual(["n", "x_n", "f(x_n)", "|x_n - x_{n-1}|"]);
    expect(firstRow(html)).toContain("max-sm:flex");
  });

  it("labels the x and y halves of each paired system column", () => {
    phone.value = true;
    const html = render(<SystemIterationTable rows={systemRows} exact={{ x: 1, y: 3 }} />);
    expect(texOf(firstRow(html))).toEqual([
      "n",
      "x_n",
      "y_n",
      "F(x_n, y_n)",
      "G(x_n, y_n)",
      "|x_n - x_{n-1}|",
      "|y_n - y_{n-1}|",
      "\\max(|x_n - x^*|, |y_n - y^*|)",
    ]);
  });

  it("puts no labels in the cells on a wider screen", () => {
    phone.value = false;
    expect(texOf(firstRow(render(<IterationTable rows={scalarRows} />)))).toEqual([]);
    expect(texOf(firstRow(render(<SystemIterationTable rows={systemRows} />)))).toEqual([]);
  });
});
