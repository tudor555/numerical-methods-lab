import { combinedTangent } from "@/lib/methods/lab4/combined-tangent";
import { thirdOrderRoot } from "@/lib/methods/lab4/third-order-root";
import { exampleBase, kthRootPreset, newtonPreset } from "./comparison-presets";
import { parseFields } from "./fields";
import { kthRootMethod, newtonMethod } from "./lab-1";
import {
  checkInterval,
  derivativeField,
  epsField,
  EPS_SET,
  functionField,
  intervalFields,
  maxIterField,
  radicandRule,
  valueRule,
} from "./shared-fields";
import type { MethodDefinition, Preset, ReadyLab } from "./types";

const combinedTangentMethod: MethodDefinition = {
  id: "4a",
  tabKey: "lab4.method.combinedTangent.tab",
  titleKey: "lab4.method.combinedTangent.title",
  nameKey: "lab4.method.combinedTangent.name",
  explanation: [
    { kind: "text", key: "lab4.method.combinedTangent.idea" },
    {
      kind: "formula",
      tex: "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)} - \\frac{f\\!\\left(x_n - \\frac{f(x_n)}{f'(x_n)}\\right)}{f'(x_n)}, \\qquad n = 0, 1, 2, \\dots",
    },
    { kind: "text", key: "lab4.method.combinedTangent.start" },
    { kind: "text", key: "common.stopping" },
    { kind: "text", key: "lab4.method.combinedTangent.failure" },
    { kind: "text", key: "lab4.method.combinedTangent.chart" },
  ],
  fields: [
    functionField,
    derivativeField,
    ...intervalFields,
    { id: "x0", kind: "number", symbol: "x_0", labelKey: "field.x0", rule: valueRule },
    epsField,
    maxIterField,
  ],
  valueColumn: "f(x_n)",
  defaults: { f: "x^2 - 2", df: "2x", ...exampleBase, x0: "2" },
  prepare(values) {
    const parsed = parseFields(combinedTangentMethod.fields, values);
    checkInterval(parsed);
    const { numbers, functions, errors } = parsed;
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { f, df } = functions;
    const { a, b, x0, eps, maxIter } = numbers;
    return {
      ok: true,
      prepared: {
        eps,
        run: () => combinedTangent({ f, df, x0, eps, maxIter }),
        plot: { kind: "combined-tangent", f, df, interval: [a, b] },
      },
    };
  },
};

