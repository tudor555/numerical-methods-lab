"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/provider";
import type { ChartLabels } from "./charts";

/** One result tile: a label and a large value. */
export function Stat({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-border bg-raised min-w-0 rounded-lg border px-4 py-2">
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="mt-2 truncate font-mono text-xl tabular-nums sm:text-2xl">{children}</div>
    </div>
  );
}

/** Every chart trace name, in the current language. */
export function useChartLabels(): ChartLabels {
  const { t } = useI18n();
  return useMemo(
    () => ({
      f: t("chart.trace.f"),
      iterates: t("chart.trace.iterates"),
      tangents: t("chart.trace.tangents"),
      secants: t("chart.trace.secants"),
      steffensenSteps: t("chart.trace.steffensenSteps"),
      halleySteps: t("chart.trace.halleySteps"),
      chebyshevSteps: t("chart.trace.chebyshevSteps"),
      combinedSteps: t("chart.trace.combinedSteps"),
      phi: t("chart.trace.phi"),
      identity: t("chart.trace.identity"),
      path: t("chart.trace.path"),
      diff: t("chart.trace.diff"),
      eps: t("chart.trace.eps"),
      error: t("chart.trace.error"),
      curveF: t("chart.trace.curveF"),
      curveG: t("chart.trace.curveG"),
      diffY: t("chart.trace.diffY"),
      systemError: t("chart.trace.systemError"),
    }),
    [t],
  );
}
