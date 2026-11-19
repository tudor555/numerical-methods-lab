import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { ro } from "@/i18n/ro";
import { findComparisonMethod, findComparisonPreset, runComparison } from "./compare";
import { deriveField } from "./fields";
import { newtonMethod } from "./lab-1";
import { lab2 } from "./lab-2";
import { initialLabState, labReducer } from "./lab-state";
import { findReadyLab } from "./registry";
import type { FieldValues, NumberField } from "./types";

const method = (id: string) => {
  const m = lab2.methods.find((x) => x.id === id);
  if (!m) throw new Error(id);
  return m;
};

const prepare = (id: string, patch: FieldValues = {}) => {
  const m = method(id);
  const prepared = m.prepare({ ...m.defaults, ...patch });
  if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
  return prepared.prepared;
};

describe("Lab 2 registry", () => {
  it("is ready at /labs/secant-steffensen with the secant and Steffensen tabs", () => {
    expect(findReadyLab("secant-steffensen")).toBe(lab2);
    expect(lab2.number).toBe(2);
    expect(lab2.methods.map((m) => m.id)).toEqual(["2a", "2b"]);
  });

  it("keeps Newton out of the tabs and presets: it is only compared with", () => {
    expect(lab2.methods).not.toContain(newtonMethod);
    expect(lab2.presets.every((p) => p.methodId !== newtonMethod.id)).toBe(true);
    expect(findComparisonMethod(lab2, "1a")).toBe(newtonMethod);
  });
});

describe("Lab 2 presets", () => {
  it("refers only to examples the page has: ex. 1, ex. 2 and the unnumbered numerical example", () => {
    for (const messages of [en, ro]) {
      const lab2Texts = Object.entries(messages).filter(([key]) => key.startsWith("lab2."));
      for (const [key, text] of lab2Texts) expect(text, key).not.toMatch(/\bex\. ?[3-9]/i);
    }
  });

  it("lists the lab's three examples in order", () => {
    expect(lab2.presets.map((p) => [p.id, p.methodId])).toEqual([
      ["ex1", "2a"],
      ["ex2", "2a"],
      ["steffensen", "2b"],
    ]);
  });

  it.each([
    ["ex1", 4, Math.SQRT2],
    ["ex2", 6, 1.324717957244746],
    ["steffensen", 11, 1.324717957244746],
  ])("%s validates and converges in n = %i", (id, n, root) => {
    const p = lab2.presets.find((x) => x.id === id);
    if (!p) throw new Error(id);
    const prepared = method(p.methodId).prepare(p.values);
    if (!prepared.ok) throw new Error("invalid");
    const r = prepared.prepared.run();
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(Math.abs((r.result as number) - root)).toBeLessThan(1e-4);
    expect(r.iterations[0].x).toBe(2);
  });

  it("the Steffensen preset starts at x₀ = b = 2 by rule R0", () => {
    expect(prepare("2b").run().x0Rule).toBe("b");
  });

  it("each method's defaults are its first example, so the form opens on it", () => {
    expect(lab2.presets.find((p) => p.id === "ex1")?.values).toEqual(method("2a").defaults);
    expect(lab2.presets.find((p) => p.id === "steffensen")?.values).toEqual(method("2b").defaults);
  });
});

describe("Lab 2 comparisons", () => {
  const n = (id: string) => {
    const comparison = lab2.comparisons.find((c) => c.id === id);
    if (!comparison) throw new Error(id);
    return runComparison(lab2, comparison).map((row) => row.map((cell) => cell?.n ?? null));
  };

  it("lists exactly the comparisons the lab asks for, in order, each against Newton", () => {
    expect(lab2.comparisons.map((c) => c.id)).toEqual(["ex1", "ex2", "steffensen"]);
    for (const comparison of lab2.comparisons) {
      expect(comparison.eps).toEqual([1e-4, 1e-8, 1e-12]);
      expect(comparison.rows.map((r) => r.methodId)).toEqual([
        comparison.id === "steffensen" ? "2b" : "2a",
        "1a",
      ]);
    }
  });

  it("matches the locked iteration counts", () => {
    expect(n("ex1")).toEqual([
      [4, 6, 6],
      [4, 5, 6],
    ]);
    expect(n("ex2")).toEqual([
      [6, 7, 8],
      [5, 6, 7],
    ]);
    expect(n("steffensen")).toEqual([
      [11, 12, 13],
      [5, 6, 7],
    ]);
  });

  it("gives Newton the same f and [a, b], f′ and dda derived from f, and rule R0", () => {
    const ex1 = findComparisonPreset(lab2, "ex1-newton");
    expect(ex1?.values).toMatchObject({
      f: "x^2 - 2",
      df: "2 * x",
      a: "1",
      b: "2",
      x0Mode: "r0",
      dda: "2",
    });
    const steffensen = findComparisonPreset(lab2, "steffensen-newton");
    expect(steffensen?.values).toMatchObject({ f: "x^3 - x - 1", df: "3 * x ^ 2 - 1", dda: "6" });
  });

  it("starts Newton at x₀ = 2 in all three", () => {
    for (const comparison of lab2.comparisons) {
      const cells = runComparison(lab2, comparison);
      for (const row of cells) {
        expect(row.every((cell) => cell?.iterations[0].x === 2)).toBe(true);
      }
    }
  });

  it("says in every task how Newton gets f′ and x₀, which the inputs list cannot show", () => {
    for (const { taskKey } of lab2.comparisons) {
      expect(en[taskKey]).toContain("derives f′ from f and takes x₀ from rule R0.");
      expect(ro[taskKey]).toContain("f′ este calculată din f, iar x₀ este dat de regula R0.");
      // The choice is stated plainly, not as a gap in the lab.
      expect(en[taskKey]).not.toMatch(/\bthe lab\b/i);
      expect(ro[taskKey]).not.toContain("Laboratorul");
    }
  });
});

