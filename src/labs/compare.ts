import type { MessageKey } from "@/i18n/en";
import { toTex } from "@/lib/expressions/compile";
import type { CauchyRunResult, ScalarRunResult, SystemRunResult } from "@/lib/methods/types";
import type {
  Comparison,
  ComparisonPreset,
  FieldDefinition,
  FieldValues,
  MethodDefinition,
  NodeComparison,
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

/**
 * Runs every row × ε of a precision comparison from its presets, with ε replaced per column. A
 * node comparison has no ε: run it with {@link runNodeComparison}.
 */
export function runComparison(lab: ReadyLab, comparison: Comparison): ComparisonCell[][] {
  if (comparison.kind === "nodes") throw new Error(`${comparison.id} is a node comparison`);
  return comparison.rows.map(({ methodId, presetId }) => {
    const method = findComparisonMethod(lab, methodId);
    const preset = findComparisonPreset(lab, presetId);
    return comparison.eps.map((eps) => {
      if (!method || !preset) return null;
      const prepared = method.prepare({ ...preset.values, eps: String(eps) });
      if (!prepared.ok) return null;
      const run = prepared.prepared;
      if (run.kind === "cauchy") return null;
      return run.kind === "system"
        ? { kind: "system", result: run.run() }
        : { kind: "scalar", result: run.run() };
    });
  });
}

/**
 * One row of a node comparison: the Cauchy run and the exact solution its preset gives; null when
 * the method or preset is unknown, the preset does not pass validation or it is not a Cauchy run.
 */
export type NodeComparisonCell = {
  result: CauchyRunResult;
  exact?: (x: number) => number;
} | null;

/** Runs every row of a node comparison from its preset, as it is. */
export function runNodeComparison(lab: ReadyLab, comparison: NodeComparison): NodeComparisonCell[] {
  return comparison.rows.map(({ methodId, presetId }) => {
    const method = findComparisonMethod(lab, methodId);
    const preset = findComparisonPreset(lab, presetId);
    if (!method || !preset) return null;
    const prepared = method.prepare(preset.values);
    if (!prepared.ok || prepared.prepared.kind !== "cauchy") return null;
    return { result: prepared.prepared.run(), exact: prepared.prepared.exact };
  });
}

/** One input of a comparison row as the card lists it: an equation, or a choice such as rule R0. */
export type ComparisonInput =
  { kind: "tex"; tex: string } | { kind: "choice"; symbol: string; labelKey: MessageKey };

/** ε gets its own column per value, and the iteration cap is the same everywhere. */
const NOT_LISTED = new Set(["eps", "maxIter"]);

/**
 * The inputs a comparison row runs with, in form order, so a card can show them before it runs.
 * Hidden fields and blank optional ones are left out, [a, b] is one interval, (x₀, y₀) or
 * (x₀, y₀, z₀) is one point, and a choice shows only when no visible field already gives its value
 * (x₀ typed in replaces "x₀: rule R0").
 */
export function comparisonInputs(
  method: MethodDefinition,
  values: FieldValues,
  separator = ",",
): ComparisonInput[] {
  const blankOptional = (field: FieldDefinition) =>
    field.kind === "expression" && field.optional && (values[field.id] ?? "").trim() === "";
  const visible = method.fields.filter(
    (field) =>
      !NOT_LISTED.has(field.id) && (field.visibleWhen?.(values) ?? true) && !blankOptional(field),
  );
  const byId = (id: string) => visible.find((field) => field.id === id);
  // 4b names its radicand `a` too, so [a, b] needs the interval's own b.
  const end = byId("b");
  const intervalEnd = byId("a") && end?.labelKey === "field.b" ? end : undefined;
  const pointEnd = byId("x0") ? byId("y0") : undefined;
  const pointZ = pointEnd ? byId("z0") : undefined;
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
      const parts = [field, pointEnd, ...(pointZ ? [pointZ] : [])];
      const join = (texts: string[]) => texts.join(`${separator}\\ `);
      inputs.push({
        kind: "tex",
        // A Cauchy problem's y₀ reads `y_0 = y(x_0)` in the form; the point needs only `y_0`.
        tex: `(${join(parts.map((p) => p.symbol.split(" = ")[0]))}) = (${join(parts.map(asTex))})`,
      });
    } else if (field !== intervalEnd && field !== pointEnd && field !== pointZ) {
      inputs.push({ kind: "tex", tex: `${field.symbol} = ${asTex(field)}` });
    }
  }
  return inputs;
}