const thirdOrderRootMethod: MethodDefinition = {
  id: "4b",
  tabKey: "lab4.method.thirdOrderRoot.tab",
  titleKey: "lab4.method.thirdOrderRoot.title",
  nameKey: "lab4.method.thirdOrderRoot.name",
  explanation: [
    { kind: "text", key: "lab4.method.thirdOrderRoot.idea" },
    {
      kind: "formula",
      tex: "x_{n+1} = \\frac{x_n\\left(x_n^2 + 3a\\right)}{3x_n^2 + a}, \\qquad n = 0, 1, 2, \\dots",
    },
    { kind: "text", key: "lab4.method.thirdOrderRoot.start" },
    { kind: "text", key: "common.stopping" },
    { kind: "text", key: "lab4.method.thirdOrderRoot.chart" },
  ],
  fields: [
    {
      id: "a",
      kind: "number",
      symbol: "a",
      labelKey: "field.c",
      rule: radicandRule,
    },
    epsField,
    maxIterField,
  ],
  valueColumn: "x_n^2 - a",
  defaults: { a: "2", eps: exampleBase.eps, maxIter: exampleBase.maxIter },
  prepare(values) {
    const { numbers, errors } = parseFields(thirdOrderRootMethod.fields, values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { a, eps, maxIter } = numbers;
    return {
      ok: true,
      prepared: {
        eps,
        run: () => thirdOrderRoot({ a, eps, maxIter }),
        // The iteration is Halley's method on x² − a, so its steps follow Halley's tangent
        // hyperbolas. No interval: the range comes from the iterates, as for 1b.
        plot: { kind: "halley", f: (x) => x * x - a, df: (x) => 2 * x, ddf: () => 2 },
        exact: { value: Math.sqrt(a), tex: `\\sqrt{${a}}` },
      },
    };
  },
};

const rootPreset = (id: string, labelKey: Preset["labelKey"], a: number): Preset => ({
  id,
  methodId: "4b",
  labelKey,
  tex: `\\sqrt{${a}}`,
  values: { ...thirdOrderRootMethod.defaults, a: String(a) },
});

const presets: readonly Preset[] = [
  {
    id: "combined-ex1",
    methodId: "4a",
    labelKey: "lab4.preset.combinedEx1",
    tex: "x^2 - 2,\\ x_0 = 2",
    values: { ...combinedTangentMethod.defaults },
  },
  {
    id: "combined-ex2",
    methodId: "4a",
    labelKey: "lab4.preset.combinedEx2",
    tex: "x^3 - x - 1,\\ x_0 = 2",
    values: { f: "x^3 - x - 1", df: "3x^2 - 1", ...exampleBase, x0: "2" },
  },
  rootPreset("root-ex1", "lab4.preset.rootEx1", 2),
  // The lab's ex. 2 asks for √5 with a = 3. The method converges to √a, so both are offered.
  rootPreset("root-ex2-sqrt3", "lab4.preset.rootEx2Sqrt3", 3),
  rootPreset("root-ex2-sqrt5", "lab4.preset.rootEx2Sqrt5", 5),
];

export const lab4: ReadyLab = {
  number: 4,
  slug: "third-order",
  status: "ready",
  titleKey: "lab4.title",
  topicKey: "lab4.topic",
  introKey: "lab4.intro",
  methods: [combinedTangentMethod, thirdOrderRootMethod],
  presets,
  comparisons: [
    {
      id: "combined-ex1",
      titleKey: "lab4.compare.combinedEx1",
      taskKey: "lab4.compare.combinedEx1.task",
      eps: EPS_SET,
      rows: [
        { methodId: "4a", presetId: "combined-ex1" },
        { methodId: "1a", presetId: "combined-ex1-newton" },
      ],
    },
    {
      id: "combined-ex2",
      titleKey: "lab4.compare.combinedEx2",
      taskKey: "lab4.compare.combinedEx2.task",
      eps: EPS_SET,
      rows: [
        { methodId: "4a", presetId: "combined-ex2" },
        { methodId: "1a", presetId: "combined-ex2-newton" },
      ],
    },
    {
      id: "root-ex1",
      titleKey: "lab4.compare.rootEx1",
      taskKey: "lab4.compare.rootEx1.task",
      eps: EPS_SET,
      rows: [
        { methodId: "4b", presetId: "root-ex1" },
        { methodId: "1b", presetId: "root-ex1-kth-root" },
      ],
    },
    {
      id: "root-ex2-sqrt3",
      titleKey: "lab4.compare.rootEx2Sqrt3",
      taskKey: "lab4.compare.rootEx2Sqrt3.task",
      eps: EPS_SET,
      rows: [
        { methodId: "4b", presetId: "root-ex2-sqrt3" },
        { methodId: "1b", presetId: "root-ex2-sqrt3-kth-root" },
      ],
    },
    {
      id: "root-ex2-sqrt5",
      titleKey: "lab4.compare.rootEx2Sqrt5",
      taskKey: "lab4.compare.rootEx2Sqrt5.task",
      eps: EPS_SET,
      rows: [
        { methodId: "4b", presetId: "root-ex2-sqrt5" },
        { methodId: "1b", presetId: "root-ex2-sqrt5-kth-root" },
      ],
    },
  ],
  comparisonOnly: {
    methods: [newtonMethod, kthRootMethod],
    presets: [
      newtonPreset("combined-ex1-newton", "x^2 - 2", "2x"),
      newtonPreset("combined-ex2-newton", "x^3 - x - 1", "3x^2 - 1"),
      kthRootPreset("root-ex1-kth-root", 2),
      kthRootPreset("root-ex2-sqrt3-kth-root", 3),
      kthRootPreset("root-ex2-sqrt5-kth-root", 5),
    ],
  },
};
