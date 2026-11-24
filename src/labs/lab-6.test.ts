import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { ro } from "@/i18n/ro";
import { systemView } from "@/test/runs";
import { runComparison } from "./compare";
import { lab6 } from "./lab-6";
import { initialLabState, labReducer, toRunView } from "./lab-state";
import { findReadyLab } from "./registry";
import type { FieldValues, SystemPreparedRun } from "./types";

const method = (id: string) => {
  const m = lab6.methods.find((x) => x.id === id);
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
  const found = lab6.presets.find((p) => p.id === id);
  if (!found) throw new Error(id);
  return found;
};

const lab6Texts = (messages: Record<string, string>) =>
  Object.entries(messages).filter(([key]) => key.startsWith("lab6."));

describe("Lab 6 registry", () => {
  it("is ready at /labs/nonlinear-systems with the 6a, 6b and 6c tabs", () => {
    expect(findReadyLab("nonlinear-systems")).toBe(lab6);
    expect(lab6.number).toBe(6);
    expect(lab6.methods.map((m) => m.id)).toEqual(["6a", "6b", "6c"]);
    expect(lab6.comparisonOnly).toBeUndefined();
  });

  it("keeps its title and topic, and opens in the course's register", () => {
    expect(en[lab6.titleKey]).toBe("Successive approximations and Gauss–Seidel");
    expect(ro[lab6.titleKey]).toBe("Aproximații succesive și metoda Gauss–Seidel");
    expect(ro[lab6.introKey]).toMatch(/^Rezolvă /);
    expect(ro[lab6.introKey]).toMatch(/Compară apoi /);
  });

  it("names the methods and tabs as the lab does", () => {
    expect(ro["lab6.method.successive.title"]).toBe(
      "Metoda aproximațiilor succesive pentru sisteme neliniare",
    );
    expect(ro["lab6.method.gaussSeidel2.name"]).toBe("Metoda Gauss–Seidel");
    expect(lab6.methods.map((m) => en[m.tabKey])).toEqual([
      "6a · Successive approximations",
      "6b · Gauss–Seidel, 3 equations",
      "6c · Gauss–Seidel, 2 equations",
    ]);
    expect(lab6.methods.map((m) => ro[m.tabKey])).toEqual([
      "6a · Aproximații succesive",
      "6b · Gauss–Seidel, 3 ecuații",
      "6c · Gauss–Seidel, 2 ecuații",
    ]);
  });
});

describe("Lab 6 messages", () => {
  it("refers only to the lab's own example numbers and never to a lab number", () => {
    for (const messages of [en, ro]) {
      for (const [key, text] of lab6Texts(messages)) {
        expect(text, key).not.toMatch(/\bex\. ?[5-9]/i);
        expect(text, key).not.toMatch(/\blab(oratorul)? ?\d/i);
      }
    }
  });

  it("keeps the examples out of the method explanations: the presets name them", () => {
    for (const messages of [en, ro]) {
      for (const key of Object.keys(messages).filter((k) => k.startsWith("lab6.method."))) {
        if (/\.(tab|title|name)$/.test(key)) continue;
        expect(messages[key as keyof typeof messages], key).not.toMatch(
          /\bex\.|exempl|example|preset/i,
        );
      }
    }
  });

  it("states in the ex. 4 task that the comparison runs the three precisions", () => {
    expect(en["lab6.compare.ex4.task"]).toMatch(/three precisions/);
    expect(ro["lab6.compare.ex4.task"]).toMatch(/cele trei precizii/);
  });
});

