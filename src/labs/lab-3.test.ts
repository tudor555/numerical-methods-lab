import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { ro } from "@/i18n/ro";
import { findComparisonMethod, findComparisonPreset, runComparison } from "./compare";
import { deriveField } from "./fields";
import { newtonMethod } from "./lab-1";
import { lab3 } from "./lab-3";
import { initialLabState, labReducer } from "./lab-state";
import { findReadyLab } from "./registry";
import type { ExpressionField, FieldValues } from "./types";

const ROOT = 1.324717957244746;

const method = (id: string) => {
  const m = lab3.methods.find((x) => x.id === id);
  if (!m) throw new Error(id);
  return m;
};

const prepare = (id: string, patch: FieldValues = {}) => {
  const m = method(id);
  const prepared = m.prepare({ ...m.defaults, ...patch });
  if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
  return prepared.prepared;
};

describe("Lab 3 registry", () => {
  it("is ready at /labs/halley-chebyshev with the Halley and Chebyshev tabs", () => {
    expect(findReadyLab("halley-chebyshev")).toBe(lab3);
    expect(lab3.number).toBe(3);
    expect(lab3.methods.map((m) => m.id)).toEqual(["3a", "3b"]);
  });

  it("keeps Newton out of the tabs and presets: it is only compared with", () => {
    expect(lab3.methods).not.toContain(newtonMethod);
    expect(lab3.presets.every((p) => p.methodId !== newtonMethod.id)).toBe(true);
    expect(findComparisonMethod(lab3, "1a")).toBe(newtonMethod);
  });

  it("follows the lab's headings, in both languages", () => {
    expect(en[lab3.titleKey]).toBe("Halley's method and Chebyshev-type methods");
    expect(en[lab3.topicKey]).toBe("Generalizations of the tangent method");
    expect(ro[lab3.titleKey]).toBe("Metoda lui Halley și metode de tip Cebîșev");
    expect(ro[lab3.topicKey]).toBe("Generalizări ale metodei tangentei");
    expect(ro[lab3.introKey]).toMatch(/^Rezolvă /);
    expect(ro[lab3.introKey]).toMatch(
      /Compară apoi rezultatele .* cu cele obținute prin metoda tangentei\.$/,
    );
  });
});

describe("Lab 3 messages", () => {
  it("refers only to examples the page has: ex. 1, ex. 2 and the unnumbered numerical example", () => {
    for (const messages of [en, ro]) {
      const lab3Texts = Object.entries(messages).filter(([key]) => key.startsWith("lab3."));
      for (const [key, text] of lab3Texts) {
        expect(text, key).not.toMatch(/\bex\. ?[3-9]/i);
        expect(text, key).not.toMatch(/\blab(oratorul)? ?\d/i);
      }
    }
  });

  it("keeps the examples out of the method explanations: the presets name them", () => {
    for (const messages of [en, ro]) {
      for (const method of ["halley", "chebyshev"]) {
        for (const part of ["idea", "start", "failure", "chart"]) {
          const key = `lab3.method.${method}.${part}` as keyof typeof messages;
          expect(messages[key], key).not.toMatch(/\bex\.|exempl|example|preset/i);
        }
      }
    }
  });

  it("spells Chebyshev the lab's way in Romanian", () => {
    const lab3Texts = Object.entries(ro).filter(([key]) => key.startsWith("lab3."));
    for (const [key, text] of lab3Texts) expect(text, key).not.toMatch(/Ceb[âa]șev|Chebyshev/);
  });
});

describe("Lab 3 presets", () => {
  it("lists the lab's three examples in order", () => {
    expect(lab3.presets.map((p) => [p.id, p.methodId])).toEqual([
      ["ex1", "3a"],
      ["ex2", "3a"],
      ["chebyshev", "3b"],
    ]);
  });

  it.each([
    ["ex1", 3, Math.SQRT2],
    ["ex2", 4, ROOT],
    ["chebyshev", 4, ROOT],
  ])("%s validates and converges in n = %i from x₀ = 2", (id, n, root) => {
    const p = lab3.presets.find((x) => x.id === id);
    if (!p) throw new Error(id);
    const prepared = method(p.methodId).prepare(p.values);
    if (!prepared.ok) throw new Error("invalid");
    const r = prepared.prepared.run();
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(Math.abs((r.result as number) - root)).toBeLessThan(1e-4);
    expect(r.iterations[0].x).toBe(2);
  });

  it("the Halley presets enter x₀ = 2 directly, as the examples state", () => {
    for (const p of lab3.presets.filter((x) => x.methodId === "3a")) {
      expect(p.values).toMatchObject({ x0Mode: "manual", x0: "2" });
    }
  });

  it("each method's defaults are its first example, so the form opens on it", () => {
    expect(lab3.presets.find((p) => p.id === "ex1")?.values).toEqual(method("3a").defaults);
    expect(lab3.presets.find((p) => p.id === "chebyshev")?.values).toEqual(method("3b").defaults);
  });
});

