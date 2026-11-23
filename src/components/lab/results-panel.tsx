"use client";

import { useMemo } from "react";
import type { MessageKey } from "@/i18n/en";
import { useI18n } from "@/i18n/provider";
import type { RunView } from "@/labs/lab-state";
import type { FunctionPlot, MethodDefinition } from "@/labs/types";
import { formatSmall, formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildConvergenceChart, buildFunctionChart } from "./charts";
import { Tex } from "./formula";
import { IterationTable } from "./iteration-table";
import { PlotlyChart } from "./plotly-chart";
import { Stat, useChartLabels } from "./results-common";
import { runErrorKey, STATUS_STYLE, StatusBadge } from "./status";
import { SystemResultsPanel } from "./system-results-panel";

export type { RunView };

const CHART_TITLE = {
  tangent: "chart.tangent",
  secant: "chart.secant",
  steffensen: "chart.steffensen",
  halley: "chart.halley",
  chebyshev: "chart.chebyshev",
  "combined-tangent": "chart.combinedTangent",
  cobweb: "chart.cobweb",
} as const satisfies Record<FunctionPlot["kind"], MessageKey>;

type ScalarRunView = Exclude<RunView, { kind: "system" }>;

/** Picks the panel for the run's kind before any hook runs, so each panel keeps its own hooks. */
export function ResultsPanel({
  view,
  valueColumn,
  errorKeys,
}: {
  view: RunView;
  valueColumn?: string;
  errorKeys?: MethodDefinition["errorKeys"];
}) {
  if (view.kind === "system") return <SystemResultsPanel view={view} />;
  return <ScalarResultsPanel view={view} valueColumn={valueColumn} errorKeys={errorKeys} />;
}

function ScalarResultsPanel({
  view,
  valueColumn,
  errorKeys,
}: {
  view: ScalarRunView;
  valueColumn?: string;
  errorKeys?: MethodDefinition["errorKeys"];
}) {
  const { t } = useI18n();
  const { result, plot, eps, exact } = view;
  const style = STATUS_STYLE[result.status];

  let message: string;
  if (result.status === "converged") {
    message = t("result.converged", { n: result.n });
  } else if (result.status === "max-iterations") {
    message = t("result.maxIterations", { n: result.n });
  } else {
    const error = result.error;
    const detail = t(runErrorKey(error?.code, errorKeys), {
      n: error?.n ?? 0,
      x: formatValue(error?.x ?? Number.NaN),
    });
    message = result.iterations.length > 0 ? `${detail} ${t("result.partial")}` : detail;
  }

  const labels = useChartLabels();

  const functionChart = useMemo(
    () => (plot ? buildFunctionChart(plot, result.iterations, labels) : null),
    [plot, result, labels],
  );
  const convergenceChart = useMemo(
    () => buildConvergenceChart(result.iterations, eps, labels, exact?.value),
    [result, eps, labels, exact],
  );

  const start = result.iterations[0];

  return (
    <div className="flex flex-col gap-4">
      <div
        role={result.status === "converged" ? "status" : "alert"}
        className={cn("flex flex-col gap-2 rounded-xl border p-4", style.tint)}
      >
        <StatusBadge status={result.status} />
        <p className="text-base">{message}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Stat
          label={
            <>
              {t("result.value")} <Tex tex="x_n" />
            </>
          }
        >
          {result.result === null ? "—" : formatValue(result.result)}
        </Stat>
        <Stat
          label={
            <>
              {t("result.iterations")} <Tex tex="n" />
            </>
          }
        >
          {result.n}
        </Stat>
        <Stat
          label={
            <>
              {t("result.start")} <Tex tex="x_0" />
              {result.x0Rule && <> · {t("result.startRule", { end: result.x0Rule })}</>}
            </>
          }
        >
          {start ? formatValue(start.x) : "—"}
        </Stat>
      </div>

      {exact && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
          <Stat
            label={
              <>
                {t("result.exact")} <Tex tex={exact.tex} />
              </>
            }
          >
            {formatValue(exact.value)}
          </Stat>
          <Stat
            label={
              <>
                {t("result.error")} <Tex tex={`|x_n - ${exact.tex}|`} />
              </>
            }
          >
            {result.result === null ? "—" : formatSmall(Math.abs(result.result - exact.value))}
          </Stat>
        </div>
      )}

      {(functionChart || convergenceChart) && (
        <div className="grid min-w-0 gap-4">
          {functionChart && plot && (
            <PlotlyChart title={t(CHART_TITLE[plot.kind])} spec={functionChart} />
          )}
          {convergenceChart && (
            <PlotlyChart title={t("chart.convergence")} spec={convergenceChart} />
          )}
        </div>
      )}

      {result.iterations.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">{t("table.title")}</h3>
          <IterationTable
            rows={result.iterations}
            valueColumn={valueColumn}
            errorAt={result.status === "error" ? result.error?.n : undefined}
            exact={exact}
          />
        </section>
      )}
    </div>
  );
}
