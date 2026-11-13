"use client";

import dynamic from "next/dynamic";
import type { ChartSpec } from "./charts";

// Plotly needs `window`, so it is only ever loaded in the browser.
const PlotlyInner = dynamic(() => import("./plotly-inner"), {
  ssr: false,
  loading: () => <div className="bg-raised/60 h-90 w-full animate-pulse rounded-lg" />,
});

export function PlotlyChart({ title, spec }: { title: string; spec: ChartSpec }) {
  return (
    <figure className="border-border bg-card min-w-0 rounded-xl border p-4">
      <PlotlyInner title={title} spec={spec} />
    </figure>
  );
}
