import { describe, expect, it } from "vitest";
import { lab1 } from "@/labs/lab-1";
import { lab2 } from "@/labs/lab-2";
import { lab3 } from "@/labs/lab-3";
import { lab4 } from "@/labs/lab-4";
import { lab5 } from "@/labs/lab-5";
import { lab6 } from "@/labs/lab-6";
import { runComparison } from "@/labs/compare";
import type { ScalarRunResult } from "@/lib/methods/types";
import { count, elements, render, texOf, textOf } from "@/test/render";
import { ComparisonPanel, ComparisonResults } from "./comparison-panel";

const cards = (html: string) =>
  html.split('<div class="border-border bg-card flex min-w-0 flex-col gap-4').slice(1);

describe("ComparisonPanel", () => {
  it("leaves a row out of the inputs when its method or preset is unknown", () => {
    const comparison = {
      ...lab1.comparisons[0],
      rows: [
        { methodId: "nope", presetId: "ex1" },
        { methodId: "1a", presetId: "nope" },
        { methodId: "1a", presetId: "ex1" },
      ],
    };
    const html = render(<ComparisonPanel lab={{ ...lab1, comparisons: [comparison] }} />);
    expect(elements(html, "dt").map(textOf)).toEqual(["Tangent method", "Precision"]);
  });

  it("shows one card per comparison, in the lab's order", () => {
    const html = render(<ComparisonPanel lab={lab1} />);
    expect(cards(html)).toHaveLength(lab1.comparisons.length);
    expect(elements(html, "h3").map(textOf)).toEqual([
      "Ex. 1: x³ − x − 1 = 0",
      "Ex. 2: x⁵ − 5x + 1 = 0 on (−1, 1)",
      "Ex. 3: Kepler's equation, x = sin x + 0.25",
      "Computing roots: √2, √3, √5",
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
    // Not "\\varepsilon = …" from the inputs: an n tile starts the word.
    expect(textOf(html)).not.toMatch(/(^|[^a-z])n = \d/);
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
    expect(text).toContain("the final xₙ.");
    expect(text).not.toContain("(xₙ, yₙ)");
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
      <ComparisonResults
        lab={lab1}
        comparison={comparison("kepler")}
        cells={[[{ kind: "scalar", result: capped }], [null]]}
      />,
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
          [{ kind: "scalar", result: failed }, null, null],
          [null, null, null],
        ]}
      />,
    );
    expect(textOf(html)).toContain("The denominator 2f′(xₙ)² − f(xₙ)f″(xₙ) is zero at n = 0");
  });
});

