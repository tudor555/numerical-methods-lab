import { describe, expect, it } from "vitest";
import { compile, derive, ExpressionError, EvaluationError, parseConstant } from "./compile";

function exprErrorCode(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (error) {
    if (error instanceof ExpressionError) return error.code;
    throw error;
  }
  return undefined;
}

/** Runs `fn` and returns what it threw; fails the test if it did not throw. */
function caught(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("expected the call to throw");
}

describe("compile", () => {
  it("evaluates with declared variables in order", () => {
    expect(compile("x^3 - x - 1", ["x"])(2)).toBe(5);
    expect(compile("x*y + 1", ["x", "y"])(2, 3)).toBe(7);
    expect(compile("2x + sin(pi/2)", ["x"])(1)).toBe(3);
  });

  it("supports ln and lg aliases", () => {
    expect(compile("ln(e)", ["x"])(0)).toBeCloseTo(1, 15);
    expect(compile("lg(x)", ["x"])(1000)).toBeCloseTo(3, 15);
  });

  it.each([
    ["x^ +", "syntax"],
    ["", "empty"],
    ["   ", "empty"],
    ["y*x", "unknown-symbol"],
    ["x = 2", "forbidden"],
    ["f(x) = x", "forbidden"],
    ["x!", "forbidden"],
    ["x == 2", "forbidden"],
    ["x mod 2", "forbidden"],
    ["[1, 2]", "forbidden"],
    ["x ? 1 : 2", "forbidden"],
    ['"a"', "forbidden"],
    ["2 cm", "unknown-symbol"],
    ["sin", "forbidden"],
    ["foo(x)", "unknown-function"],
    ["evaluate(x)", "unknown-function"],
  ])("rejects %j with %s", (source, code) => {
    expect(exprErrorCode(() => compile(source, ["x"]))).toBe(code);
  });

  it("names rejected constructs readably", () => {
    const error = caught(() => compile("x = 2", ["x"]));
    expect(error).toBeInstanceOf(ExpressionError);
    expect((error as ExpressionError).detail).toBe("=");
  });

  it("throws undefined-value for NaN and overflow for ±∞", () => {
    const nan = caught(() => compile("sqrt(x)", ["x"])(-1));
    expect(nan).toBeInstanceOf(EvaluationError);
    expect((nan as EvaluationError).code).toBe("undefined-value");
    const inf = caught(() => compile("1/x", ["x"])(0));
    expect(inf).toBeInstanceOf(EvaluationError);
    expect((inf as EvaluationError).code).toBe("overflow");
    expect(() => compile("ln(x)", ["x"])(-1)).toThrow(EvaluationError);
  });

  it("throws undefined-value when math.js fails while evaluating (sin of a missing argument)", () => {
    const error = caught(() => compile("sin(x)", ["x"])());
    expect(error).toBeInstanceOf(EvaluationError);
    expect((error as EvaluationError).code).toBe("undefined-value");
  });

  it("throws undefined-value when the result is not a number (a missing argument)", () => {
    // math.js returns the scope value as is: `undefined`, not a number.
    const error = caught(() => compile("x", ["x"])());
    expect(error).toBeInstanceOf(EvaluationError);
    expect((error as EvaluationError).code).toBe("undefined-value");
    expect((error as EvaluationError).args).toEqual([]);
  });

  it.each(["sin(x, 2)", "sin()"])(
    "rejects %j (wrong number of arguments) with syntax",
    (source) => {
      expect(exprErrorCode(() => compile(source, ["x"]))).toBe("syntax");
    },
  );
});

describe("parseConstant", () => {
  it("evaluates constant expressions", () => {
    expect(parseConstant("3*pi/8")).toBeCloseTo((3 * Math.PI) / 8, 15);
    expect(parseConstant("1e-4")).toBe(1e-4);
    expect(parseConstant("-2")).toBe(-2);
  });

  it("rejects variables and non-finite values", () => {
    expect(exprErrorCode(() => parseConstant("sin(1,2)"))).toBe("syntax");
    expect(exprErrorCode(() => parseConstant("x"))).toBe("unknown-symbol");
    expect(exprErrorCode(() => parseConstant("1/0"))).toBe("not-finite");
    expect(exprErrorCode(() => parseConstant("x = 2"))).toBe("forbidden");
  });
});

describe("derive", () => {
  it("returns a derivative the restricted parser accepts", () => {
    const d1 = derive("x^3 - x - 1", "x");
    expect(compile(d1, ["x"])(2)).toBe(11);
    const d2 = derive(d1, "x");
    expect(compile(d2, ["x"])(1)).toBe(6);
    expect(compile(derive("x - sin(x) - 0.25", "x"), ["x"])(0)).toBe(0);
    expect(compile(derive("ln(x)", "x"), ["x"])(2)).toBe(0.5);
  });

  it("differentiates tanh into functions the parser accepts", () => {
    const d = derive("tanh(x)", "x");
    expect(compile(d, ["x"])(0)).toBeCloseTo(1, 15);
  });

  it("rejects invalid sources", () => {
    expect(exprErrorCode(() => derive("y + x", "x"))).toBe("unknown-symbol");
  });
});
