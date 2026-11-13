import { describe, expect, it } from "vitest";
import type { MessageKey } from "@/i18n/en";
import {
  deriveField,
  formatFieldNumber,
  isVisible,
  parseFields,
  visibleDeriveIssue,
} from "./fields";
import type { ChoiceField, ExpressionField, FieldDefinition, NumberField } from "./types";

const label = "field.eps" as MessageKey;
const number = (id: string, rule?: NumberField["rule"]): NumberField => ({
  id,
  kind: "number",
  symbol: id,
  labelKey: label,
  rule,
});
const expression = (id: string, variables: string[] = ["x"]): ExpressionField => ({
  id,
  kind: "expression",
  symbol: id,
  labelKey: label,
  variables,
});
const choice: ChoiceField = {
  id: "mode",
  kind: "choice",
  symbol: "m",
  labelKey: label,
  options: [],
};

describe("isVisible", () => {
  it("shows a field without a visibility rule", () => {
    expect(isVisible(number("a"), {})).toBe(true);
  });

  it("follows the field's visibleWhen rule", () => {
    const field = {
      ...number("x0"),
      visibleWhen: (v: Record<string, string>) => v.mode === "manual",
    };
    expect(isVisible(field, { mode: "manual" })).toBe(true);
    expect(isVisible(field, { mode: "r0" })).toBe(false);
  });
});

describe("parseFields", () => {
  it("evaluates number fields as constant expressions", () => {
    expect(parseFields([number("a")], { a: "3*pi/8" }).numbers.a).toBeCloseTo(
      (3 * Math.PI) / 8,
      15,
    );
  });

  it("compiles expression fields over their declared variables", () => {
    const parsed = parseFields([expression("g", ["x", "y"])], { g: "x*y + 1" });
    expect(parsed.functions.g(2, 3)).toBe(7);
  });

  it("passes choice values through unchanged", () => {
    expect(parseFields([choice], { mode: "manual" }).choices).toEqual({ mode: "manual" });
  });

  it("skips hidden fields entirely", () => {
    const hidden = { ...number("a"), visibleWhen: () => false };
    expect(parseFields([hidden], { a: "not a number" })).toEqual({
      numbers: {},
      functions: {},
      choices: {},
      errors: {},
    });
  });

  it("treats a missing value as an empty field", () => {
    expect(parseFields([number("a")], {}).errors.a).toEqual({
      key: "field.error.empty",
      params: { name: "", allowed: "pi, e" },
    });
  });

  it("reports an expression error with the offending symbol and the allowed names", () => {
    expect(parseFields([expression("g")], { g: "x + y" }).errors.g).toEqual({
      key: "field.error.unknown-symbol",
      params: { name: "y", allowed: "x, pi, e" },
    });
  });

  it("lists only pi and e as allowed in a number field", () => {
    expect(parseFields([number("a")], { a: "x" }).errors.a?.params?.allowed).toBe("pi, e");
  });

  it.each([
    [{ positive: true } as const, "0", "field.error.positive", undefined],
    [{ min: 2 }, "1", "field.error.min", { min: 2 }],
    [{ integer: true, min: 2 } as const, "2.5", "field.error.integer-min", { min: 2 }],
    [{ integer: true, min: 2 } as const, "1", "field.error.integer-min", { min: 2 }],
    [{ integer: true } as const, "1.5", "field.error.integer-min", { min: 0 }],
    [
      { integer: true, min: 1, max: 10 } as const,
      "11",
      "field.error.integer-range",
      { min: 1, max: 10 },
    ],
    [{ integer: true, max: 10 } as const, "0.5", "field.error.integer-range", { min: 0, max: 10 }],
  ])("rule %j rejects %s with %s", (rule, raw, key, params) => {
    expect(parseFields([number("n", rule)], { n: raw }).errors.n).toEqual({ key, params });
  });

  it("re-throws an unexpected error instead of reporting it as a field error", () => {
    const bug = new TypeError("bug in rule");
    const broken = {
      ...number("n"),
      get rule(): NumberField["rule"] {
        throw bug;
      },
    };
    expect(() => parseFields([broken], { n: "1" })).toThrow(bug);
  });

  it("accepts numbers that satisfy their rule", () => {
    const fields = [
      number("n", { integer: true, min: 1, max: 10 }),
      number("eps", { positive: true }),
    ];
    const parsed = parseFields(fields, { n: "10", eps: "1e-4" });
    expect(parsed.errors).toEqual({});
    expect(parsed.numbers).toEqual({ n: 10, eps: 1e-4 });
  });
});

