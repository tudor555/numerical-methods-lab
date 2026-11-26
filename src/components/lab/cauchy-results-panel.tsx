"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/provider";
import type { RunView } from "@/labs/lab-state";
import { formatSmall, formatValue } from "@/lib/format";
import type { CauchyNodeRow } from "@/lib/methods/types";
import { cn } from "@/lib/utils";
import { CauchyNodeTable, exactAt } from "./cauchy-node-table";
import { buildCauchyErrorChart, buildCauchySolutionChart, nodeError } from "./charts";
import { Tex } from "./formula";
import { PlotlyChart } from "./plotly-chart";
import { Stat, useChartLabels } from "./results-common";
import { cauchyErrorKey, STATUS_STYLE, StatusBadge } from "./status";

type CauchyRunView = Extract<RunView, { kind: "cauchy" }>;

/** The largest |y(xᵢ) − yᵢ| over the nodes computed; null when no node has a defined error. */
export function maxNodeError(
  rows: readonly CauchyNodeRow[],
  exact: (x: number) => number,
): number | null {
  let largest: number | null = null;
  for (const row of rows) {
    const error = nodeError(row, exact);
    if (error !== null && (largest === null || error > largest)) largest = error;
  }
  return largest;
}

/**
 * Results of a Cauchy run: status, yₙ, h and n; with an exact solution also y(xₙ), the error there
 * and the largest error at the nodes. Then the solution and error charts, and the node table.
 */
export function CauchyResultsPanel({ view }: { view: CauchyRunView }) {
  const { t } = useI18n();
  const { result, exact } = view;
  const style = STATUS_STYLE[result.status];
  const x0 = result.rows[0]?.x ?? Number.NaN;
  const end = x0 + result.n * result.h;

  let message: string;
  if (result.status === "completed") {
    message = t("result.cauchy.completed", { n: result.n, h: formatValue(result.h) });
  } else {
    const error = result.error;
    const detail = t(cauchyErrorKey(error?.code), {
      i: error?.i ?? 0,
      x: formatValue(error?.x ?? Number.NaN),
      y: formatValue(error?.y ?? Number.NaN),
    });
    message = `${detail} ${t("result.cauchy.partial")}`;
  }

  const labels = useChartLabels();
  const solutionChart = useMemo(
    () => buildCauchySolutionChart(result.rows, labels, exact, end),
    [result, labels, exact, end],
  );
  const errorChart = useMemo(
    () =>
      exact
        ? buildCauchyErrorChart([{ name: labels.nodeError, rows: result.rows, exact }], labels)
        : null,
    [result, labels, exact],
  );

  const exactEnd = exact ? exactAt(exact, end) : null;

  return (
    <div className="flex flex-col gap-4">
      <div
        role={result.status === "completed" ? "status" : "alert"}
        className={cn("flex flex-col gap-2 rounded-xl border p-4", style.tint)}
      >
        <StatusBadge status={result.status} />
        <p className="text-base">{message}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Stat
          label={
            <>
              {t("result.valueAtEnd")} <Tex tex="y_n" />
            </>
          }
        >
          {result.result === null ? "—" : formatValue(result.result)}
        </Stat>
        <Stat
          label={
            <>
              {t("result.stepH")} <Tex tex="h" />
            </>
          }
        >
          {formatValue(result.h)}
        </Stat>
        <Stat
          label={
            <>
              {t("result.steps")} <Tex tex="n" />
            </>
          }
        >
          {result.n}
        </Stat>
      </div>

      {exact && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Stat
            label={
              <>
                {t("result.exact")} <Tex tex="y(x_n)" />
              </>
            }
          >
            {exactEnd === null ? "—" : formatValue(exactEnd)}
          </Stat>
          <Stat
            label={
              <>
                {t("result.error")} <Tex tex="|y(x_n) - y_n|" />
              </>
            }
          >
            {result.result === null || exactEnd === null
              ? "—"
              : formatSmall(Math.abs(exactEnd - result.result))}
          </Stat>
          <Stat
            label={
              <>
                {t("result.maxError")} <Tex tex="\max_i |y(x_i) - y_i|" />
              </>
            }
          >
            {formatSmall(maxNodeError(result.rows, exact))}
          </Stat>
        </div>
      )}

      {(solutionChart || errorChart) && (
        <div className="grid min-w-0 gap-4">
          {solutionChart && <PlotlyChart title={t("chart.cauchySolution")} spec={solutionChart} />}
          {errorChart && <PlotlyChart title={t("chart.cauchyError")} spec={errorChart} />}
        </div>
      )}

      {result.rows.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">{t("table.node")}</h3>
          <CauchyNodeTable
            rows={result.rows}
            errorAt={result.status === "error" ? result.error?.i : undefined}
            exact={exact}
          />
        </section>
      )}
    </div>
  );
}