describe("Lab 3 comparisons", () => {
  const n = (id: string) => {
    const comparison = lab3.comparisons.find((c) => c.id === id);
    if (!comparison) throw new Error(id);
    return runComparison(lab3, comparison).map((row) => row.map((cell) => cell?.n ?? null));
  };

  it("lists exactly the comparisons the lab asks for, in order, each against Newton", () => {
    expect(lab3.comparisons.map((c) => c.id)).toEqual(["ex1", "ex2", "chebyshev"]);
    for (const comparison of lab3.comparisons) {
      expect(comparison.eps).toEqual([1e-4, 1e-8, 1e-12]);
      expect(comparison.rows.map((r) => r.methodId)).toEqual([
        comparison.id === "chebyshev" ? "3b" : "3a",
        "1a",
      ]);
    }
  });

  it("matches the locked iteration counts", () => {
    expect(n("ex1")).toEqual([
      [3, 4, 4],
      [4, 5, 6],
    ]);
    expect(n("ex2")).toEqual([
      [4, 4, 5],
      [5, 6, 7],
    ]);
    expect(n("chebyshev")).toEqual([
      [4, 4, 5],
      [5, 6, 7],
    ]);
  });

  it("gives Newton the example's own f and f′ as the lab writes them, and x₀ = 2", () => {
    expect(findComparisonPreset(lab3, "ex1-newton")?.values).toMatchObject({
      f: "x^2 - 2",
      df: "2x",
      a: "1",
      b: "2",
      x0Mode: "manual",
      x0: "2",
    });
    for (const id of ["ex2-newton", "chebyshev-newton"]) {
      expect(findComparisonPreset(lab3, id)?.values).toMatchObject({
        f: "x^3 - x - 1",
        df: "3x^2 - 1",
        x0Mode: "manual",
        x0: "2",
      });
    }
  });

  it("starts both methods at x₀ = 2 in all three", () => {
    for (const comparison of lab3.comparisons) {
      for (const row of runComparison(lab3, comparison)) {
        expect(row.every((cell) => cell?.iterations[0].x === 2)).toBe(true);
      }
    }
  });

  it("keeps every task to the two methods; the card lists the inputs", () => {
    for (const { taskKey } of lab3.comparisons) {
      expect(en[taskKey]).toMatch(/and compare the results with the tangent method\.$/);
      expect(ro[taskKey]).toMatch(
        /și compară rezultatele cu cele obținute prin metoda tangentei\.$/,
      );
      for (const text of [en[taskKey], ro[taskKey]]) expect(text).not.toMatch(/x₀ =|ε =|\[1/);
      expect(en[taskKey]).not.toMatch(/\bthe lab\b/i);
      expect(ro[taskKey]).not.toContain("Laboratorul");
    }
  });
});

describe("Lab 3 validation", () => {
  const errorsFor = (methodId: string, patch: FieldValues) => {
    const m = method(methodId);
    const prepared = m.prepare({ ...m.defaults, ...patch });
    return prepared.ok ? {} : prepared.errors;
  };

  it.each([
    ["3a", { f: "x^ +" }, "f", "field.error.syntax"],
    ["3a", { ddf: "" }, "ddf", "field.error.empty"],
    ["3a", { ddf: "y" }, "ddf", "field.error.unknown-symbol"],
    ["3a", { a: "2", b: "1" }, "b", "field.error.greater-than"],
    ["3a", { x0: "" }, "x0", "field.error.empty"],
    ["3a", { x0: "1e7" }, "x0", "field.error.range"],
    ["3a", { eps: "0" }, "eps", "field.error.range"],
    ["3b", { df: "x = 2" }, "df", "field.error.forbidden"],
    ["3b", { ddf: "" }, "ddf", "field.error.empty"],
    ["3b", { a: "2", b: "1" }, "b", "field.error.greater-than"],
    ["3b", { x0: "-1e7" }, "x0", "field.error.range"],
    ["3b", { maxIter: "0" }, "maxIter", "field.error.integer-range"],
  ])("%s %j → %s: %s", (methodId, patch, field, key) => {
    expect(errorsFor(methodId, patch)[field]?.key).toBe(key);
  });

  it("skips the hidden x₀ under rule R0", () => {
    expect(errorsFor("3a", { x0Mode: "r0", x0: "" })).toEqual({});
  });

  it("asks for exactly the lab's inputs, with f′ and f″ as expressions", () => {
    expect(method("3a").fields.map((f) => f.id)).toEqual([
      "f",
      "df",
      "ddf",
      "a",
      "b",
      "x0Mode",
      "x0",
      "eps",
      "maxIter",
    ]);
    expect(method("3b").fields.map((f) => f.id)).toEqual([
      "f",
      "df",
      "ddf",
      "a",
      "b",
      "x0",
      "eps",
      "maxIter",
    ]);
    for (const m of lab3.methods) {
      for (const id of ["df", "ddf"]) {
        expect(m.fields.find((f) => f.id === id)?.kind).toBe("expression");
      }
    }
  });

  it("derives f′ and the second derivative f″ from f", () => {
    for (const m of lab3.methods) {
      const field = (id: string) => m.fields.find((f) => f.id === id) as ExpressionField;
      const values = { ...m.defaults, f: "x^3 - x - 1" };
      expect(deriveField(field("df"), m.fields, values)).toEqual({
        ok: true,
        value: "3 * x ^ 2 - 1",
      });
      expect(deriveField(field("ddf"), m.fields, values)).toEqual({ ok: true, value: "6 * x" });
    }
  });

  it("has a default iteration cap of 1000", () => {
    expect(method("3a").defaults.maxIter).toBe("1000");
    expect(method("3b").defaults.maxIter).toBe("1000");
  });
});

describe("Lab 3 runs", () => {
  it.each(lab3.presets.map((p) => [p.id, p] as const))(
    "preset %s, picked on its method's tab, fills the form, which then runs to convergence",
    (_id, preset) => {
      const onTab = labReducer(initialLabState(lab3), {
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

  it("Halley by rule R0 on ex. 1 picks x₀ = b = 2 and keeps the counts", () => {
    const counts = ["1e-4", "1e-8", "1e-12"].map((eps) => {
      const r = prepare("3a", { x0Mode: "r0", x0: "", eps }).run();
      expect(r.x0Rule).toBe("b");
      expect(r.iterations[0].x).toBe(2);
      return r.n;
    });
    expect(counts).toEqual([3, 4, 4]);
  });

  it("stops Halley with zero-denominator and keeps row 0 (f = x − 1, f″ = 2, x₀ = 2)", () => {
    const r = prepare("3a", { f: "x - 1", df: "1", ddf: "2", a: "0" }).run();
    expect(r.error).toEqual({ code: "zero-denominator", n: 0, x: 2 });
    expect(r.iterations).toHaveLength(1);
    expect(method("3a").errorKeys?.["zero-denominator"]).toBe(
      "lab3.method.halley.error.zero-denominator",
    );
  });

  it("stops Chebyshev with zero-derivative, with Newton's message (f = x² − 2, x₀ = 0)", () => {
    const r = prepare("3b", { f: "x^2 - 2", df: "2x", ddf: "2", a: "-1", x0: "0" }).run();
    expect(r.error).toEqual({ code: "zero-derivative", n: 0, x: 0 });
    expect(r.iterations).toHaveLength(1);
    expect(method("3b").errorKeys).toBeUndefined();
  });

  it("converges at n = 1 on an exact root (Halley, f = x − 1, f″ = 0, x₀ = 1)", () => {
    const r = prepare("3a", { f: "x - 1", df: "1", ddf: "0", a: "0", x0: "1" }).run();
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.result).toBe(1);
  });

  it("plots the tangent hyperbola for Halley and the tangent parabola for Chebyshev, over [a, b]", () => {
    const halley = prepare("3a").plot;
    const chebyshev = prepare("3b").plot;
    expect(halley).toMatchObject({ kind: "halley", interval: [1, 2] });
    expect(chebyshev).toMatchObject({ kind: "chebyshev", interval: [1, 2] });
    if (chebyshev?.kind !== "chebyshev") throw new Error("kind");
    expect(chebyshev.df(2)).toBe(11);
    expect(chebyshev.ddf(2)).toBe(12);
  });

  it("claims no exact value: f is free text", () => {
    expect(prepare("3a").exact).toBeUndefined();
    expect(prepare("3b").exact).toBeUndefined();
  });
});

describe("Lab 3 formulas", () => {
  const formulas = lab3.methods.flatMap((m) => m.explanation.filter((b) => b.kind === "formula"));

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

  it("shows rule R0 for Halley only", () => {
    const hasR0 = (id: string) =>
      method(id).explanation.some((b) => b.kind === "formula" && b.tex.startsWith("x_0 ="));
    expect(hasR0("3a")).toBe(true);
    expect(hasR0("3b")).toBe(false);
  });
});