describe("formatFieldNumber", () => {
  it("drops floating-point noise", () => {
    expect(formatFieldNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatFieldNumber(6.000000000000001)).toBe("6");
  });

  it("keeps every digit when rounding would change the value", () => {
    expect(formatFieldNumber(1 / 3)).toBe(String(1 / 3));
    expect(formatFieldNumber(Math.PI)).toBe(String(Math.PI));
  });

  it("prints integers and short decimals as they are", () => {
    expect(formatFieldNumber(-20)).toBe("-20");
    expect(formatFieldNumber(0.25)).toBe("0.25");
  });
});

describe("deriveField", () => {
  const f = expression("f");
  const df: ExpressionField = { ...expression("df"), derive: { from: "f" } };
  const second: NumberField = { ...number("dda"), derive: { from: "f", order: 2, at: "a" } };
  const fields: FieldDefinition[] = [f, df, number("a"), second];

  it("fills an expression field with the symbolic derivative", () => {
    expect(deriveField(df, fields, { f: "x^2" })).toEqual({ ok: true, value: "2 * x" });
  });

  it("fills a number field with the derivative of the given order, evaluated at another field", () => {
    expect(deriveField(second, fields, { f: "x^3", a: "2" })).toEqual({ ok: true, value: "12" });
  });

  it("refuses a field that cannot be derived", () => {
    expect(deriveField(number("a"), fields, {})).toEqual({
      ok: false,
      issue: { key: "field.error.not-differentiable" },
    });
  });

  it("refuses when the source field is missing or is not an expression", () => {
    const fromNumber: ExpressionField = { ...df, derive: { from: "a" } };
    const fromNowhere: ExpressionField = { ...df, derive: { from: "missing" } };
    const refused = { ok: false, issue: { key: "field.error.not-differentiable" } };
    expect(deriveField(fromNumber, fields, { a: "1" })).toEqual(refused);
    expect(deriveField(fromNowhere, fields, {})).toEqual(refused);
  });

  it("reports derive-failed when the source value is missing from the values", () => {
    const failed = { ok: false, issue: { key: "field.error.derive-failed" } };
    expect(deriveField(df, fields, {})).toEqual(failed);
    expect(deriveField(second, fields, { a: "1" })).toEqual(failed);
  });

  it("reports derive-failed when the point to evaluate at is missing from the values", () => {
    expect(deriveField(second, fields, { f: "x^3" })).toEqual({
      ok: false,
      issue: { key: "field.error.derive-failed" },
    });
  });

  it("reports derive-failed when the point to evaluate at is invalid", () => {
    expect(deriveField(second, fields, { f: "x^3", a: "" })).toEqual({
      ok: false,
      issue: { key: "field.error.derive-failed" },
    });
  });
});

describe("visibleDeriveIssue", () => {
  const issue = { key: "field.error.derive-failed" } as const;
  const failure = { issue, source: "x +", own: "6" };

  it("shows nothing without a failure", () => {
    expect(visibleDeriveIssue(null, "x +", "6")).toBeNull();
  });

  it("shows the failure while the source and the field are unchanged", () => {
    expect(visibleDeriveIssue(failure, "x +", "6")).toBe(issue);
  });

  it("hides it once the source field changes", () => {
    expect(visibleDeriveIssue(failure, "x + 1", "6")).toBeNull();
  });

  it("hides it once the field's own value changes", () => {
    expect(visibleDeriveIssue(failure, "x +", "7")).toBeNull();
  });
});
