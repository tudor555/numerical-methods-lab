import { describe, expect, it, vi } from "vitest";
import { lab1 } from "@/labs/lab-1";
import { elements, render, textOf } from "@/test/render";
import { LabPage } from "./lab-page";

vi.mock("./plotly-chart", () => ({
  PlotlyChart: ({ title }: { title: string }) => <figure>{title}</figure>,
}));

const tabs = (html: string) => {
  const start = html.indexOf('role="group" aria-label=');
  return elements(html.slice(start, html.indexOf("</div>", start)), "button");
};

describe("LabPage", () => {
  it.each([
    [
      "en",
      "Lab 1",
      "Newton's method and k-th roots",
      "Solve f(x) = 0 with Newton's tangent method",
      ["1a · Newton", "1b · k-th root", "1c · Successive approximations"],
      "Load a worked example or edit the parameters, then press Run.",
    ],
    [
      "ro",
      "Laboratorul 1",
      "Metoda tangentei și rădăcinile de ordinul k",
      "Rezolvă ecuația f(x) = 0 prin metoda tangentei",
      ["1a · Metoda tangentei", "1b · Rădăcina de ordinul k", "1c · Aproximații succesive"],
      "Alege un exemplu numeric sau modifică datele de intrare, apoi apasă Calculează.",
    ],
  ] as const)("first render in %s", (lang, chip, title, intro, methodTabs, empty) => {
    const html = render(<LabPage slug="newton" />, lang);
    const header = html.slice(0, html.indexOf("</header>"));
    expect(header).toContain('href="/"');
    expect(
      textOf(elements(header, "span").find((s) => s.includes('data-slot="badge"')) ?? ""),
    ).toBe(chip);
    expect(textOf(elements(header, "h1")[0])).toBe(title);
    const introText = textOf(elements(header, "p")[0]);
    expect(introText.startsWith(intro)).toBe(true);
    expect(introText).not.toContain(chip);

    const buttons = tabs(html);
    expect(buttons.map(textOf)).toEqual(methodTabs);
    expect(buttons.map((b) => b.includes('aria-pressed="true"'))).toEqual([true, false, false]);

    expect(textOf(html)).toContain(empty);
    expect(html).toContain("lucide-chart-line");
    expect(html).not.toContain("<figure");
  });

  it("shows the first method's explanation, form and every comparison", () => {
    const html = render(<LabPage slug="newton" />);
    expect(textOf(elements(html, "h2")[0])).toBe("How it works: Newton's (tangent) method");
    expect(elements(html, "h2").map(textOf).slice(1)).toEqual([
      "Parameters",
      "Results",
      "Comparisons",
    ]);
    expect(html).toContain('id="field-f"');
    expect(html).toContain('value="x^3 - x - 1"');
    expect(elements(html, "h3").filter((h) => h.includes("text-balance"))).toHaveLength(
      lab1.comparisons.length,
    );
  });

  it("marks the preset the defaults match", () => {
    const html = render(<LabPage slug="newton" />);
    const pressed = elements(html, "button").filter(
      (b) => b.includes("min-h-8") && b.includes('aria-pressed="true"'),
    );
    expect(pressed.map(textOf)).toEqual(["Ex. 1: x³ − x − 1 = 0 on [1, 2]"]);
  });

  it("throws for a slug that is not a ready lab", () => {
    expect(() => render(<LabPage slug="euler" />)).toThrow("Unknown lab: euler");
  });
});
