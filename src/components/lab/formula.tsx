"use client";

import katex from "katex";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Iteration tables repeat the same few labels in every row on a phone, so each TeX renders once.
const rendered = new Map<string, string>();

function render(tex: string, displayMode: boolean): string {
  const key = `${displayMode ? "display" : "inline"}:${tex}`;
  let html = rendered.get(key);
  if (html === undefined) {
    html = katex.renderToString(tex, { displayMode, throwOnError: false, output: "htmlAndMathml" });
    rendered.set(key, html);
  }
  return html;
}

export function Tex({ tex, className }: { tex: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: render(tex, false) }} />;
}

/** The smallest scale a display formula shrinks to; below it, the formula scrolls instead. */
export const MIN_FORMULA_SCALE = 0.75;

/**
 * The font scale that fits a formula `needed` px wide into `available` px: 1 when it fits,
 * else the ratio rounded down to a hundredth, never below {@link MIN_FORMULA_SCALE}.
 */
export function formulaScale(available: number, needed: number): number {
  if (needed <= available || needed <= 0) return 1;
  return Math.max(MIN_FORMULA_SCALE, Math.floor((available / needed) * 100) / 100);
}

/**
 * Shrinks each display formula just enough to fit its block, so it reads whole on a phone instead
 * of scrolling. It refits when the block resizes and once the math fonts have loaded.
 */
function useFitToWidth(tex: string) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;
    const displays = [...box.querySelectorAll<HTMLElement>(".katex-display")];
    const fit = () => {
      for (const display of displays) display.style.fontSize = "";
      for (const display of displays) {
        const scale = formulaScale(display.clientWidth, display.scrollWidth);
        if (scale < 1) display.style.fontSize = `${scale}em`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    let active = true;
    void document.fonts?.ready.then(() => active && fit());
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [tex]);
  return ref;
}

/** A trailing ", \qquad n = 0, 1, 2, …": it sits beside the formula, or below it on a narrow screen. */
const INDEX_RANGE = /,\s*\\qquad\s*(.+)$/;

/** Display formula in a raised block; a long one shrinks to fit a narrow screen. */
export function Formula({ tex, className }: { tex: string; className?: string }) {
  const ref = useFitToWidth(tex);
  const range = INDEX_RANGE.exec(tex);
  const parts = range ? [`${tex.slice(0, range.index)},`, range[1]] : [tex];
  return (
    <div
      ref={ref}
      // min-w-0 keeps a long formula inside its block instead of widening a grid column.
      className={cn(
        "border-border bg-raised flex min-w-0 flex-wrap items-center justify-center gap-x-8 rounded-lg border px-2 py-4 sm:px-4",
        className,
      )}
    >
      {parts.map((part) => (
        <div
          key={part}
          // A lone formula fills the row; a split one sizes to its content so the range can sit beside it.
          className={cn("max-w-full min-w-0", parts.length === 1 && "w-full")}
          dangerouslySetInnerHTML={{ __html: render(part, true) }}
        />
      ))}
    </div>
  );
}

/** Text with inline TeX between `$…$`. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/\$([^$]+)\$/g);
  return <>{parts.map((part, i) => (i % 2 === 1 ? <Tex key={i} tex={part} /> : part))}</>;
}
