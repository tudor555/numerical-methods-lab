"use client";

import { Play } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import type { MessageKey } from "@/i18n/en";
import { useI18n } from "@/i18n/provider";
import { runComparison, type ComparisonCell as Cell } from "@/labs/compare";
import type { Comparison, ReadyLab } from "@/labs/types";
import { formatEpsTex, formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Tex } from "./formula";
import { STATUS_STYLE } from "./status";

/** One ε cell: n and the last iterate, or the error. Wide screens show ε in a shared header instead. */
function ResultCell({ cell, eps }: { cell: Cell; eps: number }) {
  const { t } = useI18n();
  const label = (
    <span className="text-muted-foreground text-sm lg:sr-only">
      <Tex tex={`\\varepsilon = ${formatEpsTex(eps)}`} />
    </span>
  );

  if (!cell) {
    return (
      <div className="bg-raised flex min-w-0 flex-col gap-1 rounded-lg px-4 py-2">
        {label}
        <span className="text-muted-foreground">—</span>
      </div>
    );
  }

  const style = STATUS_STYLE[cell.status];
  const Icon = style.icon;

  if (cell.status === "error") {
    const key = `run.error.${cell.error?.code ?? "undefined-value"}` satisfies MessageKey;
    const detail = t(key, { n: cell.error?.n ?? 0, x: formatValue(cell.error?.x ?? Number.NaN) });
    return (
      <div className="bg-error/10 flex min-w-0 flex-col gap-1 rounded-lg px-4 py-2" title={detail}>
        {label}
        <span className={cn("inline-flex items-center gap-2 font-semibold", style.text)}>
          <Icon className="size-4 shrink-0" aria-hidden />
          {t("compare.cell.error")}
        </span>
        <span className="sr-only">{detail}</span>
      </div>
    );
  }

  return (
    <div className="bg-raised flex min-w-0 flex-col gap-1 rounded-lg px-4 py-2">
      {label}
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="font-mono font-semibold tabular-nums">n = {cell.n}</span>
        {cell.status === "max-iterations" && (
          <span className={cn("inline-flex items-center gap-1 text-sm", style.text)}>
            <Icon className="size-4" aria-hidden />
            {t("compare.cell.max")}
          </span>
        )}
      </span>
      <span className="text-muted-foreground font-mono text-sm break-all tabular-nums">
        {formatValue(cell.result ?? Number.NaN)}
      </span>
    </div>
  );
}

/** The result grid of one comparison: a row per method/example, a tile per ε. */
export function ComparisonResults({
  lab,
  comparison,
  cells,
}: {
  lab: ReadyLab;
  comparison: Comparison;
  cells: Cell[][];
}) {
  const { t } = useI18n();
  return (
    <div
      className="flex flex-col gap-4"
      // One column per ε, shared by the header and every row so the tiles line up.
      style={{ "--cols": `repeat(${comparison.eps.length}, minmax(0, 1fr))` } as CSSProperties}
    >
      <div
        aria-hidden
        className="text-muted-foreground hidden gap-4 text-sm font-medium lg:grid lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]"
      >
        <span>{t("compare.method")}</span>
        <div className="grid [grid-template-columns:var(--cols)] gap-2">
          {comparison.eps.map((eps) => (
            <span key={eps} className="px-4">
              <Tex tex={`\\varepsilon = ${formatEpsTex(eps)}`} />
            </span>
          ))}
        </div>
      </div>
      <ul className="divide-border flex flex-col divide-y">
        {comparison.rows.map((row, i) => {
          const method = lab.methods.find((m) => m.id === row.methodId);
          const preset = lab.presets.find((p) => p.id === row.presetId);
          return (
            <li
              key={`${row.methodId}-${row.presetId}`}
              className="grid gap-2 py-4 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:items-center lg:gap-4"
            >
              <div className="min-w-0">
                <div className="font-medium">{method ? t(method.nameKey) : row.methodId}</div>
                {preset && <Tex tex={preset.tex} className="text-muted-foreground text-sm" />}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:[grid-template-columns:var(--cols)]">
                {cells[i].map((cell, j) => (
                  <ResultCell key={comparison.eps[j]} cell={cell} eps={comparison.eps[j]} />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-muted-foreground text-sm">{t("compare.hint")}</p>
    </div>
  );
}

function ComparisonCard({ lab, comparison }: { lab: ReadyLab; comparison: Comparison }) {
  const { t } = useI18n();
  const [cells, setCells] = useState<Cell[][] | null>(null);

  return (
    <div className="border-border bg-card flex min-w-0 flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-prose flex-col gap-2">
          <h3 className="text-base font-semibold text-balance">{t(comparison.titleKey)}</h3>
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">{t("compare.task")}:</span>{" "}
            {t(comparison.taskKey)}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={cells ? "outline" : "default"}
          onClick={() => setCells(runComparison(lab, comparison))}
        >
          <Play aria-hidden />
          {t("compare.run")}
        </Button>
      </div>
      {cells && <ComparisonResults lab={lab} comparison={comparison} cells={cells} />}
    </div>
  );
}

export function ComparisonPanel({ lab }: { lab: ReadyLab }) {
  return (
    <div className="flex flex-col gap-4">
      {lab.comparisons.map((comparison) => (
        <ComparisonCard key={comparison.id} lab={lab} comparison={comparison} />
      ))}
    </div>
  );
}
