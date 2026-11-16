import { describe, expect, it } from "vitest";
import { compile } from "@/lib/expressions/compile";
import { chooseStartingValue, startByRuleR0 } from "./starting-value";

describe("chooseStartingValue (rule R0)", () => {
  it("picks a when f(a)·f″(a) > 0", () => {
    expect(chooseStartingValue(2, 3, 1, 2)).toBe(1);
    expect(chooseStartingValue(-2, -3, 1, 2)).toBe(1);
  });

  it("picks b when f(a)·f″(a) ≤ 0", () => {
    expect(chooseStartingValue(-1, 6, 1, 2)).toBe(2);
    expect(chooseStartingValue(0, 6, 1, 2)).toBe(2);
  });
});

describe("startByRuleR0", () => {
  it("returns x₀ and the end it picked", () => {
    const f = compile("x^3 - x - 1", ["x"]);
    expect(startByRuleR0(f, 1, 2, 6)).toEqual({ ok: true, x0: 2, x0Rule: "b" });
    expect(startByRuleR0(f, 1.5, 2, 6)).toEqual({ ok: true, x0: 1.5, x0Rule: "a" });
  });

  it("fails before any row when f(a) is undefined", () => {
    const start = startByRuleR0(compile("sqrt(x)", ["x"]), -1, 1, 1);
    expect(start).toEqual({
      ok: false,
      failure: {
        status: "error",
        result: null,
        n: 0,
        iterations: [],
        error: { code: "undefined-value", n: 0, x: -1 },
      },
    });
  });

  it("evaluates f″ at a when it is given as a function", () => {
    const f = compile("x^2 - 2", ["x"]);
    // f(1)·f″(1) = −1·2 ≤ 0, so b.
    expect(startByRuleR0(f, 1, 2, compile("2", ["x"]))).toEqual({ ok: true, x0: 2, x0Rule: "b" });
    // f(−2) = −7: with f″ = 6x, f″(−2) = −12 and the product is > 0, so a; with dda = 6, b.
    const cubic = compile("x^3 - x - 1", ["x"]);
    expect(startByRuleR0(cubic, -2, 2, compile("6x", ["x"]))).toMatchObject({ x0: -2 });
    expect(startByRuleR0(cubic, -2, 2, 6)).toMatchObject({ x0: 2 });
  });

  it("fails before any row, at x = a, when f″(a) is undefined", () => {
    const start = startByRuleR0(compile("x", ["x"]), -1, 1, compile("sqrt(x)", ["x"]));
    expect(start).toMatchObject({
      ok: false,
      failure: { status: "error", iterations: [], error: { code: "undefined-value", n: 0, x: -1 } },
    });
  });

  it("re-throws an unexpected error from f(a)", () => {
    const bug = new TypeError("bug in f");
    const f = () => {
      throw bug;
    };
    expect(() => startByRuleR0(f, 1, 2, 6)).toThrow(bug);
  });
});
