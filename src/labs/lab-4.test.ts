import { describe, expect, it } from "vitest";
import { scalarRun } from "@/test/runs";
import { en } from "@/i18n/en";
import { ro } from "@/i18n/ro";
import { findComparisonMethod, findComparisonPreset, runComparison } from "./compare";
import { deriveField } from "./fields";
import { kthRootMethod, newtonMethod } from "./lab-1";
import { lab4 } from "./lab-4";
import { initialLabState, labReducer } from "./lab-state";
import { findReadyLab } from "./registry";
import type { ExpressionField, FieldValues } from "./types";

const ROOT = 1.324717957244746;

const method = (id: string) => {
  const m = lab4.methods.find((x) => x.id === id);
  if (!m) throw new Error(id);
  return m;
};

const prepare = (id: string, patch: FieldValues = {}) => {
  const m = method(id);
  const prepared = m.prepare({ ...m.defaults, ...patch });
  if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
  return scalarRun(prepared.prepared);
};

const lab4Texts = (messages: Record<string, string>) =>
  Object.entries(messages).filter(([key]) => key.startsWith("lab4."));

describe("Lab 4 registry", () => {
  it("is ready at /labs/third-order with the combined tangent and square root tabs", () => {
    expect(findReadyLab("third-order")).toBe(lab4);
    expect(lab4.number).toBe(4);
    expect(lab4.methods.map((m) => m.id)).toEqual(["4a", "4b"]);
  });

  it("keeps Newton and 1b out of the tabs and presets: they are only compared with", () => {
    for (const reference of [newtonMethod, kthRootMethod]) {
      expect(lab4.methods).not.toContain(reference);
      expect(lab4.presets.every((p) => p.methodId !== reference.id)).toBe(true);
      expect(findComparisonMethod(lab4, reference.id)).toBe(reference);
    }
  });

  it("follows the lab's headings, in both languages", () => {
    expect(en[lab4.titleKey]).toBe("Third-order iterative methods");
    expect(en[lab4.topicKey]).toBe("Combined tangent method and third-order square roots");
    expect(ro[lab4.titleKey]).toBe("Metode iterative de ordinul trei");
    expect(ro[lab4.topicKey]).toBe(
      "Metoda combinată a tangentei și calculul radicalilor cu metoda de ordinul 3",
    );
    expect(ro[lab4.introKey]).toMatch(/^Rezolvă /);
    expect(ro[lab4.introKey]).toMatch(
      /Compară apoi rezultatele .* cu cele obținute prin metoda tangentei\.$/,
    );
  });

  it("has unique preset ids across the presets and the comparison-only inputs", () => {
    const ids = [...lab4.presets, ...(lab4.comparisonOnly?.presets ?? [])].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Lab 4 messages", () => {
  it("refers only to the lab's own example numbers and never to a lab number", () => {
    for (const messages of [en, ro]) {
      for (const [key, text] of lab4Texts(messages)) {
        expect(text, key).not.toMatch(/\bex\. ?[3-9]/i);
        expect(text, key).not.toMatch(/\blab(oratorul)? ?\d/i);
      }
    }
  });

  it("keeps the examples out of the method explanations: the presets name them", () => {
    for (const messages of [en, ro]) {
      for (const key of Object.keys(messages).filter((k) => k.startsWith("lab4.method."))) {
        if (/\.(tab|title|name)$/.test(key)) continue;
        expect(messages[key as keyof typeof messages], key).not.toMatch(
          /\bex\.|exempl|example|preset/i,
        );
      }
    }
  });

  it("states the √a fact plainly, without calling the lab's ex. 2 wrong", () => {
    for (const messages of [en, ro]) {
      for (const [key, text] of lab4Texts(messages)) {
        expect(text, key).not.toMatch(
          /typo|mistake|inconsistent|greșe|eroare de tipar|inconsecvent/i,
        );
      }
    }
  });

  it("names the 4b reference method as the lab does", () => {
    for (const id of ["rootEx1", "rootEx2"] as const) {
      expect(en[`lab4.compare.${id}.task`]).toContain(
        "the iterative method adapted from the tangent method",
      );
      expect(ro[`lab4.compare.${id}.task`]).toContain(
        "metoda iterativă adaptată în urma folosirii metodei tangentei",
      );
    }
  });

  it("explains that 4b is Halley's method on x² − a", () => {
    expect(en["lab4.method.thirdOrderRoot.idea"]).toContain(
      "Halley's method applied to $f(x) = x^2 - a$",
    );
    expect(ro["lab4.method.thirdOrderRoot.idea"]).toContain(
      "metoda lui Halley aplicată funcției $f(x) = x^2 - a$",
    );
  });
});

describe("Lab 4 presets", () => {
  it("lists the lab's examples in order, numbered as the lab numbers them", () => {
    expect(lab4.presets.map((p) => [p.id, p.methodId])).toEqual([
      ["combined-ex1", "4a"],
      ["combined-ex2", "4a"],
      ["root-ex1", "4b"],
      ["root-ex2-sqrt3", "4b"],
      ["root-ex2-sqrt5", "4b"],
    ]);
    expect(lab4.presets.map((p) => en[p.labelKey].slice(0, 6))).toEqual([
      "Ex. 1:",
      "Ex. 2:",
      "Ex. 1:",
      "Ex. 2:",
      "Ex. 2:",
    ]);
  });

  it.each([
    ["combined-ex1", 3, Math.SQRT2, 2],
    ["combined-ex2", 4, ROOT, 2],
    ["root-ex1", 3, Math.SQRT2, 2],
    ["root-ex2-sqrt3", 3, Math.sqrt(3), 3],
    ["root-ex2-sqrt5", 4, Math.sqrt(5), 5],
  ])("%s validates and converges in n = %i", (id, n, root, x0) => {
    const p = lab4.presets.find((x) => x.id === id);
    if (!p) throw new Error(id);
    const prepared = method(p.methodId).prepare(p.values);
    if (!prepared.ok) throw new Error("invalid");
    const r = scalarRun(prepared.prepared).run();
    expect(r.status).toBe("converged");
    expect(r.n).toBe(n);
    expect(Math.abs((r.result as number) - root)).toBeLessThan(1e-4);
    expect(r.iterations[0].x).toBe(x0);
  });

  it("each method's defaults are its first example, so the form opens on it", () => {
    expect(lab4.presets.find((p) => p.id === "combined-ex1")?.values).toEqual(
      method("4a").defaults,
    );
    expect(lab4.presets.find((p) => p.id === "root-ex1")?.values).toEqual(method("4b").defaults);
  });
});

describe("Lab 4 comparisons", () => {
  const n = (id: string) => {
    const comparison = lab4.comparisons.find((c) => c.id === id);
    if (!comparison) throw new Error(id);
    return runComparison(lab4, comparison).map((row) => row.map((cell) => cell?.result.n ?? null));
  };

  it("lists exactly the comparisons the lab asks for, in order", () => {
    expect(lab4.comparisons.map((c) => [c.id, c.rows.map((r) => r.methodId)])).toEqual([
      ["combined-ex1", ["4a", "1a"]],
      ["combined-ex2", ["4a", "1a"]],
      ["root-ex1", ["4b", "1b"]],
      ["root-ex2", ["4b", "1b", "4b", "1b"]],
    ]);
    for (const comparison of lab4.comparisons) {
      expect(comparison.eps).toEqual([1e-4, 1e-8, 1e-12]);
      expect(comparison.rows[0].presetId.startsWith(comparison.id)).toBe(true);
    }
  });

  it("matches the locked iteration counts", () => {
    expect(n("combined-ex1")).toEqual([
      [3, 4, 4],
      [4, 5, 6],
    ]);
    expect(n("combined-ex2")).toEqual([
      [4, 5, 5],
      [5, 6, 7],
    ]);
    expect(n("root-ex1")).toEqual([
      [3, 4, 4],
      [4, 5, 6],
    ]);
    expect(n("root-ex2")).toEqual([
      [3, 4, 4],
      [4, 5, 6],
      [4, 4, 5],
      [5, 6, 6],
    ]);
  });

  it("gives Newton the example's own f and f′, [1, 2] and x₀ = 2 entered directly", () => {
    expect(findComparisonPreset(lab4, "combined-ex1-newton")?.values).toMatchObject({
      f: "x^2 - 2",
      df: "2x",
      a: "1",
      b: "2",
      x0Mode: "manual",
      x0: "2",
    });
    expect(findComparisonPreset(lab4, "combined-ex2-newton")?.values).toMatchObject({
      f: "x^3 - x - 1",
      df: "3x^2 - 1",
      x0Mode: "manual",
      x0: "2",
    });
  });

  it("gives 1b c = a and k = 2, so both methods start from x₀ = a", () => {
    for (const [id, a] of [
      ["root-ex1", 2],
      ["root-ex2-sqrt3", 3],
      ["root-ex2-sqrt5", 5],
    ] as const) {
      expect(findComparisonPreset(lab4, `${id}-kth-root`)?.values).toMatchObject({
        c: String(a),
        k: "2",
      });
    }
    // Rows come in pairs (4b, then 1b) per radicand.
    for (const [id, starts] of [
      ["root-ex1", [2, 2]],
      ["root-ex2", [3, 3, 5, 5]],
    ] as const) {
      const comparison = lab4.comparisons.find((c) => c.id === id);
      if (!comparison) throw new Error(id);
      runComparison(lab4, comparison).forEach((row, i) => {
        expect(row.every((cell) => cell?.result.iterations[0].x === starts[i])).toBe(true);
      });
    }
  });

  it("keeps every task to the two methods; the card lists the inputs", () => {
    for (const { taskKey } of lab4.comparisons) {
      for (const text of [en[taskKey], ro[taskKey]]) {
        expect(text).not.toMatch(/x₀ =|ε =|c =|k =|\[1/);
      }
      expect(en[taskKey]).not.toMatch(/\bthe lab\b/i);
      expect(ro[taskKey]).not.toContain("Laboratorul");
    }
  });

  it("asks ex. 2 for √3 and √5 in one card, naming a = 3 and a = 5 together", () => {
    expect(en["lab4.compare.rootEx2"]).toBe("Ex. 2: √3 and √5 with the third-order method");
    expect(ro["lab4.compare.rootEx2"]).toBe("Ex. 2: √3 și √5 prin metoda de ordinul 3");
    expect(en["lab4.compare.rootEx2.task"]).toMatch(
      /^Approximate √3 and √5 with .* converges to √a, so a = 3 and a = 5 respectively\.$/,
    );
    expect(ro["lab4.compare.rootEx2.task"]).toMatch(
      /^Aproximează √3 și √5 prin .* converge către √a, deci se ia a = 3, respectiv a = 5\.$/,
    );
  });
});

describe("Lab 4 validation", () => {
  const errorsFor = (methodId: string, patch: FieldValues) => {
    const m = method(methodId);
    const prepared = m.prepare({ ...m.defaults, ...patch });
    return prepared.ok ? {} : prepared.errors;
  };

  it.each([
    ["4a", { f: "x^ +" }, "f", "field.error.syntax"],
    ["4a", { df: "" }, "df", "field.error.empty"],
    ["4a", { df: "y" }, "df", "field.error.unknown-symbol"],
    ["4a", { a: "2", b: "1" }, "b", "field.error.greater-than"],
    ["4a", { x0: "" }, "x0", "field.error.empty"],
    ["4a", { x0: "1e7" }, "x0", "field.error.range"],
    ["4a", { eps: "0" }, "eps", "field.error.range"],
    ["4a", { maxIter: "0" }, "maxIter", "field.error.integer-range"],
    ["4b", { eps: "2" }, "eps", "field.error.range"],
    ["4b", { maxIter: "1.5" }, "maxIter", "field.error.integer-range"],
  ])("%s %j → %s: %s", (methodId, patch, field, key) => {
    expect(errorsFor(methodId, patch)[field]?.key).toBe(key);
  });

  it.each(["0", "-2", "2e6", ""])("rejects a = %j next to the field, so nothing runs", (a) => {
    const errors = errorsFor("4b", { a });
    expect(errors.a).toBeDefined();
    expect(Object.keys(errors)).toEqual(["a"]);
  });

  it("accepts the largest radicand, a = 10⁶", () => {
    expect(errorsFor("4b", { a: "1e6" })).toEqual({});
  });

  it("asks for exactly the lab's inputs", () => {
    expect(method("4a").fields.map((f) => f.id)).toEqual([
      "f",
      "df",
      "a",
      "b",
      "x0",
      "eps",
      "maxIter",
    ]);
    expect(method("4b").fields.map((f) => f.id)).toEqual(["a", "eps", "maxIter"]);
    expect(method("4b").fields[0]).toMatchObject({ symbol: "a", labelKey: "field.c" });
  });

  it("derives f′ from f", () => {
    const m = method("4a");
    const field = m.fields.find((f) => f.id === "df") as ExpressionField;
    expect(deriveField(field, m.fields, { ...m.defaults, f: "x^3 - x - 1" })).toEqual({
      ok: true,
      value: "3 * x ^ 2 - 1",
    });
  });

  it("has a default iteration cap of 1000", () => {
    expect(method("4a").defaults.maxIter).toBe("1000");
    expect(method("4b").defaults.maxIter).toBe("1000");
  });
});

describe("Lab 4 runs", () => {
  it.each(lab4.presets.map((p) => [p.id, p] as const))(
    "preset %s, picked on its method's tab, fills the form, which then runs to convergence",
    (_id, preset) => {
      const onTab = labReducer(initialLabState(lab4), {
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

  it("stops the combined tangent method with zero-derivative, with Newton's message (x₀ = 0)", () => {
    const r = prepare("4a", { a: "-1", x0: "0" }).run();
    expect(r.error).toEqual({ code: "zero-derivative", n: 0, x: 0 });
    expect(r.iterations).toHaveLength(1);
    expect(method("4a").errorKeys).toBeUndefined();
  });

  it("converges at n = 1 on an exact root (f = x − 1, x₀ = 1)", () => {
    const r = prepare("4a", { f: "x - 1", df: "1", a: "0", x0: "1" }).run();
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.result).toBe(1);
  });

  it("reports undefined-value when f(yₙ) is undefined (f = ln x, x₀ = 3)", () => {
    const r = prepare("4a", { f: "ln(x)", df: "1/x", x0: "3" }).run();
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: 3 });
    expect(r.iterations).toHaveLength(1);
  });

  it("converges at n = 1 for a = 1", () => {
    const r = prepare("4b", { a: "1" }).run();
    expect(r.status).toBe("converged");
    expect(r.n).toBe(1);
    expect(r.result).toBe(1);
  });

  it("plots the combined tangent steps over [a, b], and 4b as Halley's steps on x² − a", () => {
    const combined = prepare("4a").plot;
    expect(combined).toMatchObject({ kind: "combined-tangent", interval: [1, 2] });
    if (combined?.kind !== "combined-tangent") throw new Error("kind");
    expect([combined.f(2), combined.df(2)]).toEqual([2, 4]);
    const root = prepare("4b", { a: "5" }).plot;
    expect(root).toMatchObject({ kind: "halley" });
    if (root?.kind !== "halley") throw new Error("kind");
    expect(root.interval).toBeUndefined();
    expect([root.f(3), root.df(3), root.ddf(3)]).toEqual([4, 6, 2]);
    expect(method("4b").valueColumn).toBe("x_n^2 - a");
  });

  it("knows the exact value √a for 4b only: f is free text in 4a", () => {
    expect(prepare("4a").exact).toBeUndefined();
    expect(prepare("4b", { a: "3" }).exact).toEqual({ value: Math.sqrt(3), tex: "\\sqrt{3}" });
  });
});

describe("Lab 4 formulas", () => {
  const formulas = lab4.methods.flatMap((m) => m.explanation.filter((b) => b.kind === "formula"));

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

  it("shows no rule R0: both methods take x₀ directly", () => {
    expect(formulas.some((b) => b.tex.startsWith("x_0 ="))).toBe(false);
  });
});
