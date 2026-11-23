"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/provider";
import type { RunView } from "@/labs/lab-state";
import { formatPoint, formatSmall, formatValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildPathChart, buildSystemConvergenceChart } from "./charts";
import { Tex } from "./formula";
import { PlotlyChart } from "./plotly-chart";
import { Stat, useChartLabels } from "./results-common";
import { STATUS_STYLE, StatusBadge, systemErrorKey } from "./status";
import { SYSTEM_ERROR_TEX, SystemIterationTable } from "./system-iteration-table";

type SystemRunView = Extract<RunView, { kind: "system" }>;

/** Results of a 2×2 system run: status, xₙ, yₙ, n, the start, charts and the table. */
export function SystemResultsPanel({ view }: { view: SystemRunView }) {
  const { t, lang } = useI18n();
  const { result, plot, eps, exact } = view;
  const separator = lang === "ro" ? ";" : ",";
  const style = STATUS_STYLE[result.status];

  let message: string;
  if (result.status === "converged") {
    message = t("result.system.converged", { n: result.n });
  } else if (result.status === "max-iterations") {
    message = t("result.system.maxIterations", { n: result.n });
  } else {
    const error = result.error;
    const detail = t(systemErrorKey(error?.code), {
      n: error?.n ?? 0,
      point: formatPoint(error?.x ?? Number.NaN, error?.y ?? Number.NaN, separator),
    });
    message = result.iterations.length > 0 ? `${detail} ${t("result.partial")}` : detail;
  }

  const labels = useChartLabels();
  const pathChart = useMemo(
    () => buildPathChart(plot, result.iterations, labels),
    [plot, result, labels],
  );
  const convergenceChart = useMemo(
    () => buildSystemConvergenceChart(result.iterations, eps, labels, exact),
    [result, eps, labels, exact],
  );

  const start = result.iterations[0];
  const value = result.result;

  return (
    <div className="flex flex-col gap-4">
      <div
        role={result.status === "converged" ? "status" : "alert"}
        className={cn("flex flex-col gap-2 rounded-xl border p-4", style.tint)}
      >
        <StatusBadge status={result.status} />
        <p className="text-base">{message}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)]">
        <Stat
          label={
            <>
              {t("result.value")} <Tex tex="x_n" />
            </>
          }
        >
          {value === null ? "—" : formatValue(value.x)}
        </Stat>
        <Stat
          label={
            <>
              {t("result.value")} <Tex tex="y_n" />
            </>
          }
        >
          {value === null ? "—" : formatValue(value.y)}
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
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          exact && "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-3",
        )}
      >
        <Stat
          label={
            <>
              {t("result.startPoint")} <Tex tex={`(x_0${separator} y_0)`} />
            </>
          }
        >
          {start ? formatPoint(start.x, start.y, separator) : "—"}
        </Stat>
        {exact && (
          <>
            <Stat
              label={
                <>
                  {t("result.exactSolution")} <Tex tex={`(x^*${separator} y^*)`} />
                </>
              }
            >
              {formatPoint(exact.x, exact.y, separator)}
            </Stat>
            <Stat
              label={
                <>
                  {t("result.error")} <Tex tex={SYSTEM_ERROR_TEX} />
                </>
              }
            >
              {value === null
                ? "—"
                : formatSmall(Math.max(Math.abs(value.x - exact.x), Math.abs(value.y - exact.y)))}
            </Stat>
          </>
        )}
      </div>

      {(pathChart || convergenceChart) && (
        <div className="grid min-w-0 gap-4">
          {pathChart && <PlotlyChart title={t("chart.path")} spec={pathChart} />}
          {convergenceChart && (
            <PlotlyChart title={t("chart.systemConvergence")} spec={convergenceChart} />
          )}
        </div>
      )}

      {result.iterations.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">{t("table.title")}</h3>
          <SystemIterationTable
            rows={result.iterations}
            errorAt={result.status === "error" ? result.error?.n : undefined}
            exact={exact}
          />
        </section>
      )}
    </div>
  );
}
