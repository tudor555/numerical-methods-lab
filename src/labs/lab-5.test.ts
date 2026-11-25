import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { ro } from "@/i18n/ro";
import { systemView } from "@/test/runs";
import { comparisonInputs, findComparisonPreset, runComparison } from "./compare";
import { deriveField } from "./fields";
import { lab5 } from "./lab-5";
import { initialLabState, labReducer, toRunView } from "./lab-state";
import { findReadyLab } from "./registry";
import type { ExpressionField, FieldValues, SystemPreparedRun } from "./types";

const method = (id: string) => {
  const m = lab5.methods.find((x) => x.id === id);
  if (!m) throw new Error(id);
  return m;
};

const prepare = (id: string, patch: FieldValues = {}): SystemPreparedRun => {
  const m = method(id);
  const prepared = m.prepare({ ...m.defaults, ...patch });
  if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
  if (prepared.prepared.kind !== "system") throw new Error("expected a system run");
  return prepared.prepared;
};

const preset = (id: string) => {
  const found = lab5.presets.find((p) => p.id === id);
  if (!found) throw new Error(id);
  return found;
};

const lab5Texts = (messages: Record<string, string>) =>
  Object.entries(messages).filter(([key]) => key.startsWith("lab5."));

describe("Lab 5 registry", () => {
  it("is ready at /labs/newton-systems with the Newton and modified Newton tabs", () => {
    expect(findReadyLab("newton-systems")).toBe(lab5);
    expect(lab5.number).toBe(5);
    expect(lab5.methods.map((m) => m.id)).toEqual(["5a", "5b"]);
    expect(lab5.comparisonOnly).toBeUndefined();
  });

  it("keeps its title and topic, and opens in the course's register", () => {
    expect(en[lab5.titleKey]).toBe("Newton's method for 2×2 systems");
    expect(ro[lab5.titleKey]).toBe("Metoda lui Newton pentru sisteme 2×2");
    expect(ro[lab5.topicKey]).toBe(
      "Metoda lui Newton și metoda Newton modificată pentru sisteme neliniare",
    );
    expect(ro[lab5.introKey]).toMatch(/^Rezolvă /);
    expect(ro[lab5.introKey]).toMatch(/Compară apoi /);
  });

  it("names the methods as the lab does, in Romanian", () => {
    expect(ro["lab5.method.newton.title"]).toBe("Metoda lui Newton pentru sisteme neliniare");
    expect(ro["lab5.method.modified.title"]).toBe("Metoda lui Newton modificată");
    expect(en["lab5.method.newton.tab"]).toBe("5a · Newton");
    expect(en["lab5.method.modified.tab"]).toBe("5b · Modified Newton");
  });
});

describe("Lab 5 messages", () => {
  it("refers only to the lab's own example numbers and never to a lab number", () => {
    for (const messages of [en, ro]) {
      for (const [key, text] of lab5Texts(messages)) {
        expect(text, key).not.toMatch(/\bex\. ?[4-9]/i);
        expect(text, key).not.toMatch(/\blab(oratorul)? ?\d/i);
      }
    }
  });

  it("keeps the examples out of the method explanations: the presets name them", () => {
    for (const messages of [en, ro]) {
      for (const key of Object.keys(messages).filter((k) => k.startsWith("lab5.method."))) {
        if (/\.(tab|title|name)$/.test(key)) continue;
        expect(messages[key as keyof typeof messages], key).not.toMatch(
          /\bex\.|exempl|example|preset/i,
        );
      }
    }
  });

  it("names the system, both starts and the three precisions in the ex. 3 task", () => {
    expect(en["lab5.compare.ex3.task"]).toContain("x² + y² = 10, √(x + y) = 2");
    expect(en["lab5.compare.ex3.task"]).toMatch(/from \(0\.9, 3\.1\) and from \(2\.9, 1\.1\)/);
    expect(en["lab5.compare.ex3.task"]).toMatch(/three precisions/);
    expect(ro["lab5.compare.ex3.task"]).toContain("x² + y² = 10, √(x + y) = 2");
    expect(ro["lab5.compare.ex3.task"]).toMatch(/din \(0,9; 3,1\) și din \(2,9; 1,1\)/);
    expect(ro["lab5.compare.ex3.task"]).toMatch(/cele trei precizii/);
  });

  it("does not send the reader back to ex. 2 in the ex. 3 comparison", () => {
    for (const key of ["lab5.compare.ex3", "lab5.compare.ex3.task"] as const) {
      expect(en[key]).not.toMatch(/ex\. 2/);
      expect(ro[key]).not.toMatch(/ex\. 2/);
    }
  });
});

