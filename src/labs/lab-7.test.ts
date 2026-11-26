import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { ro } from "@/i18n/ro";
import { cauchyRun, cauchyView } from "@/test/runs";
import { comparisonInputs, runNodeComparison } from "./compare";
import { lab7 } from "./lab-7";
import { initialLabState, labReducer, toRunView } from "./lab-state";
import { findReadyLab } from "./registry";
import type { FieldValues, NodeComparison } from "./types";

const method = (id: string) => {
  const m = lab7.methods.find((x) => x.id === id);
  if (!m) throw new Error(id);
  return m;
};

const prepare = (id: string, patch: FieldValues = {}) => {
  const m = method(id);
  const prepared = m.prepare({ ...m.defaults, ...patch });
  if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
  return cauchyRun(prepared.prepared);
};

const preset = (id: string) => {
  const found = lab7.presets.find((p) => p.id === id);
  if (!found) throw new Error(id);
  return found;
};

const comparison = (id: string): NodeComparison => {
  const found = lab7.comparisons.find((c) => c.id === id);
  if (found?.kind !== "nodes") throw new Error(id);
  return found;
};

const lab7Texts = (messages: Record<string, string>) =>
  Object.entries(messages).filter(([key]) => key.startsWith("lab7."));

describe("Lab 7 registry", () => {
  it("is ready at /labs/euler with the 7a, 7b and 7c tabs", () => {
    expect(findReadyLab("euler")).toBe(lab7);
    expect(lab7.number).toBe(7);
    expect(lab7.methods.map((m) => m.id)).toEqual(["7a", "7b", "7c"]);
    expect(lab7.comparisonOnly).toBeUndefined();
  });

  it("keeps its title and topic, and opens in the course's register", () => {
    expect(en[lab7.titleKey]).toBe("Euler-type methods");
    expect(ro[lab7.titleKey]).toBe("Metode de tip Euler");
    expect(ro[lab7.introKey]).toMatch(/^Rezolvă problema Cauchy /);
    expect(ro[lab7.introKey]).toMatch(/Compară apoi /);
  });

  it("names the methods and tabs as the lab does", () => {
    expect(lab7.methods.map((m) => ro[m.titleKey])).toEqual([
      "Metoda lui Euler",
      "Metoda modificată a lui Euler (metoda mid-point)",
      "Metoda Euler–Heun",
    ]);
    expect(lab7.methods.map((m) => en[m.tabKey])).toEqual([
      "7a · Euler",
      "7b · Modified Euler",
      "7c · Euler–Heun",
    ]);
    expect(lab7.methods.map((m) => ro[m.tabKey])).toEqual([
      "7a · Euler",
      "7b · Euler modificată",
      "7c · Euler–Heun",
    ]);
  });
});

describe("Lab 7 messages", () => {
  it("never names a lab number", () => {
    for (const messages of [en, ro]) {
      for (const [key, text] of lab7Texts(messages)) {
        expect(text, key).not.toMatch(/\blab(oratorul)? ?\d/i);
        expect(text, key).not.toMatch(/\bex\. ?[3-9]/i);
      }
    }
  });

  it("keeps the examples out of the method explanations: the presets name them", () => {
    for (const messages of [en, ro]) {
      for (const key of Object.keys(messages).filter((k) => k.startsWith("lab7.method."))) {
        if (/\.(tab|title|name)$/.test(key)) continue;
        expect(messages[key as keyof typeof messages], key).not.toMatch(
          /\bex\.|exempl|example|preset/i,
        );
      }
    }
  });

  it("uses the course's terms in Romanian", () => {
    expect(ro["lab7.intro"]).toContain("problema Cauchy");
    expect(ro["lab7.method.euler.steps"]).toContain("pasul $h$");
    expect(ro["lab7.compare.ex1.task"]).toContain("valoarea exactă");
    expect(ro["lab7.compare.example.task"]).toContain("soluția exactă");
    expect(ro["table.node"]).toBe("Valorile în noduri");
  });

  it("explains in the numerical example's comparison why 7b and 7c match", () => {
    expect(comparison("example").noteKey).toBe("lab7.compare.example.note");
    expect(en["lab7.compare.example.note"]).toContain("1 + h + h²/2");
    expect(ro["lab7.compare.example.note"]).toContain("1 + h + h²/2");
  });
});

