import { describe, expect, it } from "vitest";
import { comparisonInputs, findComparisonPreset } from "./compare";
import { lab1, newtonMethod } from "./lab-1";
import { lab4 } from "./lab-4";
import type { MethodDefinition } from "./types";

const method = (id: string): MethodDefinition => {
  const found = lab4.methods.find((m) => m.id === id);
  if (!found) throw new Error(id);
  return found;
};

describe("comparisonInputs", () => {
  const newton = { f: "x^2 - 2", df: "2x", a: "1", b: "2", dda: "2", x0: "", eps: "1e-4" };

  it("lists the fields in form order, as TeX, leaving out ε and the iteration cap", () => {
    expect(comparisonInputs(method("4a"), { ...method("4a").defaults })).toEqual([
      { kind: "tex", tex: "f(x) = { x}^{2}-2" },
      { kind: "tex", tex: "f'(x) = 2 x" },
      { kind: "tex", tex: "[a,\\ b] = [1,\\ 2]" },
      { kind: "tex", tex: "x_0 = 2" },
    ]);
  });

  it("writes the interval with the separator it is given", () => {
    const inputs = comparisonInputs(method("4a"), method("4a").defaults, ";");
    expect(inputs).toContainEqual({ kind: "tex", tex: "[a;\\ b] = [1;\\ 2]" });
  });

  it("names rule R0 in words and shows dda; a typed-in x₀ replaces both", () => {
    expect(comparisonInputs(newtonMethod, { ...newton, x0Mode: "r0" }).slice(3)).toEqual([
      { kind: "choice", symbol: "x_0", labelKey: "field.x0Mode.r0" },
      { kind: "tex", tex: "\\mathrm{dda} = f''(a) = 2" },
    ]);
    expect(
      comparisonInputs(newtonMethod, { ...newton, x0Mode: "manual", x0: "2" }).slice(3),
    ).toEqual([{ kind: "tex", tex: "x_0 = 2" }]);
  });

  it("keeps 4b's radicand a on its own: it is not an interval end", () => {
    expect(comparisonInputs(method("4b"), { a: "5", eps: "1e-4", maxIter: "1000" })).toEqual([
      { kind: "tex", tex: "a = 5" },
    ]);
  });

  it("shows constants as formulas", () => {
    const kepler = findComparisonPreset(lab1, "kepler");
    if (!kepler) throw new Error("kepler");
    expect(comparisonInputs(newtonMethod, kepler.values)).toContainEqual({
      kind: "tex",
      tex: "x_0 = \\frac{3\\pi}{8}",
    });
  });

  it("falls back to the raw text for a value that does not parse, and skips an unknown choice", () => {
    const inputs = comparisonInputs(newtonMethod, { ...newton, f: "x +", x0Mode: "other" });
    expect(inputs[0]).toEqual({ kind: "tex", tex: "f(x) = x +" });
    expect(inputs.some((input) => input.kind === "choice")).toBe(false);
  });

  it("shows an empty value for a field the preset leaves out", () => {
    expect(comparisonInputs(method("4b"), {})).toEqual([{ kind: "tex", tex: "a = " }]);
  });
});
