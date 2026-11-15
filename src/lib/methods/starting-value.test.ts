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

  it("re-throws an unexpected error from f(a)", () => {
    const bug = new TypeError("bug in f");
    const f = () => {
      throw bug;
    };
    expect(() => startByRuleR0(f, 1, 2, 6)).toThrow(bug);
  });
});