describe("Lab 7 presets", () => {
  it("lists the lab's examples in order, numbered as the lab numbers them", () => {
    expect(lab7.presets.map((p) => [p.id, p.methodId])).toEqual([
      ["ex1-h-1-4", "7a"],
      ["ex1-h-1-8", "7a"],
      ["ex1-h-1-16", "7a"],
      ["ex2", "7a"],
      ["example-modified", "7b"],
      ["example-heun", "7c"],
    ]);
    for (const p of lab7.presets) {
      const label = p.id.startsWith("ex1") ? /^Ex\. 1: / : p.id === "ex2" ? /^Ex\. 2: / : null;
      expect(en[p.labelKey]).toMatch(label ?? /^Numerical example: /);
      expect(ro[p.labelKey]).toMatch(label ?? /^Exemplu numeric: /);
    }
  });

  it("gives ex. 1 the lab's problem with h = 1/4, 1/8 and 1/16, and its exact solution", () => {
    expect(["ex1-h-1-4", "ex1-h-1-8", "ex1-h-1-16"].map((id) => preset(id).values)).toEqual(
      [16, 32, 64].map((n) => ({
        x0: "0",
        y0: "1",
        T: "4",
        n: String(n),
        f: "x^2 - y",
        exact: "x^2 - 2x + 2 - e^(-x)",
      })),
    );
  });

  it("gives ex. 2 and the numerical example y′ = y + x on [0, 1], h = 0.1, with y = 2eˣ − x − 1", () => {
    const values = { x0: "0", y0: "1", T: "1", n: "10", f: "y + x", exact: "2 e^x - x - 1" };
    for (const id of ["ex2", "example-modified", "example-heun"]) {
      expect(preset(id).values).toEqual(values);
    }
  });

  it("writes each tag with the step as a fraction, so it reads the same in both languages", () => {
    expect(preset("ex1-h-1-8").tex).toBe("h = \\frac{1}{8},\\ n = 32");
    expect(preset("ex2").tex).toBe("h = \\frac{1}{10},\\ n = 10");
  });

  it("opens 7a on ex. 1 with h = 1/4 and 7b, 7c on the numerical example", () => {
    expect(initialLabState(lab7).presetIds).toEqual({
      "7a": "ex1-h-1-4",
      "7b": "example-modified",
      "7c": "example-heun",
    });
  });
});

describe("Lab 7 runs", () => {
  it.each(lab7.presets.map((p) => [p.id, p] as const))(
    "preset %s, picked on its method's tab, fills the form, which then runs at every node",
    (_id, p) => {
      const onTab = labReducer(initialLabState(lab7), { type: "select", methodId: p.methodId });
      const state = labReducer(onTab, { type: "preset", preset: p });
      expect(state.presetIds[p.methodId]).toBe(p.id);
      const prepared = method(p.methodId).prepare(state.values[p.methodId]);
      if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
      const view = cauchyView(toRunView(prepared.prepared));
      expect(view.result.status).toBe("completed");
      expect(view.result.rows).toHaveLength(Number(p.values.n) + 1);
      expect(view.exact).toBeDefined();
    },
  );

  it.each([
    ["7a", "ex1-h-1-4", 9.7424831, 0.2392],
    ["7a", "ex1-h-1-8", 9.8628026, 0.1189],
    ["7a", "ex1-h-1-16", 9.9224293, 0.0593],
    ["7a", "ex2", 3.1874849, 0.2490788],
    ["7b", "example-modified", 3.4281617, 0.008402],
    ["7c", "example-heun", 3.4281617, 0.008402],
  ])("%s %s gives yₙ = %f, error %f at x₀ + T", (methodId, id, yn, error) => {
    const run = prepare(methodId, preset(id).values);
    const r = run.run();
    expect(r.result).toBeCloseTo(yn, 6);
    const end = r.rows[r.n].x;
    expect(Math.abs((run.exact?.(end) ?? Number.NaN) - (r.result ?? 0))).toBeCloseTo(error, 4);
  });

  it("has no exact solution when its field is blank", () => {
    const run = prepare("7a", { ...preset("ex2").values, exact: "  " });
    expect(run.exact).toBeUndefined();
    expect(run.run().result).toBeCloseTo(3.1874849, 7);
  });

  it("takes one step for n = 1", () => {
    expect(prepare("7a", { ...preset("ex2").values, n: "1" }).run().result).toBe(2);
  });

  it("stops with undefined-value from node 0 for f = √(y − 2)", () => {
    const r = prepare("7a", { ...preset("ex2").values, f: "sqrt(y - 2)" }).run();
    expect(r.error).toEqual({ code: "undefined-value", i: 0, x: 0, y: 1 });
    expect(r.rows).toHaveLength(1);
  });

  it("diverges at i = 9 for f = y² on [0, 10] with n = 10", () => {
    const r = prepare("7a", { ...preset("ex2").values, f: "y^2", T: "10" }).run();
    expect(r.error?.code).toBe("diverged");
    expect(r.error?.i).toBe(9);
    expect(r.rows).toHaveLength(10);
  });
});

