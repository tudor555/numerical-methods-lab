"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/provider";
import type { RunView } from "@/labs/lab-state";
import { formatPoint, formatSmall, formatValue, pointValues } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildComponentsChart, buildPathChart, buildSystemConvergenceChart } from "./charts";
import { Tex } from "./formula";
import { PlotlyChart } from "./plotly-chart";
import { Stat, useChartLabels } from "./results-common";
import { STATUS_STYLE, StatusBadge, systemErrorKey } from "./status";
import { SYSTEM_ERROR_TEX, SystemIterationTable } from "./system-iteration-table";

type SystemRunView = Extract<RunView, { kind: "system" }>;

/**
 * Results of a system run: status, xₙ, yₙ (and zₙ), n, the start, charts and the table. A run with
 * three unknowns has no plane to draw its path on, so it charts each component against n instead.
 */
export function SystemResultsPanel({ view }: { view: SystemRunView }) {
  const { t, lang } = useI18n();
  const { result, plot, eps, exact } = view;
  const separator = lang === "ro" ? ";" : ",";
  const style = STATUS_STYLE[result.status];
  const start = result.iterations[0];
  const threeUnknowns = start?.z !== undefined;

  let message: string;
  if (result.status === "converged") {
    message = t(threeUnknowns ? "result.system3.converged" : "result.system.converged", {
      n: result.n,
    });
  } else if (result.status === "max-iterations") {
    message = t(threeUnknowns ? "result.system3.maxIterations" : "result.system.maxIterations", {
      n: result.n,
    });
  } else {
    const error = result.error;
    const detail = t(systemErrorKey(error?.code, threeUnknowns), {
      n: error?.n ?? 0,
      point: formatPoint(pointValues(error), separator),
    });
    message = result.iterations.length > 0 ? `${detail} ${t("result.partial")}` : detail;
  }

  const labels = useChartLabels();
  const pathChart = useMemo(
    () => buildPathChart(plot, result.iterations, labels),
    [plot, result, labels],
  );
  const componentsChart = useMemo(
    () => (plot.kind === "fixed-point-3d" ? buildComponentsChart(result.iterations, labels) : null),
    [plot, result, labels],
  );
  const convergenceChart = useMemo(
    () => buildSystemConvergenceChart(result.iterations, eps, labels, exact),
    [result, eps, labels, exact],
  );
  const pathTitle = plot.kind === "system" ? t("chart.path") : t("chart.fixedPointPath");

  const value = result.result;
  const startTex = threeUnknowns
    ? `(x_0${separator} y_0${separator} z_0)`
    : `(x_0${separator} y_0)`;

  return (
    <div className="flex flex-col gap-4">
      <div
        role={result.status === "converged" ? "status" : "alert"}
        className={cn("flex flex-col gap-2 rounded-xl border p-4", style.tint)}
      >
        <StatusBadge status={result.status} />
        <p className="text-base">{message}</p>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2",
          // Three 15-digit values side by side would be cut off, so zₙ and n share the second row.
          !threeUnknowns && "xl:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)]",
        )}
      >
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
        {threeUnknowns && (
          <Stat
            label={
              <>
                {t("result.value")} <Tex tex="z_n" />
              </>
            }
          >
            {value === null ? "—" : formatValue(value.z ?? Number.NaN)}
          </Stat>
        )}
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
              {t("result.startPoint")} <Tex tex={startTex} />
            </>
          }
        >
          {start ? formatPoint(pointValues(start), separator) : "—"}
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
              {formatPoint([exact.x, exact.y], separator)}
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

      {(pathChart || componentsChart || convergenceChart) && (
        <div className="grid min-w-0 gap-4">
          {pathChart && <PlotlyChart title={pathTitle} spec={pathChart} />}
          {componentsChart && <PlotlyChart title={t("chart.components")} spec={componentsChart} />}
          {convergenceChart && (
            <PlotlyChart
              title={t(threeUnknowns ? "chart.system3Convergence" : "chart.systemConvergence")}
              spec={convergenceChart}
            />
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
