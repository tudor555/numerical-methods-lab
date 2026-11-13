import {
  compile,
  derive,
  ExpressionError,
  parseConstant,
  type CompiledFunction,
} from "@/lib/expressions/compile";
import type { MessageKey } from "@/i18n/en";
import type {
  ExpressionField,
  FieldDefinition,
  FieldErrors,
  FieldIssue,
  FieldValues,
  NumberField,
} from "./types";

export function isVisible(field: FieldDefinition, values: FieldValues): boolean {
  return field.visibleWhen ? field.visibleWhen(values) : true;
}

function expressionIssue(error: ExpressionError, variables: readonly string[]): FieldIssue {
  const key = `field.error.${error.code}` satisfies MessageKey;
  return {
    key,
    params: { name: error.detail ?? "", allowed: [...variables, "pi", "e"].join(", ") },
  };
}

function checkRule(field: NumberField, value: number): FieldIssue | undefined {
  const rule = field.rule;
  if (!rule) return undefined;
  const outside =
    (rule.min !== undefined && value < rule.min) || (rule.max !== undefined && value > rule.max);
  if (rule.integer && rule.max !== undefined && (!Number.isInteger(value) || outside)) {
    return { key: "field.error.integer-range", params: { min: rule.min ?? 0, max: rule.max } };
  }
  if (rule.integer && (!Number.isInteger(value) || outside)) {
    return { key: "field.error.integer-min", params: { min: rule.min ?? 0 } };
  }
  if (rule.min !== undefined && value < rule.min)
    return { key: "field.error.min", params: { min: rule.min } };
  if (rule.positive && !(value > 0)) return { key: "field.error.positive" };
  return undefined;
}

export interface ParsedFields {
  numbers: Record<string, number>;
  functions: Record<string, CompiledFunction>;
  choices: Record<string, string>;
  errors: FieldErrors;
}

/** Parses every visible field: numbers as constant expressions, expressions with their declared variables. */
export function parseFields(fields: readonly FieldDefinition[], values: FieldValues): ParsedFields {
  const parsed: ParsedFields = { numbers: {}, functions: {}, choices: {}, errors: {} };
  for (const field of fields) {
    if (!isVisible(field, values)) continue;
    const raw = values[field.id] ?? "";
    if (field.kind === "choice") {
      parsed.choices[field.id] = raw;
      continue;
    }
    try {
      if (field.kind === "number") {
        const value = parseConstant(raw);
        const issue = checkRule(field, value);
        if (issue) parsed.errors[field.id] = issue;
        else parsed.numbers[field.id] = value;
      } else {
        parsed.functions[field.id] = compile(raw, field.variables);
      }
    } catch (error) {
      if (!(error instanceof ExpressionError)) throw error;
      parsed.errors[field.id] = expressionIssue(
        error,
        field.kind === "expression" ? field.variables : [],
      );
    }
  }
  return parsed;
}

/**
 * Formats a derived number for a form field. Rounds to 12 significant digits only when that just
 * removes floating-point noise (0.30000000000000004 → 0.3), so no real precision is lost.
 */
export function formatFieldNumber(value: number): string {
  const short = Number(value.toPrecision(12));
  return String(Math.abs(short - value) <= 1e-15 * Math.max(1, Math.abs(value)) ? short : value);
}

export type DeriveOutcome = { ok: true; value: string } | { ok: false; issue: FieldIssue };

/** Fills an expression or number field from the derivative of another field ("derive from f"). */
export function deriveField(
  field: ExpressionField | NumberField,
  fields: readonly FieldDefinition[],
  values: FieldValues,
): DeriveOutcome {
  if (!field.derive) return { ok: false, issue: { key: "field.error.not-differentiable" } };
  const source = fields.find((f) => f.id === field.derive?.from);
  if (!source || source.kind !== "expression")
    return { ok: false, issue: { key: "field.error.not-differentiable" } };
  const variable = source.variables[0];
  try {
    const order = field.kind === "number" ? field.derive.order : 1;
    let expression = values[source.id] ?? "";
    for (let i = 0; i < order; i++) expression = derive(expression, variable, source.variables);
    if (field.kind === "expression") return { ok: true, value: expression };
    const at = parseConstant(values[field.derive.at] ?? "");
    const value = compile(expression, source.variables)(at);
    return { ok: true, value: formatFieldNumber(value) };
  } catch (error) {
    if (error instanceof ExpressionError) {
      return { ok: false, issue: { key: "field.error.derive-failed" } };
    }
    return { ok: false, issue: { key: "field.error.derive-undefined" } };
  }
}

/** A failed "Derive from f", with the source field's value and the field's own value at the time. */
export interface DeriveFailure {
  issue: FieldIssue;
  source: string;
  own: string;
}

/**
 * The derive failure to show, if any: only while neither the source field nor the field itself has
 * changed since the failure, so a fixed input never keeps a stale message.
 */
export function visibleDeriveIssue(
  failure: DeriveFailure | null,
  source: string,
  own: string,
): FieldIssue | null {
  return failure && failure.source === source && failure.own === own ? failure.issue : null;
}
