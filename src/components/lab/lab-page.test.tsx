import { afterEach, describe, expect, it, vi } from "vitest";
import { lab1 } from "@/labs/lab-1";
import { lab2 } from "@/labs/lab-2";
import { lab3 } from "@/labs/lab-3";
import { lab4 } from "@/labs/lab-4";
import { lab5 } from "@/labs/lab-5";
import { lab6 } from "@/labs/lab-6";
import { elements, render, texOf, textOf } from "@/test/render";
import { LabPage } from "./lab-page";

vi.mock("./plotly-chart", () => ({
  PlotlyChart: ({ title }: { title: string }) => <figure>{title}</figure>,
}));

// The page always opens on the first tab; a test can open it on another tab through this override.
const openTab = vi.hoisted(() => ({ id: null as string | null }));
vi.mock("@/labs/lab-state", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/labs/lab-state")>();
  return {
    ...actual,
    initialLabState: (lab: Parameters<typeof actual.initialLabState>[0]) => {
      const state = actual.initialLabState(lab);
      return openTab.id ? { ...state, activeId: openTab.id } : state;
    },
  };
});

afterEach(() => {
  openTab.id = null;
});

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

describe("LabPage, Lab 2", () => {
  it.each([
    [
      "en",
      "Lab 2",
      "Secant and Steffensen methods",
      ["2a · Secant", "2b · Steffensen"],
      "How it works: Secant method",
      "Ex. 1: √2, f(x) = x² − 2, x₀ = 2, x₁ = 1.4",
    ],
    [
      "ro",
      "Laboratorul 2",
      "Metoda secantei și metoda lui Steffensen",
      ["2a · Metoda secantei", "2b · Metoda lui Steffensen"],
      "Cum funcționează: Metoda secantei",
      "Ex. 1: √2, f(x) = x² − 2, x₀ = 2, x₁ = 1,4",
    ],
  ] as const)("first render in %s", (lang, chip, title, methodTabs, heading, preset) => {
    const html = render(<LabPage slug="secant-steffensen" />, lang);
    const header = html.slice(0, html.indexOf("</header>"));
    expect(
      textOf(elements(header, "span").find((s) => s.includes('data-slot="badge"')) ?? ""),
    ).toBe(chip);
    expect(textOf(elements(header, "h1")[0])).toBe(title);
    expect(tabs(html).map(textOf)).toEqual(methodTabs);
    expect(textOf(elements(html, "h2")[0])).toBe(heading);
    expect(html).toContain('id="field-x0"');
    expect(html).toContain('id="field-x1"');
    expect(html).toContain('value="1.4"');
    const pressed = elements(html, "button").filter(
      (b) => b.includes("min-h-8") && b.includes('aria-pressed="true"'),
    );
    expect(pressed.map(textOf)).toEqual([preset]);
    expect(elements(html, "h3").filter((h) => h.includes("text-balance"))).toHaveLength(
      lab2.comparisons.length,
    );
  });
});

