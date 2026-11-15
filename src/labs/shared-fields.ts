import type { ParsedFields } from "./fields";
import type { ExplanationBlock, FieldDefinition, FieldValues, NumberField } from "./types";

/** Form fields and checks shared by the root-finding labs. */

export const X = ["x"] as const;

export const functionField: FieldDefinition = {
  id: "f",
  kind: "expression",
  symbol: "f(x)",
  labelKey: "field.f",
  variables: X,
};

export const intervalFields: readonly FieldDefinition[] = [
  { id: "a", kind: "number", symbol: "a", labelKey: "field.a" },
  { id: "b", kind: "number", symbol: "b", labelKey: "field.b" },
];

/** Rule R0 as a display formula. */
export const ruleR0Formula: ExplanationBlock = {
  kind: "formula",
  tex: "x_0 = \\begin{cases} a, & \\text{⟪if⟫}\\ f(a)\\,f''(a) > 0 \\\\ b, & \\text{⟪if⟫}\\ f(a)\\,f''(a) \\le 0 \\end{cases}",
  words: { if: "math.if" },
};

/** dda = f″(a) for rule R0, with "derive from f". */
export function ddaField(visibleWhen?: (values: FieldValues) => boolean): NumberField {
  return {
    id: "dda",
    kind: "number",
    symbol: "\\mathrm{dda} = f''(a)",
    labelKey: "field.dda",
    visibleWhen,
    derive: { from: "f", order: 2, at: "a" },
  };
}

export const epsField: FieldDefinition = {
  id: "eps",
  kind: "number",
  symbol: "\\varepsilon",
  labelKey: "field.eps",
  rule: { positive: true },
};

export const maxIterField: FieldDefinition = {
  id: "maxIter",
  kind: "number",
  symbol: "N_{\\max}",
  labelKey: "field.maxIter",
  // Runs are synchronous, so the cap bounds how long a run that never converges can block the page.
  rule: { integer: true, min: 1, max: 100000 },
};

/** Adds the "b must be greater than a" error when both ends parsed. */
export function checkInterval({ numbers, errors }: ParsedFields): void {
  if (numbers.a !== undefined && numbers.b !== undefined && !(numbers.a < numbers.b)) {
    errors.b = { key: "field.error.greater-than", params: { other: "a" } };
  }
}