describe("Lab 5 presets", () => {
  it("lists the lab's examples in order, numbered as the lab numbers them", () => {
    expect(lab5.presets.map((p) => [p.id, p.methodId])).toEqual([
      ["ex1", "5a"],
      ["ex2-first", "5a"],
      ["ex2-second", "5a"],
      ["ex3-first", "5b"],
      ["ex3-second", "5b"],
    ]);
    for (const p of lab5.presets) {
      const number = p.id.slice(2, 3);
      expect(en[p.labelKey]).toMatch(new RegExp(`^Ex\\. ${number}: `));
      expect(ro[p.labelKey]).toMatch(new RegExp(`^Ex\\. ${number}: `));
    }
  });

  it("gives ex. 1 the lab's system and start", () => {
    expect(preset("ex1").values).toEqual({
      F: "2x^3 - y^2 - 1",
      G: "x y^3 - y - 4",
      Fx: "6x^2",
      Fy: "-2y",
      Gx: "y^3",
      Gy: "3x y^2 - 1",
      x0: "1.2",
      y0: "1.7",
      eps: "1e-4",
      maxIter: "1000",
    });
  });

  it("runs ex. 2 and ex. 3 on the same system, from (0.9, 3.1) and (2.9, 1.1)", () => {
    for (const [a, b, x0, y0] of [
      ["ex2-first", "ex3-first", "0.9", "3.1"],
      ["ex2-second", "ex3-second", "2.9", "1.1"],
    ]) {
      expect(preset(a).values).toEqual(preset(b).values);
      expect(preset(a).values).toMatchObject({
        F: "x^2 + y^2 - 10",
        G: "sqrt(x + y) - 2",
        x0,
        y0,
        eps: "1e-4",
      });
    }
  });

  it("writes each preset's tag without a point, so it reads the same in both languages", () => {
    expect(preset("ex2-first").tex).toBe("x_0 = 0.9,\\ y_0 = 3.1");
  });

  it("each method's defaults are its first example, so the form opens on it", () => {
    expect(method("5a").defaults).toEqual(preset("ex1").values);
    expect(method("5b").defaults).toEqual(preset("ex3-first").values);
    const state = initialLabState(lab5);
    expect(state.presetIds).toEqual({ "5a": "ex1", "5b": "ex3-first" });
  });
});

describe("Lab 5 comparison", () => {
  const ex3 = lab5.comparisons[0];

  it("is the one comparison the lab asks for: ex. 3, 5b against 5a from both starts", () => {
    expect(lab5.comparisons.map((c) => c.id)).toEqual(["ex3"]);
    expect(ex3.eps).toEqual([1e-4, 1e-8, 1e-12]);
    expect(ex3.rows).toEqual([
      { methodId: "5b", presetId: "ex3-first" },
      { methodId: "5a", presetId: "ex2-first" },
      { methodId: "5b", presetId: "ex3-second" },
      { methodId: "5a", presetId: "ex2-second" },
    ]);
  });

  it("matches the locked iteration counts", () => {
    const cells = runComparison(lab5, ex3);
    expect(cells.map((row) => row.map((cell) => cell?.kind))).toEqual(
      Array(4).fill(["system", "system", "system"]),
    );
    expect(cells.map((row) => row.map((cell) => cell?.result.n ?? null))).toEqual([
      [4, 8, 12],
      [3, 4, 5],
      [4, 9, 13],
      [3, 4, 5],
    ]);
  });

  it("lists each row's start as one point", () => {
    const first = findComparisonPreset(lab5, "ex3-first");
    if (!first) throw new Error("ex3-first");
    const inputs = comparisonInputs(method("5b"), first.values, ";");
    expect(inputs).toContainEqual({ kind: "tex", tex: "(x_0;\\ y_0) = (0.9;\\ 3.1)" });
    expect(inputs.some((i) => i.kind === "tex" && i.tex.startsWith("y_0"))).toBe(false);
    expect(inputs[0]).toEqual({ kind: "tex", tex: expect.stringMatching(/^F\(x, y\) = /) });
  });
});

