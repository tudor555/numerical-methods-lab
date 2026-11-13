import { describe, expect, it } from "vitest";
import { lab1 } from "@/labs/lab-1";
import { runComparison } from "@/labs/compare";
import type { ScalarRunResult } from "@/lib/methods/types";
import { count, elements, render, texOf, textOf } from "@/test/render";
import { ComparisonPanel, ComparisonResults } from "./comparison-panel";

const cards = (html: string) =>
  html.split('<div class="border-border bg-card flex min-w-0 flex-col gap-4').slice(1);

describe("ComparisonPanel", () => {
  it("shows one card per comparison, in the lab's order", () => {
    const html = render(<ComparisonPanel lab={lab1} />);
    expect(cards(html)).toHaveLength(lab1.comparisons.length);
    expect(elements(html, "h3").map(textOf)).toEqual([
      "Ex. 1: x³ − x − 1 = 0",
      "Ex. 2: x⁵ − 5x + 1 = 0 on (−1, 1)",
      "Ex. 3: Kepler's equation, x = sin x + 0.25",
      "Ex. 4: √2, √3, √5",
    ]);
  });

  it.each([
    ["en", "Lab task:", "Run comparison", "Approximate the real root with ε = 10⁻⁴"],
    ["ro", "Cerința:", "Compară", "Ex. 1: x³ − x − 1 = 0"],
  ] as const)("in %s, each card shows the lab task and a run button", (lang, task, run, first) => {
    const all = cards(render(<ComparisonPanel lab={lab1} />, lang));
    expect(textOf(all[0])).toContain(first);
    for (const card of all) {
      expect(textOf(card)).toContain(task);
      const buttons = elements(card, "button");
      expect(buttons).toHaveLength(1);
      expect(textOf(buttons[0])).toBe(run);
      expect(buttons[0]).toContain('data-variant="default"');
    }
  });

  it("shows no results before a comparison runs", () => {
    const html = render(<ComparisonPanel lab={lab1} />);
    expect(html).not.toContain("<ul");
    expect(textOf(html)).not.toContain("n = ");
    expect(textOf(html)).not.toContain("Each cell shows");
  });
});

describe("ComparisonResults", () => {
  const comparison = (id: string) => {
    const found = lab1.comparisons.find((c) => c.id === id);
    if (!found) throw new Error(id);
    return found;
  };
  const results = (id: string, lang: "en" | "ro" = "en") =>
    render(
      <ComparisonResults
        lab={lab1}
        comparison={comparison(id)}
        cells={runComparison(lab1, comparison(id))}
      />,
      lang,
    );

  it("shows n and the last iterate for every ε, in order", () => {
    const text = textOf(results("ex1"));
    expect(text).toContain("Tangent method");
    expect(text.indexOf("n = 5")).toBeLessThan(text.indexOf("n = 6"));
    expect(text.indexOf("n = 6")).toBeLessThan(text.indexOf("n = 7"));
    expect(text).toContain("1.32471795724");
  });

  it("labels each tile with its ε and repeats the ε values in a shared header", () => {
    const tex = texOf(results("ex1"));
    // Three ε in the header plus one per tile.
    expect(tex.filter((t) => t.startsWith("\\varepsilon = 10^{-4}"))).toHaveLength(2);
    expect(tex.filter((t) => t.startsWith("\\varepsilon = 10^{-12}"))).toHaveLength(2);
  });

  it("marks a failed run as an error tile, with the reason for screen readers", () => {
    const html = results("ex2");
    expect(count(html, "bg-error/10")).toBe(3);
    expect(textOf(html)).toContain("Error");
    expect(textOf(html)).toContain("The derivative is zero");
    // The x₀ = 0 row still converges.
    expect(textOf(html)).toContain("n = 4");
  });

  it("speaks Romanian", () => {
    const text = textOf(results("ex2", "ro"));
    expect(text).toContain("Eroare");
    expect(text).toContain("Metoda tangentei");
    expect(text).toContain("Fiecare celulă arată numărul de iterații");
  });

  it("flags a run that hit the iteration cap, and shows a dash for a missing cell", () => {
    const capped: ScalarRunResult = {
      status: "max-iterations",
      result: 1.5,
      n: 3,
      iterations: [],
    };
    const html = render(
      <ComparisonResults lab={lab1} comparison={comparison("kepler")} cells={[[capped], [null]]} />,
    );
    expect(textOf(html)).toContain("Cap reached");
    expect(textOf(html)).toContain("n = 3");
    expect(textOf(html)).toContain("—");
  });
});
