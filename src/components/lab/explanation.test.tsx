import { describe, expect, it } from "vitest";
import { lab1 } from "@/labs/lab-1";
import type { ExplanationBlock } from "@/labs/types";
import { render, texOf, textOf } from "@/test/render";
import { Explanation } from "./explanation";

const newton = lab1.methods[0].explanation;

/** The HTML of each visual row. */
const rows = (html: string) => html.split('<div class="py-6').slice(1);

describe("Explanation", () => {
  it("renders a paragraph and its formula in the same row", () => {
    const [idea] = rows(render(<Explanation blocks={newton} />));
    const paragraph = idea.slice(idea.indexOf("<p>"), idea.indexOf("</p>"));
    expect(paragraph).toContain("is replaced by its tangent line");
    // Inline TeX from the paragraph, then the display formula of the same row.
    expect(texOf(idea)).toEqual([
      "x_n",
      "f",
      "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}, \\qquad n = 0, 1, 2, \\dots",
    ]);
    expect(idea.indexOf("katex-display")).toBeGreaterThan(idea.indexOf("</p>"));
  });

  it("groups consecutive paragraphs into one row and keeps every block in order", () => {
    const html = render(<Explanation blocks={newton} />);
    const all = rows(html);
    // idea + formula, start + formula, then stopping and failure side by side.
    expect(all).toHaveLength(3);
    expect(all[2]).not.toContain("katex-display");
    expect(all[2].match(/<p>/g)).toHaveLength(2);
    expect(textOf(all[2])).toContain("Stopping rule");
    expect(textOf(all[2])).toContain("the tangent is horizontal");
  });

  it("renders a formula on its own when no paragraph precedes it", () => {
    const blocks: ExplanationBlock[] = [{ kind: "formula", tex: "a = b" }];
    const [row] = rows(render(<Explanation blocks={blocks} />));
    expect(row).not.toContain("<p>");
    expect(texOf(row)).toEqual(["a = b"]);
  });

  it.each([
    ["en", "if"],
    ["ro", "dacă"],
  ] as const)("localizes the words inside a formula (%s)", (lang, word) => {
    const [, start] = rows(render(<Explanation blocks={newton} />, lang));
    const tex = texOf(start).at(-1);
    expect(tex).toContain(`\\text{${word}}`);
    expect(tex).not.toContain("⟪");
  });

  it("translates the paragraphs, including inline TeX", () => {
    const html = render(<Explanation blocks={lab1.methods[1].explanation} />, "ro");
    expect(textOf(html)).toContain("altfel");
    expect(texOf(html)).toContain("x_0 = c");
  });
});