describe("Lab 7 validation", () => {
  const errorsFor = (methodId: string, patch: FieldValues) => {
    const m = method(methodId);
    const prepared = m.prepare({ ...m.defaults, ...patch });
    return prepared.ok ? {} : prepared.errors;
  };

  it.each([
    ["7a", { f: "x + z" }, "f", "field.error.unknown-symbol"],
    ["7b", { f: "" }, "f", "field.error.empty"],
    ["7a", { T: "0" }, "T", "field.error.positive-max"],
    ["7c", { T: "2e6" }, "T", "field.error.positive-max"],
    ["7a", { n: "2.5" }, "n", "field.error.integer-range"],
    ["7b", { n: "20000" }, "n", "field.error.integer-range"],
    ["7a", { n: "0" }, "n", "field.error.integer-range"],
    ["7a", { x0: "2e6" }, "x0", "field.error.range"],
    ["7c", { y0: "-2e6" }, "y0", "field.error.range"],
    ["7a", { exact: "x + y" }, "exact", "field.error.unknown-symbol"],
    ["7a", { exact: "x +" }, "exact", "field.error.syntax"],
  ])("%s %j → %s: %s", (methodId, patch, field, key) => {
    expect(errorsFor(methodId, patch)[field]?.key).toBe(key);
  });

  it("accepts n = 10 000, the largest number of steps", () => {
    expect(errorsFor("7a", { n: "10000" })).toEqual({});
  });

  it("asks for the lab's inputs x₀, y₀, T, n, f, then the optional exact solution", () => {
    for (const m of lab7.methods) {
      expect(m.fields.map((f) => f.id)).toEqual(["x0", "y0", "T", "n", "f", "exact"]);
      const [f, exact] = m.fields.slice(4);
      expect(f.kind === "expression" && f.variables).toEqual(["x", "y"]);
      expect(exact.kind === "expression" && exact.variables).toEqual(["x"]);
      expect(exact.kind === "expression" && exact.optional).toBe(true);
      expect(m.fields.some((field) => field.id === "eps" || field.id === "maxIter")).toBe(false);
    }
  });
});

describe("Lab 7 comparisons", () => {
  it("are ex. 1 and then the numerical example, both node by node", () => {
    expect(lab7.comparisons.map((c) => [c.id, c.kind])).toEqual([
      ["ex1", "nodes"],
      ["example", "nodes"],
    ]);
    expect(comparison("ex1").rows).toEqual([
      { methodId: "7a", presetId: "ex1-h-1-4" },
      { methodId: "7a", presetId: "ex1-h-1-8" },
      { methodId: "7a", presetId: "ex1-h-1-16" },
    ]);
    expect(comparison("example").rows).toEqual([
      { methodId: "7a", presetId: "ex2" },
      { methodId: "7b", presetId: "example-modified" },
      { methodId: "7c", presetId: "example-heun" },
    ]);
  });

  it("ex. 1 ends at x = 4 with errors 0.2392, 0.1189 and 0.0593", () => {
    const cells = runNodeComparison(lab7, comparison("ex1"));
    expect(cells.map((cell) => cell?.result.n)).toEqual([16, 32, 64]);
    const errors = cells.map((cell) => {
      if (!cell?.exact) throw new Error("no exact solution");
      const last = cell.result.rows[cell.result.n];
      expect(last.x).toBe(4);
      return Math.abs(cell.exact(4) - last.y);
    });
    expect(errors[0]).toBeCloseTo(0.2392, 4);
    expect(errors[1]).toBeCloseTo(0.1189, 4);
    expect(errors[2]).toBeCloseTo(0.0593, 4);
  });

  it("the numerical example runs all three methods with n = 10; 7b and 7c agree", () => {
    const [eulerCell, modified, heun] = runNodeComparison(lab7, comparison("example"));
    expect(eulerCell?.result.result).toBeCloseTo(3.1874849, 7);
    modified?.result.rows.forEach((row, i) => {
      expect(heun?.result.rows[i].y).toBeCloseTo(row.y, 12);
    });
  });

  it("lists each row's inputs, with x₀ and y₀ as one point and the exact solution last", () => {
    const inputs = comparisonInputs(method("7a"), preset("ex1-h-1-4").values, ";");
    expect(inputs.map((input) => (input.kind === "tex" ? input.tex : ""))).toEqual([
      "(x_0;\\ y_0) = (0;\\ 1)",
      "T = 4",
      "n = 16",
      "f(x, y) = { x}^{2}- y",
      expect.stringMatching(/^y\(x\) = /),
    ]);
  });

  it("leaves a blank exact solution out of the inputs", () => {
    const inputs = comparisonInputs(method("7a"), { ...preset("ex2").values, exact: "" });
    expect(inputs.some((input) => input.kind === "tex" && input.tex.startsWith("y(x)"))).toBe(
      false,
    );
  });
});
