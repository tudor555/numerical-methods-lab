import { describe, expect, it } from "vitest";
import type { MessageKey } from "@/i18n/en";
import { localizeTex, toRows } from "./explanation";
import type { ExplanationBlock } from "./types";

const text = (key: string): ExplanationBlock => ({ kind: "text", key: key as MessageKey });
const formula = (tex: string): ExplanationBlock => ({ kind: "formula", tex });

describe("toRows", () => {
  it("pairs a paragraph with the formula right after it", () => {
    const [a, f] = [text("a"), formula("x")];
    expect(toRows([a, f])).toEqual([{ kind: "pair", text: a, formula: f }]);
  });

  it("groups consecutive plain paragraphs into one row", () => {
    const [a, b, c] = [text("a"), text("b"), text("c")];
    expect(toRows([a, b, c])).toEqual([{ kind: "texts", texts: [a, b, c] }]);
  });

  it("gives the formula to the last paragraph before it, not to the whole group", () => {
    const [a, b, f] = [text("a"), text("b"), formula("x")];
    expect(toRows([a, b, f])).toEqual([
      { kind: "texts", texts: [a] },
      { kind: "pair", text: b, formula: f },
    ]);
  });

  it("starts a new group after a pair", () => {
    const [a, f, b, c] = [text("a"), formula("x"), text("b"), text("c")];
    expect(toRows([a, f, b, c])).toEqual([
      { kind: "pair", text: a, formula: f },
      { kind: "texts", texts: [b, c] },
    ]);
  });

  it("puts a formula with no paragraph before it on its own row", () => {
    const [f, g] = [formula("x"), formula("y")];
    expect(toRows([f, g])).toEqual([
      { kind: "formula", formula: f },
      { kind: "formula", formula: g },
    ]);
  });

  it("returns no rows for no blocks", () => {
    expect(toRows([])).toEqual([]);
  });
});

describe("localizeTex", () => {
  const t = (key: MessageKey) => `<${key}>`;

  it("replaces each ⟪name⟫ with the translation of its key in words", () => {
    const block = {
      kind: "formula" as const,
      tex: "a, \\text{⟪if⟫}\\ x > 0 \\\\ b, \\text{⟪if⟫}\\ x \\le 0",
      words: { if: "math.if" as MessageKey },
    };
    expect(localizeTex(block, t)).toBe(
      "a, \\text{<math.if>}\\ x > 0 \\\\ b, \\text{<math.if>}\\ x \\le 0",
    );
  });

  it("leaves a placeholder without a declared word as it is", () => {
    const block = { kind: "formula" as const, tex: "\\text{⟪missing⟫}", words: {} };
    expect(localizeTex(block, t)).toBe("\\text{⟪missing⟫}");
  });

  it("returns a formula without placeholders unchanged", () => {
    expect(localizeTex({ kind: "formula", tex: "x_{n+1} = \\varphi(x_n)" }, t)).toBe(
      "x_{n+1} = \\varphi(x_n)",
    );
  });
});