describe("Lab 6 presets", () => {
  it("lists the lab's examples in order, numbered as the lab numbers them", () => {
    expect(lab6.presets.map((p) => [p.id, p.methodId])).toEqual([
      ["ex1", "6a"],
      ["ex2-near-2-1", "6a"],
      ["ex2-near-1-2", "6a"],
      ["ex2-near-minus-1-minus-2", "6a"],
      ["ex2-near-minus-2-minus-1", "6a"],
      ["ex3", "6b"],
      ["ex4", "6c"],
    ]);
    for (const p of lab6.presets) {
      const number = p.id.slice(2, 3);
      expect(en[p.labelKey]).toMatch(new RegExp(`^Ex\\. ${number}: `));
      expect(ro[p.labelKey]).toMatch(new RegExp(`^Ex\\. ${number}: `));
    }
  });

  it("gives ex. 1 the lab's F, G and start", () => {
    expect(preset("ex1").values).toEqual({
      F: "sqrt((x * (y + 5) - 1) / 2)",
      G: "sqrt(x + 3 lg(x))",
      x0: "3.5",
      y0: "2.2",
      eps: "1e-4",
      maxIter: "1000",
    });
  });

  it("gives ex. 2 the lab's four forms, each from (1.5, 1.5)", () => {
    expect(
      ["ex2-near-2-1", "ex2-near-1-2", "ex2-near-minus-1-minus-2", "ex2-near-minus-2-minus-1"].map(
        (id) => {
          const { F, G, x0, y0, eps } = preset(id).values;
          return [F, G, x0, y0, eps];
        },
      ),
    ).toEqual([
      ["sqrt(5 - y^2)", "2 / x", "1.5", "1.5", "1e-4"],
      ["2 / y", "sqrt(5 - x^2)", "1.5", "1.5", "1e-4"],
      ["2 / y", "-sqrt(5 - x^2)", "1.5", "1.5", "1e-4"],
      ["-sqrt(5 - y^2)", "2 / x", "1.5", "1.5", "1e-4"],
    ]);
  });

  it("gives ex. 3 the lab's three functions, (10, 10, 10) and ε = 10⁻³", () => {
    expect(preset("ex3").values).toEqual({
      F1: "sqrt(0.5 (y z + 5x - 1))",
      F2: "sqrt(2x + ln(z))",
      F3: "sqrt(x y + 2z + 8)",
      x0: "10",
      y0: "10",
      z0: "10",
      eps: "1e-3",
      maxIter: "1000",
    });
  });

  it("runs ex. 4 on ex. 2's form near (2, 1), from the same start", () => {
    expect(preset("ex4").values).toEqual(preset("ex2-near-2-1").values);
  });

  it("writes each preset's tag without a point, so it reads the same in both languages", () => {
    expect(preset("ex2-near-2-1").tex).toBe("x_0 = 1.5,\\ y_0 = 1.5");
    expect(preset("ex3").tex).toBe("x_0 = 10,\\ y_0 = 10,\\ z_0 = 10");
  });

  it("each method's defaults are its first example, so the form opens on it", () => {
    expect(method("6a").defaults).toEqual(preset("ex1").values);
    expect(method("6b").defaults).toEqual(preset("ex3").values);
    expect(method("6c").defaults).toEqual(preset("ex4").values);
    expect(initialLabState(lab6).presetIds).toEqual({ "6a": "ex1", "6b": "ex3", "6c": "ex4" });
  });
});

describe("Lab 6 comparison", () => {
  const ex4 = lab6.comparisons[0];

  it("is the one comparison the lab asks for: ex. 4, 6c against 6a", () => {
    expect(lab6.comparisons.map((c) => c.id)).toEqual(["ex4"]);
    expect(ex4.eps).toEqual([1e-4, 1e-8, 1e-12]);
    expect(ex4.rows).toEqual([
      { methodId: "6c", presetId: "ex4" },
      { methodId: "6a", presetId: "ex2-near-2-1" },
    ]);
  });

  it("matches the locked iteration counts", () => {
    const cells = runComparison(lab6, ex4);
    expect(cells.map((row) => row.map((cell) => cell?.result.n ?? null))).toEqual([
      [9, 16, 22],
      [14, 27, 40],
    ]);
  });
});

describe("Lab 6 validation", () => {
  const errorsFor = (methodId: string, patch: FieldValues) => {
    const m = method(methodId);
    const prepared = m.prepare({ ...m.defaults, ...patch });
    return prepared.ok ? {} : prepared.errors;
  };

  it.each([
    ["6a", { F: "x + z" }, "F", "field.error.unknown-symbol"],
    ["6c", { G: "" }, "G", "field.error.empty"],
    ["6b", { F2: "x + w" }, "F2", "field.error.unknown-symbol"],
    ["6b", { z0: "2e6" }, "z0", "field.error.range"],
    ["6a", { y0: "-2e6" }, "y0", "field.error.range"],
    ["6a", { eps: "0" }, "eps", "field.error.range"],
    ["6c", { maxIter: "0" }, "maxIter", "field.error.integer-range"],
  ])("%s %j → %s: %s", (methodId, patch, field, key) => {
    expect(errorsFor(methodId, patch)[field]?.key).toBe(key);
  });

  it("asks for exactly the lab's inputs, with no derivative fields", () => {
    for (const id of ["6a", "6c"]) {
      const m = method(id);
      expect(m.fields.map((f) => f.id)).toEqual(["F", "G", "x0", "y0", "eps", "maxIter"]);
      for (const f of m.fields) {
        if (f.kind === "expression") {
          expect(f.variables).toEqual(["x", "y"]);
          expect(f.derive).toBeUndefined();
        }
      }
    }
    const m = method("6b");
    expect(m.fields.map((f) => f.id)).toEqual([
      "F1",
      "F2",
      "F3",
      "x0",
      "y0",
      "z0",
      "eps",
      "maxIter",
    ]);
    for (const f of m.fields) {
      if (f.kind === "expression") expect(f.variables).toEqual(["x", "y", "z"]);
    }
  });
});

