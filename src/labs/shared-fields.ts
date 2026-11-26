import type { ParsedFields } from "./fields";
import type { ExplanationBlock, FieldDefinition, FieldValues, NumberField } from "./types";

// Form fields and checks shared by the labs.

export const X = ["x"] as const;

/** The variables of a 2×2 system's functions. */
export const XY = ["x", "y"] as const;

/** The variables of a system with three unknowns. */
export const XYZ = ["x", "y", "z"] as const;

/**
 * Bound on interval ends and starting values. The labs work on small intervals; beyond this the
 * charts and tables stop being readable and double precision leaves few meaningful digits.
 */
export const VALUE_LIMIT = 1e6;
export const valueRule = { min: -VALUE_LIMIT, max: VALUE_LIMIT };

/** A radicand: 1b's c and 4b's a lie in (0, 10⁶]. */
export const radicandRule = { positive: true, max: VALUE_LIMIT } as const;

export const functionField: FieldDefinition = {
  id: "f",
  kind: "expression",
  symbol: "f(x)",
  labelKey: "field.f",
  variables: X,
};

export const derivativeField: FieldDefinition = {
  id: "df",
  kind: "expression",
  symbol: "f'(x)",
  labelKey: "field.df",
  variables: X,
  derive: { from: "f" },
};

export const secondDerivativeField: FieldDefinition = {
  id: "ddf",
  kind: "expression",
  symbol: "f''(x)",
  labelKey: "field.ddf",
  variables: X,
  derive: { from: "f", order: 2 },
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

/** True unless the user chose to type x₀ in directly. */
export const usesRuleR0 = (values: FieldValues) => values.x0Mode !== "manual";

/** The switch between rule R0 and a typed-in x₀. */
export const x0ModeField: FieldDefinition = {
  id: "x0Mode",
  kind: "choice",
  symbol: "x_0",
  labelKey: "field.x0Mode",
  options: [
    { value: "r0", labelKey: "field.x0Mode.r0" },
    { value: "manual", labelKey: "field.x0Mode.manual" },
  ],
};

/** x₀ typed in directly; shown only when the x₀ switch is on "Enter x₀". */
export const manualX0Field: FieldDefinition = {
  id: "x0",
  kind: "number",
  symbol: "x_0",
  labelKey: "field.x0",
  rule: valueRule,
  visibleWhen: (values) => !usesRuleR0(values),
};

/** The R0 input dda = f″(a). Lab 1 hides it when the user types x₀ in directly. */
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

/** The precisions the labs' comparisons run over: ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}. */
export const EPS_SET = [1e-4, 1e-8, 1e-12] as const;

// Form fields shared by the Cauchy-problem labs (7–9): y′ = f(x, y), y(x₀) = y₀ on [x₀, x₀ + T].

/** Most steps n a Cauchy run may take: runs are synchronous, and a table of 10⁴ nodes stays usable. */
export const NODE_LIMIT = 10000;

/** The lab's inputs x₀, y₀, T, n and f, then the optional exact solution y(x). */
export const cauchyFields: readonly FieldDefinition[] = [
  { id: "x0", kind: "number", symbol: "x_0", labelKey: "field.cauchyX0", rule: valueRule },
  {
    id: "y0",
    kind: "number",
    symbol: "y_0 = y(x_0)",
    labelKey: "field.cauchyY0",
    rule: valueRule,
  },
  {
    id: "T",
    kind: "number",
    symbol: "T",
    labelKey: "field.T",
    rule: { positive: true, max: VALUE_LIMIT },
  },
  {
    id: "n",
    kind: "number",
    symbol: "n",
    labelKey: "field.steps",
    rule: { integer: true, min: 1, max: NODE_LIMIT },
  },
  { id: "f", kind: "expression", symbol: "f(x, y)", labelKey: "field.fxy", variables: XY },
  {
    id: "exact",
    kind: "expression",
    symbol: "y(x)",
    labelKey: "field.exactY",
    variables: X,
    optional: true,
  },
];

/** Adds the "b must be greater than a" error when both ends parsed. */
export function checkInterval({ numbers, errors }: ParsedFields): void {
  if (numbers.a !== undefined && numbers.b !== undefined && !(numbers.a < numbers.b)) {
    errors.b = { key: "field.error.greater-than", params: { other: "a" } };
  }
}
