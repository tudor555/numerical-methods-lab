import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { count, texOf } from "@/test/render";
import { Formula, RichText, Tex } from "./formula";

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