describe("Lab 6 runs", () => {
  it.each(lab6.presets.map((p) => [p.id, p] as const))(
    "preset %s, picked on its method's tab, fills the form, which then runs to convergence",
    (_id, p) => {
      const onTab = labReducer(initialLabState(lab6), { type: "select", methodId: p.methodId });
      const state = labReducer(onTab, { type: "preset", preset: p });
      expect(state.presetIds[p.methodId]).toBe(p.id);
      const prepared = method(p.methodId).prepare(state.values[p.methodId]);
      if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
      expect(systemView(toRunView(prepared.prepared)).result.status).toBe("converged");
    },
  );

  it.each([
    ["6a", "ex1", 9],
    ["6a", "ex2-near-2-1", 14],
    ["6a", "ex2-near-1-2", 14],
    ["6a", "ex2-near-minus-1-minus-2", 14],
    ["6a", "ex2-near-minus-2-minus-1", 14],
    ["6b", "ex3", 14],
    ["6c", "ex4", 9],
  ])("%s %s takes n = %i", (methodId, id, n) => {
    expect(prepare(methodId, preset(id).values).run().n).toBe(n);
  });

  it("plots x = F and y = G for 6a and 6c, and no plane for 6b", () => {
    for (const id of ["6a", "6c"]) {
      const { plot } = prepare(id, preset("ex2-near-2-1").values);
      if (plot.kind !== "fixed-point") throw new Error(`expected the curves x = F, y = G (${id})`);
      expect(plot.G(2, 1)).toBe(1);
    }
    expect(prepare("6b").plot).toEqual({ kind: "fixed-point-3d" });
  });

  it("stops with undefined-value from (3, 3) on ex. 2's form near (2, 1)", () => {
    const r = prepare("6a", { ...preset("ex2-near-2-1").values, x0: "3", y0: "3" }).run();
    expect(r.error).toEqual({ code: "undefined-value", n: 0, x: 3, y: 3 });
  });
});

describe("Lab 6 exact solution", () => {
  it.each([
    ["ex2-near-2-1", { x: 2, y: 1 }],
    ["ex2-near-1-2", { x: 1, y: 2 }],
    ["ex2-near-minus-1-minus-2", { x: -1, y: -2 }],
    ["ex2-near-minus-2-minus-1", { x: -2, y: -1 }],
  ])("knows it for %s in 6a and 6c", (id, exact) => {
    expect(prepare("6a", preset(id).values).exact).toEqual(exact);
    expect(prepare("6c", preset(id).values).exact).toEqual(exact);
  });

  it("knows (2, 1) for ex. 4 and nothing for ex. 1 or ex. 3", () => {
    expect(prepare("6c").exact).toEqual({ x: 2, y: 1 });
    expect(prepare("6a").exact).toBeUndefined();
    expect(prepare("6b").exact).toBeUndefined();
  });

  it("keeps it whatever the start, ε or cap, and with spaces changed", () => {
    const base = preset("ex2-near-2-1").values;
    for (const patch of [
      { x0: "1.9", y0: "1.2" },
      { eps: "1e-8" },
      { maxIter: "50" },
      { F: " sqrt(5-y^2) ", G: "2/x" },
    ] as FieldValues[]) {
      expect(prepare("6a", { ...base, ...patch }).exact, JSON.stringify(patch)).toEqual({
        x: 2,
        y: 1,
      });
    }
  });

  it("drops it once F or G is no longer one of ex. 2's forms", () => {
    const base = preset("ex2-near-2-1").values;
    for (const patch of [{ F: "sqrt(6 - y^2)" }, { G: "2 / y" }] as FieldValues[]) {
      expect(prepare("6a", { ...base, ...patch }).exact, JSON.stringify(patch)).toBeUndefined();
    }
  });
});

describe("Lab 6 formulas", () => {
  const formulas = lab6.methods.map((m) => m.explanation.find((b) => b.kind === "formula"));

  it("use the new x in G for 6c and the new x, y in F₂, F₃ for 6b", () => {
    expect(formulas[0]?.kind === "formula" && formulas[0].tex).toContain("G(x_n, y_n)");
    expect(formulas[1]?.kind === "formula" && formulas[1].tex).toContain(
      "F_3(x_{n+1}, y_{n+1}, z_n)",
    );
    expect(formulas[2]?.kind === "formula" && formulas[2].tex).toContain("G(x_{n+1}, y_n)");
  });

  it("use the three-coordinate stopping rule for 6b only", () => {
    const stopping = lab6.methods.map((m) =>
      m.explanation.find((b) => b.kind === "text" && b.key.startsWith("common.")),
    );
    expect(stopping.map((b) => (b?.kind === "text" ? b.key : null))).toEqual([
      "common.systemStopping",
      "common.system3Stopping",
      "common.systemStopping",
    ]);
  });
});