describe("Lab 5 validation", () => {
  const errorsFor = (methodId: string, patch: FieldValues) => {
    const m = method(methodId);
    const prepared = m.prepare({ ...m.defaults, ...patch });
    return prepared.ok ? {} : prepared.errors;
  };

  it.each([
    ["5a", { F: "x + z" }, "F", "field.error.unknown-symbol"],
    ["5a", { G: "" }, "G", "field.error.empty"],
    ["5a", { Fy: "x^ +" }, "Fy", "field.error.syntax"],
    ["5a", { y0: "2e6" }, "y0", "field.error.range"],
    ["5a", { x0: "" }, "x0", "field.error.empty"],
    ["5a", { eps: "0" }, "eps", "field.error.range"],
    ["5b", { maxIter: "0" }, "maxIter", "field.error.integer-range"],
  ])("%s %j → %s: %s", (methodId, patch, field, key) => {
    expect(errorsFor(methodId, patch)[field]?.key).toBe(key);
  });

  it("asks for exactly the lab's inputs, in x and y", () => {
    for (const m of lab5.methods) {
      expect(m.fields.map((f) => f.id)).toEqual([
        "F",
        "G",
        "Fx",
        "Fy",
        "Gx",
        "Gy",
        "x0",
        "y0",
        "eps",
        "maxIter",
      ]);
      for (const f of m.fields) {
        if (f.kind === "expression") expect(f.variables).toEqual(["x", "y"]);
      }
    }
  });

  it("derives each partial from F or G in its own variable", () => {
    const m = method("5a");
    const derived = Object.fromEntries(
      ["Fx", "Fy", "Gx", "Gy"].map((id) => {
        const field = m.fields.find((f) => f.id === id) as ExpressionField;
        const outcome = deriveField(field, m.fields, m.defaults);
        return [id, outcome.ok ? outcome.value : outcome.issue.key];
      }),
    );
    expect(derived).toEqual({
      Fx: "6 * x ^ 2",
      Fy: "-(2 * y)",
      Gx: "y ^ 3",
      Gy: "3 * x * y ^ 2 - 1",
    });
  });
});

describe("Lab 5 runs", () => {
  it.each(lab5.presets.map((p) => [p.id, p] as const))(
    "preset %s, picked on its method's tab, fills the form, which then runs to convergence",
    (_id, p) => {
      const onTab = labReducer(initialLabState(lab5), { type: "select", methodId: p.methodId });
      const state = labReducer(onTab, { type: "preset", preset: p });
      expect(state.presetIds[p.methodId]).toBe(p.id);
      const prepared = method(p.methodId).prepare(state.values[p.methodId]);
      if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
      expect(systemView(toRunView(prepared.prepared)).result.status).toBe("converged");
    },
  );

  it("runs ex. 1 to (1.2342745, 1.6615265) in n = 3", () => {
    const r = prepare("5a").run();
    expect(r.n).toBe(3);
    expect(r.result?.x).toBeCloseTo(1.2342745, 7);
    expect(r.result?.y).toBeCloseTo(1.6615265, 7);
  });

  it("plots F and G, the curves the path chart draws", () => {
    const { plot } = prepare("5a");
    if (plot.kind !== "system") throw new Error("expected the curves F = 0 and G = 0");
    expect(plot.F(1, 1)).toBe(0);
    expect(plot.G(1, 1)).toBe(-4);
  });
});

describe("Lab 5 exact solution", () => {
  it("knows (1, 3) and (3, 1) for ex. 2 and ex. 3, and nothing for ex. 1", () => {
    expect(prepare("5a", preset("ex2-first").values).exact).toEqual({ x: 1, y: 3 });
    expect(prepare("5a", preset("ex2-second").values).exact).toEqual({ x: 3, y: 1 });
    expect(prepare("5b", preset("ex3-first").values).exact).toEqual({ x: 1, y: 3 });
    expect(prepare("5b", preset("ex3-second").values).exact).toEqual({ x: 3, y: 1 });
    expect(prepare("5a").exact).toBeUndefined();
  });

  it("keeps it while ε, the cap or a partial changes, and when x₀ is written another way", () => {
    const base = preset("ex2-first").values;
    for (const patch of [
      { eps: "1e-8" },
      { maxIter: "50" },
      { Fx: "2*x" },
      { x0: "9/10" },
    ] as FieldValues[]) {
      expect(prepare("5a", { ...base, ...patch }).exact, JSON.stringify(patch)).toEqual({
        x: 1,
        y: 3,
      });
    }
    expect(prepare("5a", { ...base, F: "  x^2 + y^2 - 10 " }).exact).toEqual({ x: 1, y: 3 });
    expect(prepare("5a", { ...base, G: "sqrt(x+y)-2" }).exact).toEqual({ x: 1, y: 3 });
  });

  it("drops it once the system or the start changes", () => {
    const base = preset("ex2-first").values;
    for (const patch of [
      { F: "x^2 + y^2 - 11" },
      { G: "sqrt(x + y) - 3" },
      { x0: "1" },
    ] as FieldValues[]) {
      expect(prepare("5a", { ...base, ...patch }).exact, JSON.stringify(patch)).toBeUndefined();
    }
  });
});

describe("Lab 5 formulas", () => {
  const formulas = lab5.methods.flatMap((m) => m.explanation.filter((b) => b.kind === "formula"));

  it("never hard-code words inside \\text{…}", () => {
    for (const block of formulas) {
      for (const [, inner] of block.tex.matchAll(/\\text\{([^}]*)\}/g)) {
        expect(inner).toMatch(/^⟪\w+⟫$/);
      }
    }
  });

  it("keeps 5b's partial derivatives and J at the starting point", () => {
    expect(formulas[1].tex).toContain("J_0");
    expect(formulas[1].tex).toContain("F_x^0");
    expect(formulas[0].tex).not.toContain("^0");
  });
});
