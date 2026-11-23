import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { count, texOf } from "@/test/render";
import { Formula, formulaScale, MIN_FORMULA_SCALE, RichText, Tex } from "./formula";

describe("Tex", () => {
  it("renders inline KaTeX markup inside a span", () => {
    const html = renderToStaticMarkup(<Tex tex="x_n" className="extra" />);
    expect(html).toMatch(/^<span class="extra"><span class="katex">/);
    expect(html).not.toContain("katex-display");
    expect(texOf(html)).toEqual(["x_n"]);
  });

  it("does not throw on invalid TeX", () => {
    const html = renderToStaticMarkup(<Tex tex="\frac{" />);
    expect(html).toContain("katex-error");
  });
});

describe("Formula", () => {
  it("renders display-mode KaTeX in a raised block", () => {
    const html = renderToStaticMarkup(<Formula tex="x = \varphi(x)" className="extra" />);
    expect(html).toMatch(/^<div class="[^"]*bg-raised[^"]*extra">/);
    expect(html).toContain("katex-display");
    expect(texOf(html)).toEqual(["x = \\varphi(x)"]);
  });

  it("splits a trailing index range into its own formula, so it can wrap below", () => {
    const html = renderToStaticMarkup(
      <Formula tex="x_{n+1} = \varphi(x_n), \qquad n = 0, 1, 2, \dots" />,
    );
    expect(texOf(html)).toEqual(["x_{n+1} = \\varphi(x_n),", "n = 0, 1, 2, \\dots"]);
    expect(html).toMatch(/^<div class="[^"]*\bflex-wrap\b/);
  });

  it("can shrink below its formula's width, so a long formula scrolls instead of widening the page", () => {
    // Without min-w-0 the Lab 2 secant formula pushed phone pages to 432px wide.
    expect(renderToStaticMarkup(<Formula tex="x" />)).toMatch(/^<div class="[^"]*\bmin-w-0\b/);
  });
});

describe("formulaScale", () => {
  it("keeps a formula that fits at full size", () => {
    expect(formulaScale(300, 300)).toBe(1);
    expect(formulaScale(300, 120)).toBe(1);
    expect(formulaScale(300, 0)).toBe(1);
  });

  it("shrinks a wider formula just enough, rounded down so it surely fits", () => {
    expect(formulaScale(278, 300)).toBe(0.92);
    expect(300 * formulaScale(278, 300)).toBeLessThanOrEqual(278);
  });

  it("stops at the minimum scale; past it the formula scrolls", () => {
    expect(formulaScale(200, 412)).toBe(MIN_FORMULA_SCALE);
  });
});

describe("RichText", () => {
  it("renders the text between $…$ as inline TeX and leaves the rest as text", () => {
    const html = renderToStaticMarkup(<RichText text="Start at $x_0$, stop when $n = 3$." />);
    expect(texOf(html)).toEqual(["x_0", "n = 3"]);
    expect(count(html, 'class="katex"')).toBe(2);
    expect(html.startsWith("Start at <span>")).toBe(true);
    expect(html).toContain("</span>, stop when <span>");
    expect(html.endsWith("</span>.")).toBe(true);
  });

  it("leaves text without $…$ untouched", () => {
    expect(renderToStaticMarkup(<RichText text="No maths here" />)).toBe("No maths here");
  });

  it("keeps a lone $ as text", () => {
    expect(renderToStaticMarkup(<RichText text="costs $5" />)).toBe("costs $5");
  });
});
