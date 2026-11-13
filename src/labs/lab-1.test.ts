import { describe, expect, it } from "vitest";
import { runComparison } from "./compare";
import { deriveField } from "./fields";
import { lab1 } from "./lab-1";
import { findReadyLab, labs } from "./registry";
import type { FieldValues, NumberField, ExpressionField } from "./types";

const method = (id: string) => {
  const m = lab1.methods.find((x) => x.id === id);
  if (!m) throw new Error(id);
  return m;
};
const preset = (id: string) => {
  const p = lab1.presets.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p;
};

describe("registry", () => {
  it("lists all 13 labs, only Lab 1 ready, at /labs/newton", () => {
    expect(labs.map((l) => l.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(labs.filter((l) => l.status === "ready").map((l) => l.slug)).toEqual(["newton"]);
    expect(findReadyLab("newton")).toBe(lab1);
    expect(findReadyLab("euler")).toBeUndefined();
    expect(new Set(labs.map((l) => l.slug)).size).toBe(13);
  });
});

describe("Lab 1 presets", () => {
  it.each(lab1.presets.map((p) => [p.id, p] as const))("%s validates and runs", (_, p) => {
    const prepared = method(p.methodId).prepare(p.values);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const result = prepared.prepared.run();
    if (p.id === "ex2-rule-r0") {
      expect(result.error?.code).toBe("zero-derivative");
    } else {
      expect(result.status).toBe("converged");
    }
  });

  it("Kepler preset starts at 3π/8 and converges to ≈ 1.17122", () => {
    const prepared = method("1a").prepare(preset("kepler").values);
    if (!prepared.ok) throw new Error("invalid");
    const r = prepared.prepared.run();
    expect(r.iterations[0].x).toBeCloseTo((3 * Math.PI) / 8, 15);
    expect(r.result).toBeCloseTo(1.171229652501666, 4);
  });
});

describe("Lab 1 plots", () => {
  it("1b plots f(x) = xᵏ − c", () => {
    const prepared = method("1b").prepare({ c: "2", k: "3", eps: "1e-4", maxIter: "1000" });
    if (!prepared.ok) throw new Error("invalid");
    const plot = prepared.prepared.plot;
    expect(plot?.kind).toBe("tangent");
    if (plot?.kind !== "tangent") return;
    expect(plot.f(2)).toBe(6);
    expect(plot.f(1.5)).toBeCloseTo(1.5 ** 3 - 2, 15);
    expect(plot.interval).toBeUndefined();
  });
});

describe("Lab 1 comparisons", () => {
  const n = (id: string) => {
    const comparison = lab1.comparisons.find((c) => c.id === id);
    if (!comparison) throw new Error(id);
    return runComparison(lab1, comparison).map((row) => row.map((cell) => cell?.n ?? null));
  };

  it("matches the locked iteration counts", () => {
    expect(n("ex1")).toEqual([[5, 6, 7]]);
    expect(n("ex2")).toEqual([
      [0, 0, 0],
      [2, 3, 4],
    ]);
    expect(n("kepler")).toEqual([[2], [5]]);
    expect(n("sqrt")).toEqual([
      [4, 5, 6],
      [6, 12, 17],
      [4, 5, 6],
      [9, 16, 23],
      [5, 6, 6],
      [12, 22, 31],
    ]);
  });

  it("gives a null cell for a row that names an unknown method or preset", () => {
    const comparison = {
      id: "broken",
      titleKey: "lab1.compare.ex1",
      taskKey: "lab1.compare.ex1.task",
      eps: [1e-4, 1e-8],
      rows: [
        { methodId: "nope", presetId: "ex1" },
        { methodId: "1a", presetId: "nope" },
        { methodId: "1a", presetId: "ex1" },
      ],
    } as const;
    const cells = runComparison(lab1, comparison);
    expect(cells[0]).toEqual([null, null]);
    expect(cells[1]).toEqual([null, null]);
    expect(cells[2].map((cell) => cell?.n)).toEqual([5, 6]);
  });

  it("gives a null cell when a preset fails validation", () => {
    // ε is replaced per column, so the broken field is f.
    const broken = { ...preset("ex1"), values: { ...preset("ex1").values, f: "x +" } };
    const lab = { ...lab1, presets: [broken] };
    expect(runComparison(lab, lab1.comparisons[0])).toEqual([[null, null, null]]);
  });

  it("lists exactly the comparisons the lab asks for, in order", () => {
    expect(lab1.comparisons.map((c) => c.id)).toEqual(["ex1", "ex2", "kepler", "sqrt"]);
  });
});

describe("Lab 1 validation", () => {
  const errorsFor = (methodId: string, patch: FieldValues) => {
    const m = method(methodId);
    const prepared = m.prepare({ ...m.defaults, ...patch });
    return prepared.ok ? {} : prepared.errors;
  };

  it.each([
    ["1a", { f: "x^ +" }, "f", "field.error.syntax"],
    ["1a", { f: "y*x" }, "f", "field.error.unknown-symbol"],
    ["1a", { df: "x = 2" }, "df", "field.error.forbidden"],
    ["1a", { eps: "0" }, "eps", "field.error.positive"],
    ["1a", { a: "2", b: "2" }, "b", "field.error.greater-than"],
    ["1a", { a: "3", b: "2" }, "b", "field.error.greater-than"],
    ["1a", { maxIter: "2.5" }, "maxIter", "field.error.integer-range"],
    ["1a", { maxIter: "0" }, "maxIter", "field.error.integer-range"],
    ["1c", { maxIter: "100001" }, "maxIter", "field.error.integer-range"],
    ["1a", { x0Mode: "manual", x0: "" }, "x0", "field.error.empty"],
    ["1b", { k: "1.5" }, "k", "field.error.integer-min"],
    ["1b", { c: "-2" }, "c", "field.error.positive"],
    ["1c", { phi: "x = 2" }, "phi", "field.error.forbidden"],
    ["1c", { x0: "1/0" }, "x0", "field.error.not-finite"],
  ])("%s %j → %s: %s", (methodId, patch, field, key) => {
    expect(errorsFor(methodId, patch)[field]?.key).toBe(key);
  });

  it("accepts constant expressions in number fields", () => {
    expect(errorsFor("1c", { x0: "3*pi/8", eps: "1e-4" })).toEqual({});
  });

  it("ignores hidden fields (x₀ under rule R0, dda in manual mode)", () => {
    expect(errorsFor("1a", { x0Mode: "r0", x0: "nonsense" })).toEqual({});
    expect(errorsFor("1a", { x0Mode: "manual", x0: "0", dda: "" })).toEqual({});
  });

  it("derives f′ and dda = f″(a) from f", () => {
    const m = method("1a");
    const df = m.fields.find((f) => f.id === "df") as ExpressionField;
    const dda = m.fields.find((f) => f.id === "dda") as NumberField;
    const values = { ...m.defaults, f: "x^3 - x - 1", a: "1" };
    const d1 = deriveField(df, m.fields, values);
    expect(d1.ok && d1.value).toBe("3 * x ^ 2 - 1");
    expect(deriveField(dda, m.fields, values)).toEqual({ ok: true, value: "6" });
    expect(deriveField(dda, m.fields, { ...values, f: "x^5 - 5x + 1", a: "-1" })).toEqual({
      ok: true,
      value: "-20",
    });
    expect(deriveField(df, m.fields, { ...values, f: "x +" })).toEqual({
      ok: false,
      issue: { key: "field.error.derive-failed" },
    });
    // f″ = −1/(4·√x³) is not finite at a = 0.
    expect(deriveField(dda, m.fields, { ...values, f: "sqrt(x)", a: "0" })).toEqual({
      ok: false,
      issue: { key: "field.error.derive-undefined" },
    });
  });
});

describe("Lab 1 formulas", () => {
  const formulas = lab1.methods.flatMap((m) => m.explanation.filter((b) => b.kind === "formula"));

  it("never hard-code words inside \\text{…}: every word is a translated ⟪placeholder⟫", () => {
    for (const block of formulas) {
      for (const [, inner] of block.tex.matchAll(/\\text\{([^}]*)\}/g)) {
        expect(inner).toMatch(/^⟪\w+⟫$/);
      }
    }
  });

  it("declares a translation key for every placeholder", () => {
    for (const block of formulas) {
      for (const [, name] of block.tex.matchAll(/⟪(\w+)⟫/g)) {
        expect(block.words?.[name]).toBeDefined();
      }
    }
  });
});

describe("Lab 1 exact solutions (CAP-5)", () => {
  const prepare = (id: string, values: Record<string, string>) => {
    const m = lab1.methods.find((x) => x.id === id);
    if (!m) throw new Error(id);
    const prepared = m.prepare({ ...m.defaults, ...values });
    if (!prepared.ok) throw new Error("invalid");
    return prepared.prepared;
  };

  it("gives the k-th root its exact value ᵏ√c, named in TeX", () => {
    expect(prepare("1b", { c: "2", k: "2" }).exact).toEqual({
      value: Math.SQRT2,
      tex: "\\sqrt{2}",
    });
    const cbrt = prepare("1b", { c: "12", k: "3" }).exact;
    expect(cbrt?.tex).toBe("\\sqrt[3]{12}");
    expect(cbrt?.value).toBeCloseTo(Math.cbrt(12), 15);
  });

  it("claims no exact value where none is known (Newton, successive approximations)", () => {
    expect(prepare("1a", {}).exact).toBeUndefined();
    expect(prepare("1c", {}).exact).toBeUndefined();
  });
});
