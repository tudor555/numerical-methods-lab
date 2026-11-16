import { chebyshev } from "@/lib/methods/lab3/chebyshev";
import { halley } from "@/lib/methods/lab3/halley";
import { parseFields } from "./fields";
import { newtonMethod } from "./lab-1";
import {
  checkInterval,
  derivativeField,
  epsField,
  EPS_SET,
  functionField,
  intervalFields,
  manualX0Field,
  maxIterField,
  ruleR0Formula,
  secondDerivativeField,
  valueRule,
  x0ModeField,
} from "./shared-fields";
import type { ComparisonPreset, MethodDefinition, Preset, ReadyLab } from "./types";

const halleyMethod: MethodDefinition = {
  id: "3a",
  tabKey: "lab3.method.halley.tab",
  titleKey: "lab3.method.halley.title",
  nameKey: "lab3.method.halley.name",
  explanation: [
    { kind: "text", key: "lab3.method.halley.idea" },
    {
      kind: "formula",
      tex: "x_{n+1} = x_n - \\frac{2\\,f(x_n)\\,f'(x_n)}{2\\,f'(x_n)^2 - f(x_n)\\,f''(x_n)}, \\qquad n = 0, 1, 2, \\dots",
    },
    { kind: "text", key: "lab3.method.halley.start" },
    ruleR0Formula,
    { kind: "text", key: "common.stopping" },
    { kind: "text", key: "lab3.method.halley.failure" },
    { kind: "text", key: "lab3.method.halley.chart" },
  ],
  fields: [
    functionField,
    derivativeField,
    secondDerivativeField,
    ...intervalFields,
    x0ModeField,
    manualX0Field,
    epsField,
    maxIterField,
  ],
  valueColumn: "f(x_n)",
  // Ex. 1 gives x₀ = 2 directly; rule R0 (which also picks 2) is one click away.
  defaults: {
    f: "x^2 - 2",
    df: "2x",
    ddf: "2",
    a: "1",
    b: "2",
    x0Mode: "manual",
    x0: "2",
    eps: "1e-4",
    maxIter: "1000",
  },
  prepare(values) {
    const parsed = parseFields(halleyMethod.fields, values);
    checkInterval(parsed);
    const { numbers, functions, choices, errors } = parsed;
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { f, df, ddf } = functions;
    const { a, b, eps, maxIter } = numbers;
    const start =
      choices.x0Mode === "manual"
        ? ({ mode: "manual", x0: numbers.x0 } as const)
        : ({ mode: "r0" } as const);
    return {
      ok: true,
      prepared: {
        eps,
        run: () => halley({ f, df, ddf, a, b, start, eps, maxIter }),
        plot: { kind: "halley", f, df, ddf, interval: [a, b] },
      },
    };
  },
  errorKeys: { "zero-denominator": "lab3.method.halley.error.zero-denominator" },
};

const chebyshevMethod: MethodDefinition = {
  id: "3b",
  tabKey: "lab3.method.chebyshev.tab",
  titleKey: "lab3.method.chebyshev.title",
  nameKey: "lab3.method.chebyshev.name",
  explanation: [
    { kind: "text", key: "lab3.method.chebyshev.idea" },
    {
      kind: "formula",
      tex: "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)} - \\frac{f(x_n)^2\\,f''(x_n)}{2\\,f'(x_n)^3}, \\qquad n = 0, 1, 2, \\dots",
    },
    { kind: "text", key: "lab3.method.chebyshev.start" },
    { kind: "text", key: "common.stopping" },
    { kind: "text", key: "lab3.method.chebyshev.failure" },
    { kind: "text", key: "lab3.method.chebyshev.chart" },
  ],
  fields: [
    functionField,
    derivativeField,
    secondDerivativeField,
    ...intervalFields,
    { id: "x0", kind: "number", symbol: "x_0", labelKey: "field.x0", rule: valueRule },
    epsField,
    maxIterField,
  ],
  valueColumn: "f(x_n)",
  defaults: {
    f: "x^3 - x - 1",
    df: "3x^2 - 1",
    ddf: "6x",
    a: "1",
    b: "2",
    x0: "2",
    eps: "1e-4",
    maxIter: "1000",
  },
  prepare(values) {
    const parsed = parseFields(chebyshevMethod.fields, values);
    checkInterval(parsed);
    const { numbers, functions, errors } = parsed;
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { f, df, ddf } = functions;
    const { a, b, x0, eps, maxIter } = numbers;
    return {
      ok: true,
      prepared: {
        eps,
        run: () => chebyshev({ f, df, ddf, x0, eps, maxIter }),
        plot: { kind: "chebyshev", f, df, ddf, interval: [a, b] },
      },
    };
  },
};

const base = { a: "1", b: "2", eps: "1e-4", maxIter: "1000" };
const ex2 = { f: "x^3 - x - 1", df: "3x^2 - 1", ddf: "6x", ...base };

const presets: readonly Preset[] = [
  {
    id: "ex1",
    methodId: "3a",
    labelKey: "lab3.preset.ex1",
    tex: "x^2 - 2,\\ x_0 = 2",
    values: { ...halleyMethod.defaults },
  },
  {
    id: "ex2",
    methodId: "3a",
    labelKey: "lab3.preset.ex2",
    tex: "x^3 - x - 1,\\ x_0 = 2",
    values: { ...ex2, x0Mode: "manual", x0: "2" },
  },
  {
    id: "chebyshev",
    methodId: "3b",
    labelKey: "lab3.preset.chebyshev",
    tex: "x^3 - x - 1,\\ x_0 = 2",
    values: { ...chebyshevMethod.defaults },
  },
];

/** Newton's inputs for one comparison: the example's own f and f′ as the lab gives them, x₀ = 2. */
function newtonPreset(id: string, f: string, df: string): ComparisonPreset {
  return {
    id,
    methodId: newtonMethod.id,
    tex: `${f},\\ x_0 = 2`,
    values: { f, df, x0Mode: "manual", dda: "", x0: "2", ...base },
  };
}

export const lab3: ReadyLab = {
  number: 3,
  slug: "halley-chebyshev",
  status: "ready",
  titleKey: "lab3.title",
  topicKey: "lab3.topic",
  introKey: "lab3.intro",
  methods: [halleyMethod, chebyshevMethod],
  presets,
  comparisons: [
    {
      id: "ex1",
      titleKey: "lab3.compare.ex1",
      taskKey: "lab3.compare.ex1.task",
      eps: EPS_SET,
      rows: [
        { methodId: "3a", presetId: "ex1" },
        { methodId: "1a", presetId: "ex1-newton" },
      ],
    },
    {
      id: "ex2",
      titleKey: "lab3.compare.ex2",
      taskKey: "lab3.compare.ex2.task",
      eps: EPS_SET,
      rows: [
        { methodId: "3a", presetId: "ex2" },
        { methodId: "1a", presetId: "ex2-newton" },
      ],
    },
    {
      id: "chebyshev",
      titleKey: "lab3.compare.chebyshev",
      taskKey: "lab3.compare.chebyshev.task",
      eps: EPS_SET,
      rows: [
        { methodId: "3b", presetId: "chebyshev" },
        { methodId: "1a", presetId: "chebyshev-newton" },
      ],
    },
  ],
  comparisonOnly: {
    methods: [newtonMethod],
    presets: [
      newtonPreset("ex1-newton", "x^2 - 2", "2x"),
      newtonPreset("ex2-newton", "x^3 - x - 1", "3x^2 - 1"),
      newtonPreset("chebyshev-newton", "x^3 - x - 1", "3x^2 - 1"),
    ],
  },
};
