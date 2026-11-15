import type { ParsedFields } from "./fields";
import type { ExplanationBlock, FieldDefinition, FieldValues, NumberField } from "./types";

/** Form fields and checks shared by the root-finding labs. */

export const X = ["x"] as const;

/**
 * Bound on interval ends and starting values. The labs work on small intervals; beyond this the
 * charts and tables stop being readable and double precision leaves few meaningful digits.
 */
export const VALUE_LIMIT = 1e6;
export const valueRule = { min: -VALUE_LIMIT, max: VALUE_LIMIT };

export const functionField: FieldDefinition = {
  id: "f",
  kind: "expression",
  symbol: "f(x)",
  labelKey: "field.f",
  variables: X,
};

export const intervalFields: readonly FieldDefinition[] = [
  { id: "a", kind: "number", symbol: "a", labelKey: "field.a", rule: valueRule },
  { id: "b", kind: "number", symbol: "b", labelKey: "field.b", rule: valueRule },
];

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
  // Below 10⁻¹⁵ the stopping rule asks for more than double precision can tell apart.
  rule: { min: 1e-15, max: 1 },
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
