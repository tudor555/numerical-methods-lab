"use client";

import { Play } from "lucide-react";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/i18n/provider";
import {
  comparisonInputs,
  findComparisonMethod,
  findComparisonPreset,
  runComparison,
  runNodeComparison,
  type ComparisonCell as Cell,
  type NodeComparisonCell,
} from "@/labs/compare";
import type { Comparison, MethodDefinition, NodeComparison, ReadyLab } from "@/labs/types";
import { formatEpsTex, formatPoint, formatSmall, formatValue, pointValues } from "@/lib/format";
import type { CauchyNodeRow } from "@/lib/methods/types";
import { cn } from "@/lib/utils";
import { exactAt } from "./cauchy-node-table";
import { buildCauchyErrorChart, nodeError, type CauchyErrorSeries } from "./charts";
import { Tex } from "./formula";
import { PlotlyChart } from "./plotly-chart";
import { useChartLabels } from "./results-common";
import { runErrorKey, STATUS_STYLE, systemErrorKey } from "./status";
import { CARD_LAYOUT, CellLabel, useIsPhone } from "./table-layout";

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
        ? t(systemErrorKey(cell.result.error?.code, cell.result.error?.z !== undefined), {
            n: cell.result.error?.n ?? 0,
            point: formatPoint(pointValues(cell.result.error), separator),
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
    value = point ? formatPoint(pointValues(point), separator) : "—";
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
  const precisions = comparison.kind === "nodes" ? [] : comparison.eps;
  // A system row's cells show a point, so the hint names (xₙ, yₙ) when the card has system rows
  // and no scalar ones; a row whose preset failed (all null) does not change that.
  const kinds = new Set(cells.flat().map((cell) => cell?.kind));
  const allSystem = kinds.has("system") && !kinds.has("scalar");
  return (
    <div
      className="flex flex-col gap-4"
      // One column per ε, shared by the header and every row so the tiles line up.
      style={{ "--cols": `repeat(${precisions.length}, minmax(0, 1fr))` } as CSSProperties}
    >
      <div
        aria-hidden
        className="text-muted-foreground hidden gap-4 text-sm font-medium lg:grid lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]"
      >
        <span>{t("compare.method")}</span>
        <div className="grid [grid-template-columns:var(--cols)] gap-2">
          {precisions.map((eps) => (
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
                    key={precisions[j]}
                    cell={cell}
                    eps={precisions[j]}
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
  const precisions = comparison.kind === "nodes" ? null : comparison.eps.map(formatEpsTex);
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
        {precisions && (
          <>
            <dt className="text-muted-foreground">{t("compare.precisions")}</dt>
            <dd>
              <Tex tex={`\\varepsilon = ${precisions.join(",\\ ")}`} />
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}

/** Title, task line and run button of a comparison card. */
function ComparisonHeader({
  comparison,
  ran,
  onRun,
}: {
  comparison: Comparison;
  ran: boolean;
  onRun: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex max-w-prose flex-col gap-2">
        <h3 className="text-base font-semibold text-balance">{t(comparison.titleKey)}</h3>
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{t("compare.task")}:</span>{" "}
          {t(comparison.taskKey)}
        </p>
      </div>
      <Button type="button" size="sm" variant={ran ? "outline" : "default"} onClick={onRun}>
        <Play aria-hidden />
        {t("compare.run")}
      </Button>
    </div>
  );
}

const CARD_CLASS = "border-border bg-card flex min-w-0 flex-col gap-4 rounded-xl border p-4";

/** A comparison card, with the results it shows for its kind. */
function ComparisonCard({ lab, comparison }: { lab: ReadyLab; comparison: Comparison }) {
  if (comparison.kind === "nodes") return <NodeComparisonCard lab={lab} comparison={comparison} />;
  return <PrecisionComparisonCard lab={lab} comparison={comparison} />;
}

function NodeComparisonCard({ lab, comparison }: { lab: ReadyLab; comparison: NodeComparison }) {
  const [cells, setCells] = useState<NodeComparisonCell[] | null>(null);
  return (
    <div className={CARD_CLASS}>
      <ComparisonHeader
        comparison={comparison}
        ran={cells !== null}
        onRun={() => setCells(runNodeComparison(lab, comparison))}
      />
      <ComparisonInputs lab={lab} comparison={comparison} />
      {cells && <NodeComparisonResults lab={lab} comparison={comparison} cells={cells} />}
    </div>
  );
}

function PrecisionComparisonCard({ lab, comparison }: { lab: ReadyLab; comparison: Comparison }) {
  const [cells, setCells] = useState<Cell[][] | null>(null);
  return (
    <div className={CARD_CLASS}>
      <ComparisonHeader
        comparison={comparison}
        ran={cells !== null}
        onRun={() => setCells(runComparison(lab, comparison))}
      />
      <ComparisonInputs lab={lab} comparison={comparison} />
      {cells && <ComparisonResults lab={lab} comparison={comparison} cells={cells} />}
    </div>
  );
}

/** One table row of a node comparison: a node xᵢ of the run with the fewest, and each run's yᵢ there. */
export interface ComparisonNode {
  x: number;
  /** One node per run, or null when that run has no node here (it stopped early, or its nodes differ). */
  values: (CauchyNodeRow | null)[];
}

/**
 * The nodes a comparison's runs share: those of the run with the fewest steps, from i = 1. A run
 * with nₖ steps is read at index i·(nₖ/n_min), so every run is compared at the same xᵢ.
 */
export function sharedNodes(cells: readonly NodeComparisonCell[]): ComparisonNode[] {
  const runs = cells.flatMap((cell) => (cell ? [cell.result] : []));
  if (runs.length === 0) return [];
  const fewest = runs.reduce((a, b) => (b.n < a.n ? b : a));
  const x0 = fewest.rows[0]?.x ?? 0;
  return Array.from({ length: fewest.n }, (_, k) => {
    const i = k + 1;
    return {
      x: x0 + i * fewest.h,
      values: cells.map((cell) => {
        if (!cell) return null;
        const ratio = cell.result.n / fewest.n;
        return Number.isInteger(ratio) ? (cell.result.rows[i * ratio] ?? null) : null;
      }),
    };
  });
}

/** Two values stacked in one cell: yᵢ on top, its error below. */
function Stack({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <span className="flex flex-col">
      <span>{top}</span>
      <span className="text-muted-foreground">{bottom}</span>
    </span>
  );
}

/** The node table, error chart and hint of a node comparison. */
export function NodeComparisonResults({
  lab,
  comparison,
  cells,
}: {
  lab: ReadyLab;
  comparison: NodeComparison;
  cells: NodeComparisonCell[];
}) {
  const { t } = useI18n();
  const phone = useIsPhone();
  const labels = useChartLabels();
  const exact = cells.find((cell) => cell?.exact)?.exact;
  const nodes = sharedNodes(cells);
  const runs = useMemo(
    () =>
      comparison.rows.map((row, k) => {
        const method = findComparisonMethod(lab, row.methodId);
        const preset = findComparisonPreset(lab, row.presetId);
        const cell = cells[k];
        const name = method ? t(method.nameKey) : row.methodId;
        return {
          key: `${row.methodId}-${row.presetId}`,
          name,
          tex: preset?.tex,
          // Plain text for the chart legend, which can't show TeX.
          legend: cell ? `${name}, h = ${formatValue(cell.result.h)}` : name,
          cell,
        };
      }),
    [lab, comparison, cells, t],
  );
  const errorChart = useMemo(() => {
    if (!exact) return null;
    const series = runs.flatMap((run): CauchyErrorSeries[] =>
      run.cell ? [{ name: run.legend, rows: run.cell.result.rows, exact }] : [],
    );
    return buildCauchyErrorChart(series, labels);
  }, [runs, exact, labels]);

  type Column = { id: string; header: ReactNode; value: (node: ComparisonNode) => ReactNode };
  const columns: Column[] = [
    { id: "x", header: <Tex tex="x_i" />, value: (node) => formatValue(node.x) },
    ...(exact
      ? [
          {
            id: "exact",
            header: <Tex tex="y(x_i)" />,
            value: (node: ComparisonNode) => {
              const value = exactAt(exact, node.x);
              return value === null ? "—" : formatValue(value);
            },
          },
        ]
      : []),
    ...runs.map((run, k) => ({
      id: run.key,
      header: (
        <span className="flex flex-col font-sans">
          <span>{run.name}</span>
          {run.tex && <Tex tex={run.tex} className="text-muted-foreground text-sm font-normal" />}
        </span>
      ),
      value: (node: ComparisonNode) => {
        const row = node.values[k];
        if (!row) return "—";
        return (
          <Stack
            top={formatValue(row.y)}
            bottom={exact ? formatSmall(nodeError(row, exact)) : null}
          />
        );
      },
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-card max-h-[28rem] overflow-auto rounded-xl border max-sm:max-h-[70vh]">
        <Table className={cn("font-mono text-sm tabular-nums", CARD_LAYOUT.table)}>
          <TableHeader className={cn("bg-raised sticky top-0 z-10", CARD_LAYOUT.header)}>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className="h-auto py-2 text-right align-bottom whitespace-normal"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className={CARD_LAYOUT.body}>
            {nodes.map((node, i) => (
              <TableRow key={i} className={CARD_LAYOUT.row}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={cn("text-right", CARD_LAYOUT.cell)}>
                    <CellLabel phone={phone}>{column.header}</CellLabel>
                    {column.value(node)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {errorChart && <PlotlyChart title={t("chart.cauchyError")} spec={errorChart} />}
      <p className="text-muted-foreground text-sm">
        {t("compare.nodesHint")}
        {comparison.noteKey && <> {t(comparison.noteKey)}</>}
      </p>
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
