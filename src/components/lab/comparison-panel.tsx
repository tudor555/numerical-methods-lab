"use client";

import { Play } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import {
  comparisonInputs,
  findComparisonMethod,
  findComparisonPreset,
  runComparison,
  type ComparisonCell as Cell,
} from "@/labs/compare";
import type { Comparison, MethodDefinition, ReadyLab } from "@/labs/types";
import { formatEpsTex, formatPoint, formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Tex } from "./formula";
import { runErrorKey, STATUS_STYLE, systemErrorKey } from "./status";

/**
 * One ε cell: n and the last iterate (a number, or a point for a system), or the error. Wide
 * screens show ε in a shared header instead.
 */
function ResultCell({
  cell,
  eps,
  errorKeys,
}: {
  cell: Cell;
  eps: number;
  errorKeys?: MethodDefinition["errorKeys"];
}) {
  const { t, lang } = useI18n();
  const separator = lang === "ro" ? ";" : ",";
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

  const run = cell.result;
  const style = STATUS_STYLE[run.status];
  const Icon = style.icon;

  if (run.status === "error") {
    const detail =
      cell.kind === "system"
        ? t(systemErrorKey(cell.result.error?.code), {
            n: cell.result.error?.n ?? 0,
            point: formatPoint(
              cell.result.error?.x ?? Number.NaN,
              cell.result.error?.y ?? Number.NaN,
              separator,
            ),
          })
        : t(runErrorKey(cell.result.error?.code, errorKeys), {
            n: cell.result.error?.n ?? 0,
            x: formatValue(cell.result.error?.x ?? Number.NaN),
          });
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

  let value: string;
  if (cell.kind === "system") {
    const point = cell.result.result;
    value = point ? formatPoint(point.x, point.y, separator) : "—";
  } else {
    value = formatValue(cell.result.result ?? Number.NaN);
  }

  return (
    <div className="bg-raised flex min-w-0 flex-col gap-1 rounded-lg px-4 py-2">
      {label}
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="font-mono font-semibold tabular-nums">n = {run.n}</span>
        {run.status === "max-iterations" && (
          <span className={cn("inline-flex items-center gap-1 text-sm", style.text)}>
            <Icon className="size-4" aria-hidden />
            {t("compare.cell.max")}
          </span>
        )}
      </span>
      <span className="text-muted-foreground font-mono text-sm break-all tabular-nums">
        {value}
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
  // A system row's cells show a point, so the hint names (xₙ, yₙ) when the card has system rows
  // and no scalar ones; a row whose preset failed (all null) does not change that.
  const kinds = new Set(cells.flat().map((cell) => cell?.kind));
  const allSystem = kinds.has("system") && !kinds.has("scalar");
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
          const method = findComparisonMethod(lab, row.methodId);
          const preset = findComparisonPreset(lab, row.presetId);
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
                  <ResultCell
                    key={comparison.eps[j]}
                    cell={cell}
                    eps={comparison.eps[j]}
                    errorKeys={method?.errorKeys}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-muted-foreground text-sm">
        {t(allSystem ? "compare.systemHint" : "compare.hint")}
      </p>
    </div>
  );
}

/** What each row runs with, listed before the run so the task text can stay short. */
function ComparisonInputs({ lab, comparison }: { lab: ReadyLab; comparison: Comparison }) {
  const { t, lang } = useI18n();
  const separator = lang === "ro" ? ";" : ",";
  const precisions = comparison.eps.map(formatEpsTex).join(",\\ ");
  return (
    <div className="bg-raised flex flex-col gap-2 rounded-lg p-4 text-sm">
      <h4 className="font-medium">{t("compare.inputs")}</h4>
      <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        {comparison.rows.map((row) => {
          const method = findComparisonMethod(lab, row.methodId);
          const preset = findComparisonPreset(lab, row.presetId);
          if (!method || !preset) return null;
          return (
            <div key={`${row.methodId}-${row.presetId}`} className="contents">
              <dt className="text-muted-foreground">{t(method.nameKey)}</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-1">
                {comparisonInputs(method, preset.values, separator).map((input, i) =>
                  input.kind === "tex" ? (
                    <Tex key={i} tex={input.tex} />
                  ) : (
                    <span key={i}>
                      <Tex tex={input.symbol} />: {t(input.labelKey)}
                    </span>
                  ),
                )}
              </dd>
            </div>
          );
        })}
        <dt className="text-muted-foreground">{t("compare.precisions")}</dt>
        <dd>
          <Tex tex={`\\varepsilon = ${precisions}`} />
        </dd>
      </dl>
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
      <ComparisonInputs lab={lab} comparison={comparison} />
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
