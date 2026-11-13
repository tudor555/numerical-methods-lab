"use client";

import { useMemo } from "react";
import type { MessageKey } from "@/i18n/en";
import { useI18n } from "@/i18n/provider";
import type { RunView } from "@/labs/lab-state";
import { formatSmall, formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildConvergenceChart, buildFunctionChart, type ChartLabels } from "./charts";
import { Tex } from "./formula";
import { IterationTable } from "./iteration-table";
import { PlotlyChart } from "./plotly-chart";
import { STATUS_STYLE, StatusBadge } from "./status";

export type { RunView };

function Stat({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-border bg-raised min-w-0 rounded-lg border px-4 py-2">
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="mt-2 truncate font-mono text-xl tabular-nums sm:text-2xl">{children}</div>
    </div>
  );
}

export function ResultsPanel({ view, valueColumn }: { view: RunView; valueColumn?: string }) {
  const { t } = useI18n();
  const { result, plot, eps, exact } = view;
  const style = STATUS_STYLE[result.status];
  const Icon = style.icon;

  let message: string;
  if (result.status === "converged") {
    message = t("result.converged", { n: result.n });
  } else if (result.status === "max-iterations") {
    message = t("result.maxIterations", { n: result.n });
  } else {
    const error = result.error;
    const key = `run.error.${error?.code ?? "undefined-value"}` satisfies MessageKey;
    const detail = t(key, { n: error?.n ?? 0, x: formatValue(error?.x ?? Number.NaN) });
    message = result.iterations.length > 0 ? `${detail} ${t("result.partial")}` : detail;
  }

  const labels: ChartLabels = useMemo(
    () => ({
      f: t("chart.trace.f"),
      iterates: t("chart.trace.iterates"),
      tangents: t("chart.trace.tangents"),
      phi: t("chart.trace.phi"),
      identity: t("chart.trace.identity"),
      path: t("chart.trace.path"),
      diff: t("chart.trace.diff"),
      eps: t("chart.trace.eps"),
      error: t("chart.trace.error"),
    }),
    [t],
  );

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
        className={cn("flex items-start gap-4 rounded-xl border p-4 sm:p-4", style.tint)}
      >
        <Icon className={cn("mt-1 size-6 shrink-0", style.text)} aria-hidden />
        <div className="flex min-w-0 flex-col gap-2">
          <StatusBadge status={result.status} />
          <p className="text-base">{message}</p>
        </div>
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
            <PlotlyChart
              title={t(plot.kind === "tangent" ? "chart.tangent" : "chart.cobweb")}
              spec={functionChart}
            />
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