describe("ComparisonPanel for Lab 4", () => {
  it("shows the four comparisons in the lab's order, each with its task", () => {
    const html = render(<ComparisonPanel lab={lab4} />, "ro");
    expect(elements(html, "h3").map(textOf)).toEqual([
      "Ex. 1: √2 prin metoda combinată a tangentei",
      "Ex. 2: x³ − x − 1 = 0 prin metoda combinată a tangentei",
      "Ex. 1: √2 prin metoda de ordinul 3",
      "Ex. 2: √3 și √5 prin metoda de ordinul 3",
    ]);
    cards(html).forEach((card, i) => {
      expect(textOf(card)).toContain("Cerința:");
      if (i < 2) {
        expect(textOf(card)).toContain("metoda tangentei");
        expect(textOf(card)).not.toContain("metoda iterativă adaptată");
      } else {
        expect(textOf(card)).toContain(
          "metoda iterativă adaptată în urma folosirii metodei tangentei",
        );
      }
    });
  });

  it("lists each row's inputs before the run, so the task text stays short", () => {
    const [combined, , , roots] = cards(render(<ComparisonPanel lab={lab4} />, "ro"));
    expect(textOf(combined)).toContain("Date de intrare");
    expect(elements(combined, "dt").map(textOf)).toEqual([
      "Metoda combinată a tangentei",
      "Metoda tangentei",
      "Precizia",
    ]);
    expect(texOf(combined)).toEqual([
      "f(x) = { x}^{2}-2",
      "f'(x) = 2 x",
      "[a;\\ b] = [1;\\ 2]",
      "x_0 = 2",
      "f(x) = { x}^{2}-2",
      "f'(x) = 2 x",
      "[a;\\ b] = [1;\\ 2]",
      "x_0 = 2",
      "\\varepsilon = 10^{-4},\\ 10^{-8},\\ 10^{-12}",
    ]);
    // √3 and √5 sit in one card: a = 3 next to c = 3, then a = 5 next to c = 5.
    expect(texOf(roots).slice(0, -1)).toEqual([
      "a = 3",
      "c = 3",
      "k = 2",
      "a = 5",
      "c = 5",
      "k = 2",
    ]);
  });

  it("names rule R0 for Newton's start in Lab 2, in words", () => {
    const [first] = cards(render(<ComparisonPanel lab={lab2} />));
    expect(textOf(first)).toContain(": Rule R0");
    expect(texOf(first)).toContain("\\mathrm{dda} = f''(a) = 2");
    expect(texOf(first)).toContain("x_1 = 1.4");
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
      "root-ex1",
      ["Metoda de ordinul 3", "Metoda tangentei"],
      ["n = 3", "n = 4", "n = 6"],
      "\\sqrt{2}",
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

describe("ComparisonPanel for Lab 5", () => {
  const ex3 = lab5.comparisons[0];

  it("shows ex. 3 with its task and lists each row's system and start", () => {
    const html = render(<ComparisonPanel lab={lab5} />, "ro");
    expect(elements(html, "h3").map(textOf)).toEqual([
      "Ex. 3: metoda lui Newton modificată pentru x² + y² = 10, √(x + y) = 2",
    ]);
    const [card] = cards(html);
    expect(textOf(card)).toContain("Cerința:");
    expect(elements(card, "dt").map(textOf)).toEqual([
      "Metoda lui Newton modificată",
      "Metoda lui Newton",
      "Metoda lui Newton modificată",
      "Metoda lui Newton",
      "Precizia",
    ]);
    const inputs = texOf(card);
    expect(inputs.filter((tex) => tex.startsWith("(x_0;"))).toEqual([
      "(x_0;\\ y_0) = (0.9;\\ 3.1)",
      "(x_0;\\ y_0) = (0.9;\\ 3.1)",
      "(x_0;\\ y_0) = (2.9;\\ 1.1)",
      "(x_0;\\ y_0) = (2.9;\\ 1.1)",
    ]);
  });

  it.each([
    ["en", ",", "final point (xₙ, yₙ)"],
    ["ro", ";", "ultima iterație (xₙ; yₙ)"],
  ] as const)("shows n and the point in each cell, in %s", (lang, separator, hint) => {
    const html = render(
      <ComparisonResults lab={lab5} comparison={ex3} cells={runComparison(lab5, ex3)} />,
      lang,
    );
    const text = textOf(html);
    for (const n of [4, 8, 12, 3, 5, 9, 13]) expect(text).toContain(`n = ${n}`);
    // 5a from (0.9, 3.1) at ε = 10⁻⁸ ends on (1, 3) to 15 digits.
    expect(text).toContain(`(1${separator} 3)`);
    expect(text).toContain(hint);
    expect(text).not.toContain("final xₙ.");
  });

  it("explains a failed system tile with the point", () => {
    const failed = {
      kind: "system" as const,
      result: {
        status: "error" as const,
        result: null,
        n: 0,
        iterations: [{ n: 0, x: 0, y: 0, F: 0, G: -1, dx: null, dy: null }],
        error: { code: "zero-jacobian" as const, n: 0, x: 0, y: 0 },
      },
    };
    const html = render(
      <ComparisonResults
        lab={lab5}
        comparison={ex3}
        cells={[[failed, null, null], ...Array(3).fill([null, null, null])]}
      />,
    );
    expect(textOf(html)).toContain("The Jacobian J is zero at n = 0, (xₙ, yₙ) = (0, 0).");
    // Rows whose presets failed do not turn the hint back into the scalar one.
    expect(textOf(html)).toContain("the final point (xₙ, yₙ).");
  });
});

describe("ComparisonPanel for Lab 6", () => {
  const ex4 = lab6.comparisons[0];

  it("shows ex. 4 with its task and lists Gauss–Seidel and successive approximations", () => {
    const html = render(<ComparisonPanel lab={lab6} />, "ro");
    expect(elements(html, "h3").map(textOf)).toEqual([
      "Ex. 4: metoda Gauss–Seidel pentru x² + y² = 5, xy = 2",
    ]);
    const [card] = cards(html);
    expect(textOf(card)).toContain("Cerința:");
    expect(textOf(card)).toContain("cele trei precizii");
    expect(elements(card, "dt").map(textOf)).toEqual([
      "Metoda Gauss–Seidel",
      "Metoda aproximațiilor succesive",
      "Precizia",
    ]);
    const inputs = texOf(card);
    expect(inputs.filter((tex) => tex.startsWith("(x_0;"))).toEqual([
      "(x_0;\\ y_0) = (1.5;\\ 1.5)",
      "(x_0;\\ y_0) = (1.5;\\ 1.5)",
    ]);
  });

  it("shows n and the point in each cell: 9, 16, 22 for Gauss–Seidel, 14, 27, 40 for 6a", () => {
    const html = render(
      <ComparisonResults lab={lab6} comparison={ex4} cells={runComparison(lab6, ex4)} />,
    );
    const text = textOf(html);
    for (const n of [9, 16, 22, 14, 27, 40]) expect(text).toContain(`n = ${n}`);
    expect(text).toContain("final point (xₙ, yₙ)");
  });

  it("names (xₙ, yₙ, zₙ) in a failed tile with three unknowns", () => {
    const failed = {
      kind: "system" as const,
      result: {
        status: "error" as const,
        result: null,
        n: 0,
        iterations: [{ n: 0, x: -10, y: -10, z: -10, dx: null, dy: null, dz: null }],
        error: { code: "undefined-value" as const, n: 0, x: -10, y: -10, z: -10 },
      },
    };
    const html = render(
      <ComparisonResults
        lab={lab6}
        comparison={ex4}
        cells={[
          [failed, null, null],
          [null, null, null],
        ]}
      />,
    );
    expect(textOf(html)).toContain("(xₙ, yₙ, zₙ) = (-10, -10, -10)");
  });
});
