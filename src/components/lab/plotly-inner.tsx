"use client";

import {
  Download,
  Hand,
  RotateCcw,
  SquareDashedMousePointer,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import Plotly from "plotly.js-dist-min";
import { useEffect, useRef, useState } from "react";
import type { MessageKey } from "@/i18n/en";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { fileName, zoomRange, type ChartSpec } from "./charts";

const EMBER = {
  card: "#1A1816",
  text: "#F3EEE9",
  muted: "#ABA298",
  border: "#3A342E",
  raised: "#24211E",
  axis: "#6B625A",
};

const axisBase: Partial<Plotly.LayoutAxis> = {
  gridcolor: EMBER.border,
  zerolinecolor: EMBER.axis,
  linecolor: EMBER.border,
  tickfont: { color: EMBER.muted },
  automargin: true,
};

// We draw our own toolbar, so the Romanian locale only needs the one hint Plotly still shows.
// `format` stays empty so numbers keep the decimal point, as in the inputs and the table.
Plotly.register({
  moduleType: "locale",
  name: "ro",
  dictionary: { "Double-click to zoom back out": "Dublu clic pentru a reveni" },
  format: {},
} as unknown as Parameters<typeof Plotly.register>[0]);

type DragMode = "zoom" | "pan";

/** Zooms both axes around their centre. Log axes work too: Plotly keeps their range in log10 units. */
function zoomBy(el: HTMLElement, factor: number) {
  // Only the private `_fullLayout` has the range on screen; the public layout has none on autorange.
  const full = (el as unknown as { _fullLayout?: Record<string, { range?: number[] }> })
    ._fullLayout;
  if (!full) return;
  const update: Record<string, number[]> = {};
  for (const axis of ["xaxis", "yaxis"]) {
    const range = full[axis]?.range;
    if (range) update[`${axis}.range`] = zoomRange(range, factor);
  }
  void Plotly.relayout(el, update as unknown as Partial<Plotly.Layout>);
}

function ToolButton({
  icon: Icon,
  label,
  pressed,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "focus-visible:ring-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2",
        pressed
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-card hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

/** Renders one chart with its title and an app-styled toolbar. Loaded only in the browser (see PlotlyChart). */
export default function PlotlyInner({ title, spec }: { title: string; spec: ChartSpec }) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<DragMode>("zoom");
  const modeRef = useRef<DragMode>(mode);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      margin: { l: 56, r: 16, t: 8, b: 48 },
      // The card colour, so the chart blends in and the PNG export has the same background.
      paper_bgcolor: EMBER.card,
      plot_bgcolor: EMBER.card,
      font: {
        family: "var(--font-geist-sans), system-ui, sans-serif",
        color: EMBER.muted,
        size: 14,
      },
      hovermode: "closest",
      hoverlabel: { bgcolor: EMBER.raised, bordercolor: EMBER.border, font: { color: EMBER.text } },
      legend: { orientation: "h", x: 0, y: 1.02, yanchor: "bottom", font: { color: EMBER.text } },
      dragmode: modeRef.current,
      xaxis: { ...axisBase, title: { text: spec.xTitle } },
      yaxis: {
        ...axisBase,
        title: { text: spec.yTitle },
        type: spec.yLog ? "log" : "linear",
        exponentformat: "power",
      },
    };
    void Plotly.react(el, spec.traces, layout, {
      locale: lang,
      responsive: true,
      displaylogo: false,
      displayModeBar: false,
    });
  }, [spec, lang]);

  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) Plotly.purge(el);
    };
  }, []);

  const changeMode = (next: DragMode) => {
    modeRef.current = next;
    setMode(next);
    if (ref.current) void Plotly.relayout(ref.current, { dragmode: next });
  };

  const tools: { key: MessageKey; icon: LucideIcon; run: () => void; pressed?: boolean }[] = [
    {
      key: "chart.tool.zoom",
      icon: SquareDashedMousePointer,
      run: () => changeMode("zoom"),
      pressed: mode === "zoom",
    },
    { key: "chart.tool.pan", icon: Hand, run: () => changeMode("pan"), pressed: mode === "pan" },
    { key: "chart.tool.zoomIn", icon: ZoomIn, run: () => ref.current && zoomBy(ref.current, 0.5) },
    { key: "chart.tool.zoomOut", icon: ZoomOut, run: () => ref.current && zoomBy(ref.current, 2) },
    {
      key: "chart.tool.reset",
      icon: RotateCcw,
      run: () =>
        ref.current &&
        void Plotly.relayout(ref.current, { "xaxis.autorange": true, "yaxis.autorange": true }),
    },
    {
      key: "chart.tool.download",
      icon: Download,
      run: () =>
        ref.current &&
        void Plotly.downloadImage(ref.current, {
          format: "png",
          filename: fileName(title),
          width: ref.current.clientWidth * 2,
          height: ref.current.clientHeight * 2,
        }),
    },
  ];

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-base font-medium">{title}</figcaption>
        <div
          role="toolbar"
          aria-label={t("chart.toolbar")}
          className="border-border bg-raised flex items-center gap-1 rounded-lg border p-1"
        >
          {tools.map((tool, i) => (
            <span key={tool.key} className="contents">
              {/* A thin divider between the two drag modes and the one-shot actions. */}
              {i === 2 && <span className="bg-border mx-1 h-4 w-px" aria-hidden />}
              <ToolButton
                icon={tool.icon}
                label={t(tool.key)}
                pressed={tool.pressed}
                onClick={tool.run}
              />
            </span>
          ))}
        </div>
      </div>
      <div ref={ref} className="h-80 w-full" />
    </>
  );
}
