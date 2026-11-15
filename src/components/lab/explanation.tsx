"use client";

import { useI18n } from "@/i18n/provider";
import { localizeTex, toRows } from "@/labs/explanation";
import type { ExplanationBlock } from "@/labs/types";
import { Formula, RichText } from "./formula";

/** Method explanation. On wide screens a paragraph sits beside its formula; plain paragraphs stack in one column. */
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
            // One column, so consecutive paragraphs read top to bottom in order.
            <div className="flex max-w-3xl flex-col gap-4">
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