describe("LabPage, Lab 3", () => {
  it.each([
    [
      "en",
      "Lab 3",
      "Halley's method and Chebyshev-type methods",
      ["3a · Halley", "3b · Chebyshev"],
      "How it works: Halley's method",
      "Ex. 1: √2, f(x) = x² − 2, x₀ = 2",
    ],
    [
      "ro",
      "Laboratorul 3",
      "Metoda lui Halley și metode de tip Cebîșev",
      ["3a · Metoda lui Halley", "3b · Metoda lui Cebîșev"],
      "Cum funcționează: Metoda lui Halley",
      "Ex. 1: √2, f(x) = x² − 2, x₀ = 2",
    ],
  ] as const)("first render in %s", (lang, chip, title, methodTabs, heading, preset) => {
    const html = render(<LabPage slug="halley-chebyshev" />, lang);
    const header = html.slice(0, html.indexOf("</header>"));
    expect(
      textOf(elements(header, "span").find((s) => s.includes('data-slot="badge"')) ?? ""),
    ).toBe(chip);
    expect(textOf(elements(header, "h1")[0])).toBe(title);
    expect(textOf(elements(header, "p")[0])).not.toContain(chip);
    expect(tabs(html).map(textOf)).toEqual(methodTabs);
    expect(textOf(elements(html, "h2")[0])).toBe(heading);
    for (const id of ["f", "df", "ddf", "a", "b", "x0", "eps", "maxIter"]) {
      expect(html).toContain(`id="field-${id}"`);
    }
    expect(html).not.toContain('id="field-dda"');
    const pressed = elements(html, "button").filter(
      (b) => b.includes("min-h-8") && b.includes('aria-pressed="true"'),
    );
    expect(pressed.map(textOf)).toEqual([preset]);
    expect(elements(html, "h3").filter((h) => h.includes("text-balance"))).toHaveLength(
      lab3.comparisons.length,
    );
  });

  it("offers “Derive from f” for both f′ and f″", () => {
    const html = render(<LabPage slug="halley-chebyshev" />);
    expect(html.split('aria-label="Derive from f"').length - 1).toBe(2);
  });
});

describe("LabPage, Lab 4", () => {
  it.each([
    [
      "en",
      "Lab 4",
      "Third-order iterative methods",
      "Solve f(x) = 0 with the combined tangent method",
      ["4a · Combined tangent", "4b · Square roots"],
      "How it works: Combined tangent method",
      "Ex. 1: √2, f(x) = x² − 2, x₀ = 2",
    ],
    [
      "ro",
      "Laboratorul 4",
      "Metode iterative de ordinul trei",
      "Rezolvă ecuația f(x) = 0 prin metoda combinată a tangentei",
      ["4a · Metoda combinată a tangentei", "4b · Calculul radicalilor"],
      "Cum funcționează: Metoda combinată a tangentei",
      "Ex. 1: √2, f(x) = x² − 2, x₀ = 2",
    ],
  ] as const)("first render in %s", (lang, chip, title, intro, methodTabs, heading, preset) => {
    const html = render(<LabPage slug="third-order" />, lang);
    const header = html.slice(0, html.indexOf("</header>"));
    expect(
      textOf(elements(header, "span").find((s) => s.includes('data-slot="badge"')) ?? ""),
    ).toBe(chip);
    expect(textOf(elements(header, "h1")[0])).toBe(title);
    expect(textOf(elements(header, "p")[0])).toContain(intro);
    expect(textOf(elements(header, "p")[0])).not.toContain(chip);
    expect(tabs(html).map(textOf)).toEqual(methodTabs);
    expect(textOf(elements(html, "h2")[0])).toBe(heading);
    for (const id of ["f", "df", "a", "b", "x0", "eps", "maxIter"]) {
      expect(html).toContain(`id="field-${id}"`);
    }
    for (const id of ["ddf", "dda", "x0Mode"]) expect(html).not.toContain(`"field-${id}`);
    const pressed = elements(html, "button").filter(
      (b) => b.includes("min-h-8") && b.includes('aria-pressed="true"'),
    );
    expect(pressed.map(textOf)).toEqual([preset]);
    expect(elements(html, "h3").filter((h) => h.includes("text-balance"))).toHaveLength(
      lab4.comparisons.length,
    );
  });

  it("offers “Derive from f” for f′ only", () => {
    const html = render(<LabPage slug="third-order" />);
    expect(html.split('aria-label="Derive from f"').length - 1).toBe(1);
  });

  it.each([
    ["en", "Radicand"],
    ["ro", "Numărul de sub radical"],
  ] as const)("on the 4b tab in %s, asks only for a, ε and the cap", (lang, radicand) => {
    openTab.id = "4b";
    const html = render(<LabPage slug="third-order" />, lang);
    const fieldIds = [...html.matchAll(/id="field-([\w]+)"/g)].map((m) => m[1]);
    expect(fieldIds).toEqual(["a", "eps", "maxIter"]);
    const label = elements(html, "label").find((l) => l.includes('for="field-a"')) ?? "";
    expect(texOf(label)).toEqual(["a"]);
    expect(textOf(label)).toContain(radicand);
    expect(html).not.toContain('aria-label="Derive from f"');
    expect(html).not.toContain(lang === "en" ? "Derive from f" : "Calculează din f");
  });
});

