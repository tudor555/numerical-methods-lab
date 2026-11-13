"use client";

import { useI18n } from "@/i18n/provider";
import { localizeTex, toRows } from "@/labs/explanation";
import type { ExplanationBlock } from "@/labs/types";
import { Formula, RichText } from "./formula";

/** Method explanation. On wide screens a paragraph sits beside its formula, and plain paragraphs share a row. */
export function Explanation({ blocks }: { blocks: readonly ExplanationBlock[] }) {
  const { t } = useI18n();
  return (
    <div className="divide-border flex flex-col divide-y text-base">
      {toRows(blocks).map((row, i) => (
        <div key={i} className="py-6 first:pt-0 last:pb-0">
          {row.kind === "pair" && (
            <div className="grid gap-4 lg:grid-cols-2 lg:items-center lg:gap-8">
              <p>
                <RichText text={t(row.text.key)} />
              </p>
              <Formula tex={localizeTex(row.formula, t)} />
            </div>
          )}
          {row.kind === "texts" && (
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
              {row.texts.map((text) => (
                <p key={text.key}>
                  <RichText text={t(text.key)} />
                </p>
              ))}
            </div>
          )}
          {row.kind === "formula" && <Formula tex={localizeTex(row.formula, t)} />}
        </div>
      ))}
    </div>
  );
}
