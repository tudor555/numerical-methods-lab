import { secant } from "@/lib/methods/lab2/secant";
import { steffensen } from "@/lib/methods/lab2/steffensen";
import { deriveField, parseFields } from "./fields";
import { newtonMethod } from "./lab-1";
import {
  checkInterval,
  ddaField,
  epsField,
  functionField,
  intervalFields,
  maxIterField,
  ruleR0Formula,
  valueRule,
} from "./shared-fields";
import type { ComparisonPreset, FieldValues, MethodDefinition, Preset, ReadyLab } from "./types";

const secantMethod: MethodDefinition = {
  id: "2a",
  tabKey: "lab2.method.secant.tab",
  titleKey: "lab2.method.secant.title",
  nameKey: "lab2.method.secant.name",
  explanation: [
    { kind: "text", key: "lab2.method.secant.idea" },
    {
      kind: "formula",
      tex: "x_{n+1} = x_n - \\frac{f(x_n)\\,(x_n - x_{n-1})}{f(x_n) - f(x_{n-1})}, \\qquad n = 1, 2, 3, \\dots",
    },
    { kind: "text", key: "lab2.method.secant.start" },
    { kind: "text", key: "lab2.method.secant.stopping" },
    { kind: "text", key: "lab2.method.secant.failure" },
  ],
  fields: [
    functionField,
    ...intervalFields,
    { id: "x0", kind: "number", symbol: "x_0", labelKey: "field.x0", rule: valueRule },
    { id: "x1", kind: "number", symbol: "x_1", labelKey: "field.x1", rule: valueRule },
    epsField,
    maxIterField,
  ],
  valueColumn: "f(x_n)",
  defaults: {
    f: "x^2 - 2",
    a: "1",
    b: "2",
    x0: "2",
    x1: "1.4",
    eps: "1e-4",
    maxIter: "1000",
  },
  prepare(values) {
    const parsed = parseFields(secantMethod.fields, values);
    checkInterval(parsed);
    const { numbers, functions, errors } = parsed;
    // x₁ = x₀ would make the first chord 0/0.
    if (numbers.x0 !== undefined && numbers.x1 !== undefined && numbers.x0 === numbers.x1) {
      errors.x1 = { key: "field.error.different-from", params: { other: "x₀" } };
    }
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { f } = functions;
    const { a, b, x0, x1, eps, maxIter } = numbers;
    return {
      ok: true,
      prepared: {
        eps,
        run: () => secant({ f, x0, x1, eps, maxIter }),
        plot: { kind: "secant", f, interval: [a, b] },
      },
    };
  },
};

const steffensenMethod: MethodDefinition = {
  id: "2b",
  tabKey: "lab2.method.steffensen.tab",
  titleKey: "lab2.method.steffensen.title",
  nameKey: "lab2.method.steffensen.name",
  explanation: [
    { kind: "text", key: "lab2.method.steffensen.idea" },
    {
      kind: "formula",
      tex: "x_{n+1} = x_n - \\frac{f(x_n)^2}{f\\big(x_n + f(x_n)\\big) - f(x_n)}, \\qquad n = 0, 1, 2, \\dots",
    },
    { kind: "text", key: "lab2.method.steffensen.start" },
    ruleR0Formula,
    { kind: "text", key: "common.stopping" },
    { kind: "text", key: "lab2.method.steffensen.failure" },
    { kind: "text", key: "lab2.method.steffensen.chart" },
  ],
  fields: [functionField, ...intervalFields, ddaField(), epsField, maxIterField],
  valueColumn: "f(x_n)",
  defaults: { f: "x^3 - x - 1", a: "1", b: "2", dda: "6", eps: "1e-4", maxIter: "1000" },
  prepare(values) {
    const parsed = parseFields(steffensenMethod.fields, values);
    checkInterval(parsed);
    const { numbers, functions, errors } = parsed;
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { f } = functions;
    const { a, b, dda, eps, maxIter } = numbers;
    return {
      ok: true,
      prepared: {
        eps,
        run: () => steffensen({ f, a, b, dda, eps, maxIter }),
        // The auxiliary point xₙ + f(xₙ) can sit far outside [a, b], so it is not drawn.
        plot: { kind: "steffensen", f, interval: [a, b] },
      },
    };
  },
};

