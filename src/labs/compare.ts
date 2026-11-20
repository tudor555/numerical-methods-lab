import type { MessageKey } from "@/i18n/en";
import { toTex } from "@/lib/expressions/compile";
import type { ScalarRunResult, SystemRunResult } from "@/lib/methods/types";
import type {
  Comparison,
  ComparisonPreset,
  FieldDefinition,
  FieldValues,
  MethodDefinition,
  ReadyLab,
} from "./types";

/** One cell of a comparison, with its kind; null when the preset does not pass validation. */
export type ComparisonCell =
  { kind: "scalar"; result: ScalarRunResult } | { kind: "system"; result: SystemRunResult } | null;

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
      if (!prepared.ok) return null;
      const run = prepared.prepared;
      return run.kind === "system"
        ? { kind: "system", result: run.run() }
        : { kind: "scalar", result: run.run() };
    });
  });
}

/** One input of a comparison row as the card lists it: an equation, or a choice such as rule R0. */
export type ComparisonInput =
  { kind: "tex"; tex: string } | { kind: "choice"; symbol: string; labelKey: MessageKey };

/** ε gets its own column per value, and the iteration cap is the same everywhere. */
const NOT_LISTED = new Set(["eps", "maxIter"]);

/**
 * The inputs a comparison row runs with, in form order, so a card can show them before it runs.
 * Hidden fields are left out, [a, b] is one interval, (x₀, y₀) is one point, and a choice shows
 * only when no visible field already gives its value (x₀ typed in replaces "x₀: rule R0").
 */
export function comparisonInputs(
  method: MethodDefinition,
  values: FieldValues,
  separator = ",",
): ComparisonInput[] {
  const visible = method.fields.filter(
    (field) => !NOT_LISTED.has(field.id) && (field.visibleWhen?.(values) ?? true),
  );
  const byId = (id: string) => visible.find((field) => field.id === id);
  // 4b names its radicand `a` too, so [a, b] needs the interval's own b.
  const end = byId("b");
  const intervalEnd = byId("a") && end?.labelKey === "field.b" ? end : undefined;
  const pointEnd = byId("x0") ? byId("y0") : undefined;
  const asTex = (field: FieldDefinition): string => {
    const raw = values[field.id] ?? "";
    try {
      return toTex(raw, field.kind === "expression" ? field.variables : []);
    } catch {
      return raw;
    }
  };

  const inputs: ComparisonInput[] = [];
  for (const field of visible) {
    if (field.kind === "choice") {
      const option = field.options.find((o) => o.value === values[field.id]);
      const given = visible.some((other) => other !== field && other.symbol === field.symbol);
      if (option && !given) {
        inputs.push({ kind: "choice", symbol: field.symbol, labelKey: option.labelKey });
      }
    } else if (intervalEnd && field.id === "a") {
      const [a, b] = [asTex(field), asTex(intervalEnd)];
      inputs.push({ kind: "tex", tex: `[a${separator}\\ b] = [${a}${separator}\\ ${b}]` });
    } else if (pointEnd && field.id === "x0") {
      const [x, y] = [asTex(field), asTex(pointEnd)];
      inputs.push({
        kind: "tex",
        tex: `(x_0${separator}\\ y_0) = (${x}${separator}\\ ${y})`,
      });
    } else if (field !== intervalEnd && field !== pointEnd) {
      inputs.push({ kind: "tex", tex: `${field.symbol} = ${asTex(field)}` });
    }
  }
  return inputs;
}