describe("LabPage, Lab 5", () => {
  it.each([
    [
      "en",
      "Lab 5",
      "Newton's method for 2×2 systems",
      "Solve a nonlinear system F(x, y) = 0, G(x, y) = 0",
      ["5a · Newton", "5b · Modified Newton"],
      "How it works: Newton's method for nonlinear systems",
      "Ex. 1: 2x³ − y² − 1 = 0, xy³ − y − 4 = 0, from (1.2, 1.7)",
    ],
    [
      "ro",
      "Laboratorul 5",
      "Metoda lui Newton pentru sisteme 2×2",
      "Rezolvă sistemul neliniar F(x, y) = 0, G(x, y) = 0",
      ["5a · Metoda lui Newton", "5b · Newton modificată"],
      "Cum funcționează: Metoda lui Newton pentru sisteme neliniare",
      "Ex. 1: 2x³ − y² − 1 = 0, xy³ − y − 4 = 0, din (1,2; 1,7)",
    ],
  ] as const)("first render in %s", (lang, chip, title, intro, methodTabs, heading, preset) => {
    const html = render(<LabPage slug="newton-systems" />, lang);
    const header = html.slice(0, html.indexOf("</header>"));
    expect(
      textOf(elements(header, "span").find((s) => s.includes('data-slot="badge"')) ?? ""),
    ).toBe(chip);
    expect(textOf(elements(header, "h1")[0])).toBe(title);
    expect(textOf(elements(header, "p")[0])).toContain(intro);
    expect(textOf(elements(header, "p")[0])).not.toContain(chip);
    expect(tabs(html).map(textOf)).toEqual(methodTabs);
    expect(textOf(elements(html, "h2")[0])).toBe(heading);
    const fieldIds = [...html.matchAll(/id="field-([\w]+)"/g)].map((m) => m[1]);
    expect(fieldIds).toEqual(["F", "G", "Fx", "Fy", "Gx", "Gy", "x0", "y0", "eps", "maxIter"]);
    const pressed = elements(html, "button").filter(
      (b) => b.includes("min-h-8") && b.includes('aria-pressed="true"'),
    );
    expect(pressed.map(textOf)).toEqual([preset]);
    expect(elements(html, "h3").filter((h) => h.includes("text-balance"))).toHaveLength(
      lab5.comparisons.length,
    );
  });

  it("offers “Derive from F” and “Derive from G” for the partials only", () => {
    const html = render(<LabPage slug="newton-systems" />);
    expect(html.split('aria-label="Derive from F"').length - 1).toBe(2);
    expect(html.split('aria-label="Derive from G"').length - 1).toBe(2);
    expect(html).not.toContain('aria-label="Derive from f"');
    expect(render(<LabPage slug="newton-systems" />, "ro")).toContain("Calculează din G");
  });

  it("opens 5b on ex. 3 from (0.9, 3.1)", () => {
    openTab.id = "5b";
    const html = render(<LabPage slug="newton-systems" />);
    const pressed = elements(html, "button").filter(
      (b) => b.includes("min-h-8") && b.includes('aria-pressed="true"'),
    );
    expect(pressed.map(textOf)).toEqual(["Ex. 3: x² + y² = 10, √(x + y) = 2, from (0.9, 3.1)"]);
    expect(textOf(elements(html, "h2")[0])).toBe("How it works: Modified Newton's method");
  });
});

