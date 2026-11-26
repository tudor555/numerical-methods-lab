import { describe, expect, it } from "vitest";
import type { CauchyNodeRow } from "@/lib/methods/types";
import { elements, render, textOf } from "@/test/render";
import { CauchyNodeTable } from "./cauchy-node-table";

const body = (html: string) => html.slice(html.indexOf("<tbody"));
const cells = (row: string) => elements(row, "td").map(textOf);

describe("CauchyNodeTable for a very long run", () => {
  const long: CauchyNodeRow[] = Array.from({ length: 1200 }, (_, i) => ({ i, x: i, y: i }));

  it("renders the first and last nodes with a hidden-nodes line and a show-all button", () => {
    const html = render(<CauchyNodeTable rows={long} />);
    const trs = elements(body(html), "tr");
    expect(trs).toHaveLength(101);
    expect(textOf(html)).toContain("Hidden nodes: 1100");
    expect(textOf(elements(trs[50], "button")[0] ?? "")).toBe("Show all");
    expect(cells(trs[0])[0]).toBe("0");
    expect(cells(trs[49])[0]).toBe("49");
    expect(cells(trs[51])[0]).toBe("1150");
    expect(cells(trs[100])[0]).toBe("1199");
  });

  it("speaks Romanian", () => {
    const text = textOf(render(<CauchyNodeTable rows={long} />, "ro"));
    expect(text).toContain("Noduri ascunse: 1100");
    expect(text).toContain("Arată toate");
  });

  it("shows every node of a run up to n = 1000", () => {
    const html = render(<CauchyNodeTable rows={long.slice(0, 1001)} />);
    expect(elements(body(html), "tr")).toHaveLength(1001);
    expect(textOf(html)).not.toContain("Hidden nodes");
  });
});

describe("CauchyNodeTable with an exact solution", () => {
  const rows: CauchyNodeRow[] = [
    { i: 0, x: 0, y: 1 },
    { i: 1, x: 1, y: 2 },
  ];

  it("shows y(xᵢ) and the error at each node", () => {
    const trs = elements(
      body(render(<CauchyNodeTable rows={rows} exact={(x) => x + 1.5} />)),
      "tr",
    );
    expect(cells(trs[1])).toEqual(["1", "1", "2", "2.5", "5.000e-1"]);
  });

  it("puts a dash where the exact solution is undefined, such as ln x at x = 0", () => {
    const trs = elements(body(render(<CauchyNodeTable rows={rows} exact={Math.log} />)), "tr");
    expect(cells(trs[0]).slice(3)).toEqual(["—", "—"]);
    expect(cells(trs[1]).slice(3)).toEqual(["0", "2.000e+0"]);
  });
});
