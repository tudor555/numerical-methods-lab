import { describe, expect, it } from "vitest";
import { render } from "@/test/render";
import { PlotlyChart } from "./plotly-chart";

describe("PlotlyChart", () => {
  it("clips its card, so a chart still at its old width cannot widen the page while it resizes", () => {
    const html = render(
      <PlotlyChart title="Chart" spec={{ traces: [], xTitle: "x", yTitle: "y" }} />,
    );
    expect(html).toMatch(/<figure class="[^"]*\bmin-w-0\b[^"]*\boverflow-hidden\b/);
  });
});
