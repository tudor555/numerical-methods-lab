import type { MessageKey } from "@/i18n/en";
import type { ExplanationBlock } from "./types";

type TextBlock = Extract<ExplanationBlock, { kind: "text" }>;
type FormulaBlock = Extract<ExplanationBlock, { kind: "formula" }>;

/** One visual row of a method explanation. */
export type ExplanationRow =
  | { kind: "pair"; text: TextBlock; formula: FormulaBlock }
  | { kind: "texts"; texts: TextBlock[] }
  | { kind: "formula"; formula: FormulaBlock };

/** Replaces each `⟪name⟫` in a formula with its translated word; unknown names stay as they are. */
export function localizeTex(block: FormulaBlock, t: (key: MessageKey) => string): string {
  return block.tex.replace(/⟪(\w+)⟫/g, (match, name: string) => {
    const key = block.words?.[name];
    return key ? t(key) : match;
  });
}

/** Pairs each paragraph with the formula right after it, and groups consecutive plain paragraphs. */
export function toRows(blocks: readonly ExplanationBlock[]): ExplanationRow[] {
  const rows: ExplanationRow[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];
    if (block.kind === "formula") {
      rows.push({ kind: "formula", formula: block });
    } else if (next?.kind === "formula") {
      rows.push({ kind: "pair", text: block, formula: next });
      i++;
    } else {
      const last = rows[rows.length - 1];
      if (last?.kind === "texts") last.texts.push(block);
      else rows.push({ kind: "texts", texts: [block] });
    }
  }
  return rows;
}
