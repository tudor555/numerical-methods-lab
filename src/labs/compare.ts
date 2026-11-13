import type { ScalarRunResult } from "@/lib/methods/types";
import type { Comparison, ReadyLab } from "./types";

/** One cell of a comparison; null when the preset does not pass validation. */
export type ComparisonCell = ScalarRunResult | null;

/** Runs every row × ε of a comparison from its presets, with ε replaced per column. */
export function runComparison(lab: ReadyLab, comparison: Comparison): ComparisonCell[][] {
  return comparison.rows.map(({ methodId, presetId }) => {
    const method = lab.methods.find((m) => m.id === methodId);
    const preset = lab.presets.find((p) => p.id === presetId);
    return comparison.eps.map((eps) => {
      if (!method || !preset) return null;
      const prepared = method.prepare({ ...preset.values, eps: String(eps) });
      return prepared.ok ? prepared.prepared.run() : null;
    });
  });
}