describe("Lab 2 validation", () => {
  const errorsFor = (methodId: string, patch: FieldValues) => {
    const m = method(methodId);
    const prepared = m.prepare({ ...m.defaults, ...patch });
    return prepared.ok ? {} : prepared.errors;
  };

  it("rejects x₁ = x₀ next to x₁, so the run is blocked before the algorithm", () => {
    expect(errorsFor("2a", { x0: "2", x1: "2" })).toEqual({
      x1: { key: "field.error.different-from", params: { other: "x₀" } },
    });
    expect(errorsFor("2a", { x0: "2", x1: "4/2" }).x1?.key).toBe("field.error.different-from");
  });

  it.each([
    ["2a", { f: "x^ +" }, "f", "field.error.syntax"],
    ["2a", { a: "2", b: "1" }, "b", "field.error.greater-than"],
    ["2a", { x1: "" }, "x1", "field.error.empty"],
    ["2a", { eps: "-1" }, "eps", "field.error.range"],
    ["2a", { x0: "1e7" }, "x0", "field.error.range"],
    ["2a", { x1: "-1e7" }, "x1", "field.error.range"],
    ["2b", { b: "1e7" }, "b", "field.error.range"],
    ["2b", { dda: "" }, "dda", "field.error.empty"],
    ["2b", { maxIter: "0" }, "maxIter", "field.error.integer-range"],
    ["2b", { f: "y" }, "f", "field.error.unknown-symbol"],
  ])("%s %j → %s: %s", (methodId, patch, field, key) => {
    expect(errorsFor(methodId, patch)[field]?.key).toBe(key);
  });

  it("asks for exactly the lab's inputs", () => {
    expect(method("2a").fields.map((f) => f.id)).toEqual([
      "f",
      "a",
      "b",
      "x0",
      "x1",
      "eps",
      "maxIter",
    ]);
    expect(method("2b").fields.map((f) => f.id)).toEqual(["f", "a", "b", "dda", "eps", "maxIter"]);
  });

  it("derives dda = f″(a) from f for Steffensen", () => {
    const m = method("2b");
    const dda = m.fields.find((f) => f.id === "dda") as NumberField;
    expect(deriveField(dda, m.fields, m.defaults)).toEqual({ ok: true, value: "6" });
  });

  it("has a default iteration cap of 1000", () => {
    expect(method("2a").defaults.maxIter).toBe("1000");
    expect(method("2b").defaults.maxIter).toBe("1000");
  });
});

describe("Lab 2 runs", () => {
  it.each(lab2.presets.map((p) => [p.id, p] as const))(
    "preset %s, picked on its method's tab, fills the form, which then runs to convergence",
    (_id, preset) => {
      const onTab = labReducer(initialLabState(lab2), {
        type: "select",
        methodId: preset.methodId,
      });
      const state = labReducer(onTab, { type: "preset", preset });
      expect(state.presetIds[preset.methodId]).toBe(preset.id);
      const prepared = method(preset.methodId).prepare(state.values[preset.methodId]);
      if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
      expect(prepared.prepared.run().status).toBe("converged");
    },
  );

  it("stops the secant with zero-denominator and keeps the rows (f = x², 1, −1)", () => {
    const r = prepare("2a", { f: "x^2", a: "-2", b: "2", x0: "1", x1: "-1" }).run();
    expect(r.error).toEqual({ code: "zero-denominator", n: 1, x: -1 });
    expect(r.iterations).toHaveLength(2);
  });

  it("stops Steffensen at an exact root (f = x − 1 on [0, 2], dda = 0)", () => {
    const r = prepare("2b", { f: "x - 1", a: "0", b: "2", dda: "0" }).run();
    expect(r.status).toBe("converged");
    expect(r.iterations.map((row) => row.x)).toEqual([2, 1, 1]);
  });

  it("plots chords for the secant and plain steps for Steffensen, over [a, b]", () => {
    expect(prepare("2a").plot).toMatchObject({ kind: "secant", interval: [1, 2] });
    expect(prepare("2b").plot).toMatchObject({ kind: "steffensen", interval: [1, 2] });
  });

  it("claims no exact value: f is free text", () => {
    expect(prepare("2a").exact).toBeUndefined();
    expect(prepare("2b").exact).toBeUndefined();
  });
});

describe("Lab 2 formulas", () => {
  const formulas = lab2.methods.flatMap((m) => m.explanation.filter((b) => b.kind === "formula"));

  it("never hard-code words inside \\text{…}, and declare a key for every placeholder", () => {
    for (const block of formulas) {
      for (const [, inner] of block.tex.matchAll(/\\text\{([^}]*)\}/g)) {
        expect(inner).toMatch(/^⟪\w+⟫$/);
      }
      for (const [, name] of block.tex.matchAll(/⟪(\w+)⟫/g)) {
        expect(block.words?.[name]).toBeDefined();
      }
    }
  });

  it("shows rule R0 for Steffensen only", () => {
    const hasR0 = (id: string) =>
      method(id).explanation.some((b) => b.kind === "formula" && b.tex.startsWith("x_0 ="));
    expect(hasR0("2a")).toBe(false);
    expect(hasR0("2b")).toBe(true);
  });
});