const base = { a: "1", b: "2", eps: "1e-4", maxIter: "1000" };

const presets: readonly Preset[] = [
  {
    id: "ex1",
    methodId: "2a",
    labelKey: "lab2.preset.ex1",
    tex: "x^2 - 2,\\ x_0 = 2,\\ x_1 = 1.4",
    values: { ...secantMethod.defaults },
  },
  {
    id: "ex2",
    methodId: "2a",
    labelKey: "lab2.preset.ex2",
    tex: "x^3 - x - 1,\\ x_0 = 2,\\ x_1 = 1.5",
    values: { f: "x^3 - x - 1", x0: "2", x1: "1.5", ...base },
  },
  {
    id: "ex3",
    methodId: "2b",
    labelKey: "lab2.preset.ex3",
    tex: "x^3 - x - 1,\\ x_0 = 2\\ (\\mathrm{R0})",
    values: { ...steffensenMethod.defaults },
  },
];

/**
 * Newton's inputs for a comparison. The lab leaves them open, so they follow its examples: the
 * same f and [a, b], f′ and dda = f″(a) derived from f as "Derive from f" does, and rule R0.
 */
function newtonPreset(id: string, f: string, tex: string): ComparisonPreset {
  const values: FieldValues = { f, df: "", x0Mode: "r0", dda: "", x0: "", ...base };
  for (const fieldId of ["df", "dda"]) {
    const field = newtonMethod.fields.find((x) => x.id === fieldId);
    if (field?.kind === "choice" || !field) throw new Error(`Newton has no field ${fieldId}`);
    const derived = deriveField(field, newtonMethod.fields, values);
    if (!derived.ok) throw new Error(`Cannot derive ${fieldId} from ${f}`);
    values[fieldId] = derived.value;
  }
  return { id, methodId: newtonMethod.id, tex, values };
}

const EPS_SET = [1e-4, 1e-8, 1e-12] as const;

export const lab2: ReadyLab = {
  number: 2,
  slug: "secant-steffensen",
  status: "ready",
  titleKey: "lab2.title",
  topicKey: "lab2.topic",
  introKey: "lab2.intro",
  methods: [secantMethod, steffensenMethod],
  presets,
  comparisons: [
    {
      id: "ex1",
      titleKey: "lab2.compare.ex1",
      taskKey: "lab2.compare.ex1.task",
      eps: EPS_SET,
      rows: [
        { methodId: "2a", presetId: "ex1" },
        { methodId: "1a", presetId: "ex1-newton" },
      ],
    },
    {
      id: "ex2",
      titleKey: "lab2.compare.ex2",
      taskKey: "lab2.compare.ex2.task",
      eps: EPS_SET,
      rows: [
        { methodId: "2a", presetId: "ex2" },
        { methodId: "1a", presetId: "ex2-newton" },
      ],
    },
    {
      id: "ex3",
      titleKey: "lab2.compare.ex3",
      taskKey: "lab2.compare.ex3.task",
      eps: EPS_SET,
      rows: [
        { methodId: "2b", presetId: "ex3" },
        { methodId: "1a", presetId: "ex3-newton" },
      ],
    },
  ],
  comparisonOnly: {
    methods: [newtonMethod],
    presets: [
      newtonPreset("ex1-newton", "x^2 - 2", "x^2 - 2,\\ x_0 = 2\\ (\\mathrm{R0})"),
      newtonPreset("ex2-newton", "x^3 - x - 1", "x^3 - x - 1,\\ x_0 = 2\\ (\\mathrm{R0})"),
      newtonPreset("ex3-newton", "x^3 - x - 1", "x^3 - x - 1,\\ x_0 = 2\\ (\\mathrm{R0})"),
    ],
  },
};