describe("LabPage, Lab 6", () => {
  const pressedPresets = (html: string) =>
    elements(html, "button")
      .filter((b) => b.includes("min-h-8") && b.includes('aria-pressed="true"'))
      .map(textOf);

  it.each([
    [
      "en",
      "Lab 6",
      "Successive approximations and Gauss–Seidel",
      "Solve nonlinear systems written as x = F(x, y), y = G(x, y)",
      [
        "6a · Successive approximations",
        "6b · Gauss–Seidel, 3 equations",
        "6c · Gauss–Seidel, 2 equations",
      ],
      "How it works: Successive approximations for nonlinear systems",
      "Ex. 1: 2x² − xy − 5x + 1 = 0, x + 3 lg x − y² = 0, from (3.5, 2.2)",
    ],
    [
      "ro",
      "Laboratorul 6",
      "Aproximații succesive și metoda Gauss–Seidel",
      "Rezolvă sisteme neliniare scrise sub forma x = F(x, y), y = G(x, y)",
      [
        "6a · Aproximații succesive",
        "6b · Gauss–Seidel, 3 ecuații",
        "6c · Gauss–Seidel, 2 ecuații",
      ],
      "Cum funcționează: Metoda aproximațiilor succesive pentru sisteme neliniare",
      "Ex. 1: 2x² − xy − 5x + 1 = 0, x + 3 lg x − y² = 0, din (3,5; 2,2)",
    ],
  ] as const)("first render in %s", (lang, chip, title, intro, methodTabs, heading, preset) => {
    const html = render(<LabPage slug="nonlinear-systems" />, lang);
    const header = html.slice(0, html.indexOf("</header>"));
    expect(
      textOf(elements(header, "span").find((s) => s.includes('data-slot="badge"')) ?? ""),
    ).toBe(chip);
    expect(textOf(elements(header, "h1")[0])).toBe(title);
    expect(textOf(elements(header, "p")[0])).toContain(intro);
    expect(textOf(elements(header, "p")[0])).not.toContain(chip);
    expect(tabs(html).map(textOf)).toEqual(methodTabs);
    expect(textOf(elements(html, "h2")[0])).toBe(heading);
    const fieldIds = [...html.matchAll(/id="field-([\w]+)"/g)].map((m) => m[1]);
    expect(fieldIds).toEqual(["F", "G", "x0", "y0", "eps", "maxIter"]);
    expect(html).not.toContain("Derive from");
    expect(pressedPresets(html)).toEqual([preset]);
    expect(elements(html, "h3").filter((h) => h.includes("text-balance"))).toHaveLength(
      lab6.comparisons.length,
    );
  });

  it("opens 6b on ex. 3 with F₁, F₂, F₃ and the start (x₀, y₀, z₀)", () => {
    openTab.id = "6b";
    const html = render(<LabPage slug="nonlinear-systems" />);
    const fieldIds = [...html.matchAll(/id="field-([\w]+)"/g)].map((m) => m[1]);
    expect(fieldIds).toEqual(["F1", "F2", "F3", "x0", "y0", "z0", "eps", "maxIter"]);
    expect(pressedPresets(html)).toEqual([
      "Ex. 3: 2x² − yz − 5x + 1 = 0, y² − 2x − ln z = 0, z² − xy − 2z − 8 = 0, from (10, 10, 10)",
    ]);
    expect(textOf(elements(html, "h2")[0])).toBe(
      "How it works: The Gauss–Seidel method for three equations",
    );
    expect(texOf(html).some((tex) => tex.includes("z_{n+1} &= F_3(x_{n+1}, y_{n+1}, z_n)"))).toBe(
      true,
    );
  });

  it("opens 6c on ex. 4", () => {
    openTab.id = "6c";
    const html = render(<LabPage slug="nonlinear-systems" />);
    expect(pressedPresets(html)).toEqual(["Ex. 4: x² + y² = 5, xy = 2, near (2, 1)"]);
  });
});
