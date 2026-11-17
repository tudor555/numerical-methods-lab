import { describe, expect, it } from "vitest";
import { lab1 } from "@/labs/lab-1";
import { lab2 } from "@/labs/lab-2";
import { lab3 } from "@/labs/lab-3";
import { lab4 } from "@/labs/lab-4";
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

describe("ComparisonPanel for Lab 2", () => {
  it("shows the three comparisons with Newton, each with its task", () => {
    const html = render(<ComparisonPanel lab={lab2} />, "ro");
    expect(elements(html, "h3").map(textOf)).toEqual([
      "Ex. 1: √2 prin metoda secantei",
      "Ex. 2: x³ − x − 1 = 0 prin metoda secantei",
      "Exemplu numeric: x³ − x − 1 = 0 prin metoda lui Steffensen",
    ]);
    for (const card of cards(html)) {
      expect(textOf(card)).toContain("Cerința:");
      expect(textOf(card)).toContain("metoda tangentei");
    }
  });

  it.each([
    ["en", "ex1", ["Secant method", "Tangent method"], ["n = 4", "n = 6", "n = 5"], "x^2 - 2"],
    [
      "ro",
      "steffensen",
      ["Metoda lui Steffensen", "Metoda tangentei"],
      ["n = 11", "n = 13", "n = 7"],
      "x^3 - x - 1",
    ],
  ] as const)("in %s, %s names both methods and shows n for each ε", (lang, id, names, ns, f) => {
    const comparison = lab2.comparisons.find((c) => c.id === id);
    if (!comparison) throw new Error(id);
    const html = render(
      <ComparisonResults
        lab={lab2}
        comparison={comparison}
        cells={runComparison(lab2, comparison)}
      />,
      lang,
    );
    const rows = elements(html, "li");
    expect(rows).toHaveLength(2);
    rows.forEach((row, i) => expect(textOf(row)).toContain(names[i]));
    for (const n of ns) expect(textOf(html)).toContain(n);
    // Newton's row names its start, which the lab leaves open.
    expect(texOf(rows[1])[0]).toBe(`${f},\\ x_0 = 2\\ (\\mathrm{R0})`);
  });
});

describe("ComparisonPanel for Lab 3", () => {
  it("shows the three comparisons with Newton, each with its task", () => {
    const html = render(<ComparisonPanel lab={lab3} />, "ro");
    expect(elements(html, "h3").map(textOf)).toEqual([
      "Ex. 1: √2 prin metoda lui Halley",
      "Ex. 2: x³ − x − 1 = 0 prin metoda lui Halley",
      "Exemplu numeric: x³ − x − 1 = 0 prin metoda lui Cebîșev",
    ]);
    for (const card of cards(html)) {
      expect(textOf(card)).toContain("Cerința:");
      expect(textOf(card)).toContain("metoda tangentei");
    }
  });

  it.each([
    ["en", "ex1", ["Halley's method", "Tangent method"], ["n = 3", "n = 4", "n = 6"], "x^2 - 2"],
    [
      "ro",
      "chebyshev",
      ["Metoda lui Cebîșev", "Metoda tangentei"],
      ["n = 4", "n = 5", "n = 7"],
      "x^3 - x - 1",
    ],
  ] as const)("in %s, %s names both methods and shows n for each ε", (lang, id, names, ns, f) => {
    const comparison = lab3.comparisons.find((c) => c.id === id);
    if (!comparison) throw new Error(id);
    const html = render(
      <ComparisonResults
        lab={lab3}
        comparison={comparison}
        cells={runComparison(lab3, comparison)}
      />,
      lang,
    );
    const rows = elements(html, "li");
    expect(rows).toHaveLength(2);
    rows.forEach((row, i) => expect(textOf(row)).toContain(names[i]));
    for (const n of ns) expect(textOf(html)).toContain(n);
    expect(texOf(rows[1])[0]).toBe(`${f},\\ x_0 = 2`);
  });

  it("explains a failed Halley tile with Halley's own denominator", () => {
    const comparison = lab3.comparisons[0];
    const failed: ScalarRunResult = {
      status: "error",
      result: null,
      n: 0,
      iterations: [{ n: 0, x: 2, fx: 1, diff: null }],
      error: { code: "zero-denominator", n: 0, x: 2 },
    };
    const html = render(
      <ComparisonResults
        lab={lab3}
        comparison={comparison}
        cells={[
          [failed, null, null],
          [null, null, null],
        ]}
      />,
    );
    expect(textOf(html)).toContain("The denominator 2f′(xₙ)² − f(xₙ)f″(xₙ) is zero at n = 0");
  });
});

describe("ComparisonPanel for Lab 4", () => {
  it("shows the five comparisons in the lab's order, each with its task", () => {
    const html = render(<ComparisonPanel lab={lab4} />, "ro");
    expect(elements(html, "h3").map(textOf)).toEqual([
      "Ex. 1: √2 prin metoda combinată a tangentei",
      "Ex. 2: x³ − x − 1 = 0 prin metoda combinată a tangentei",
      "Ex. 1: √2 prin metoda de ordinul 3",
      "Ex. 2: √3 prin metoda de ordinul 3",
      "Ex. 2: √5 prin metoda de ordinul 3",
    ]);
    const all = cards(html);
    all.forEach((card, i) => {
      expect(textOf(card)).toContain("Cerința:");
      if (i < 2) {
        expect(textOf(card)).toContain("metoda tangentei");
        expect(textOf(card)).not.toContain("metoda iterativă obținută");
      } else {
        expect(textOf(card)).toContain("metoda iterativă obținută din metoda tangentei");
      }
    });
    for (const card of all.slice(3)) {
      expect(textOf(card)).toContain("Metoda converge către √a, deci a = 3 dă √3, iar a = 5 dă √5");
    }
  });

  it.each([
    [
      "en",
      "combined-ex2",
      ["Combined tangent method", "Tangent method"],
      ["n = 4", "n = 5", "n = 7"],
      "x^3 - x - 1,\\ x_0 = 2",
    ],
    [
      "ro",
      "root-ex2-sqrt5",
      ["Metoda de ordinul 3", "Metoda tangentei"],
      ["n = 4", "n = 5", "n = 6"],
      "\\sqrt{5}",
    ],
  ] as const)("in %s, %s names both methods and shows n for each ε", (lang, id, names, ns, tex) => {
    const comparison = lab4.comparisons.find((c) => c.id === id);
    if (!comparison) throw new Error(id);
    const html = render(
      <ComparisonResults
        lab={lab4}
        comparison={comparison}
        cells={runComparison(lab4, comparison)}
      />,
      lang,
    );
    const rows = elements(html, "li");
    expect(rows).toHaveLength(2);
    rows.forEach((row, i) => expect(textOf(row)).toContain(names[i]));
    for (const n of ns) expect(textOf(html)).toContain(n);
    expect(texOf(rows[1])[0]).toBe(tex);
  });
});
