import type { ScalarRunResult } from "@/lib/methods/types";
import type { Comparison, ComparisonPreset, MethodDefinition, ReadyLab } from "./types";

/** One cell of a comparison; null when the preset does not pass validation. */
export type ComparisonCell = ScalarRunResult | null;

/** A method a comparison row names: one of the lab's tabs, or one used only in comparisons. */
export function findComparisonMethod(lab: ReadyLab, id: string): MethodDefinition | undefined {
  return [...lab.methods, ...(lab.comparisonOnly?.methods ?? [])].find((m) => m.id === id);
}

/** A preset a comparison row names: a worked example, or inputs used only in comparisons. */
export function findComparisonPreset(lab: ReadyLab, id: string): ComparisonPreset | undefined {
  return [...lab.presets, ...(lab.comparisonOnly?.presets ?? [])].find((p) => p.id === id);
}

/** Runs every row × ε of a comparison from its presets, with ε replaced per column. */
export function runComparison(lab: ReadyLab, comparison: Comparison): ComparisonCell[][] {
  return comparison.rows.map(({ methodId, presetId }) => {
    const method = findComparisonMethod(lab, methodId);
    const preset = findComparisonPreset(lab, presetId);
    return comparison.eps.map((eps) => {
      if (!method || !preset) return null;
      const prepared = method.prepare({ ...preset.values, eps: String(eps) });
      return prepared.ok ? prepared.prepared.run() : null;
    });
  });
}
