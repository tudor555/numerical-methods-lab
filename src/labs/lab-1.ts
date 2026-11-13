import { fixedPoint } from "@/lib/methods/lab1/fixed-point";
import { kthRoot } from "@/lib/methods/lab1/kth-root";
import { newton } from "@/lib/methods/lab1/newton";
import { parseFields } from "./fields";
import type { FieldDefinition, MethodDefinition, Preset, ReadyLab } from "./types";

const X = ["x"] as const;

const epsField: FieldDefinition = {
  id: "eps",
  kind: "number",
  symbol: "\\varepsilon",
  labelKey: "field.eps",
  rule: { positive: true },
};

const maxIterField: FieldDefinition = {
  id: "maxIter",
  kind: "number",
  symbol: "N_{\\max}",
  labelKey: "field.maxIter",
  // Runs are synchronous, so the cap bounds how long a run that never converges can block the page.
  rule: { integer: true, min: 1, max: 100000 },
};

const usesRuleR0 = (v: Record<string, string>) => v.x0Mode !== "manual";

const newtonMethod: MethodDefinition = {
  id: "1a",
  tabKey: "lab1.method.newton.tab",
  titleKey: "lab1.method.newton.title",
  nameKey: "lab1.method.newton.name",
  explanation: [
    { kind: "text", key: "lab1.method.newton.idea" },
    {
      kind: "formula",
      tex: "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}, \\qquad n = 0, 1, 2, \\dots",
    },
    { kind: "text", key: "lab1.method.newton.start" },
    {
      kind: "formula",
      tex: "x_0 = \\begin{cases} a, & \\text{⟪if⟫}\\ f(a)\\,f''(a) > 0 \\\\ b, & \\text{⟪if⟫}\\ f(a)\\,f''(a) \\le 0 \\end{cases}",
      words: { if: "math.if" },
    },
    { kind: "text", key: "common.stopping" },
    { kind: "text", key: "lab1.method.newton.failure" },
  ],
  fields: [
    { id: "f", kind: "expression", symbol: "f(x)", labelKey: "field.f", variables: X },
    {
      id: "df",
      kind: "expression",
      symbol: "f'(x)",
      labelKey: "field.df",
      variables: X,
      derive: { from: "f" },
    },
    { id: "a", kind: "number", symbol: "a", labelKey: "field.a" },
    { id: "b", kind: "number", symbol: "b", labelKey: "field.b" },
    {
      id: "x0Mode",
      kind: "choice",
      symbol: "x_0",
      labelKey: "field.x0Mode",
      options: [
        { value: "r0", labelKey: "field.x0Mode.r0" },
        { value: "manual", labelKey: "field.x0Mode.manual" },
      ],
    },
    {
      id: "dda",
      kind: "number",
      symbol: "\\mathrm{dda} = f''(a)",
      labelKey: "field.dda",
      visibleWhen: usesRuleR0,
      derive: { from: "f", order: 2, at: "a" },
    },
    {
      id: "x0",
      kind: "number",
      symbol: "x_0",
      labelKey: "field.x0",
      visibleWhen: (v) => !usesRuleR0(v),
    },
    epsField,
    maxIterField,
  ],
  valueColumn: "f(x_n)",
  defaults: {
    f: "x^3 - x - 1",
    df: "3x^2 - 1",
    a: "1",
    b: "2",
    x0Mode: "r0",
    dda: "6",
    x0: "",
    eps: "1e-4",
    maxIter: "1000",
  },
  prepare(values) {
    const fields = newtonMethod.fields;
    const { numbers, functions, choices, errors } = parseFields(fields, values);
    if (numbers.a !== undefined && numbers.b !== undefined && !(numbers.a < numbers.b)) {
      errors.b = { key: "field.error.greater-than", params: { other: "a" } };
    }
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { f, df } = functions;
    const { a, b, eps, maxIter } = numbers;
    const start =
      choices.x0Mode === "manual"
        ? ({ mode: "manual", x0: numbers.x0 } as const)
        : ({ mode: "r0", dda: numbers.dda } as const);
    return {
      ok: true,
      prepared: {
        eps,
        run: () => newton({ f, df, a, b, start, eps, maxIter }),
        plot: { kind: "tangent", f, interval: [a, b] },
      },
    };
  },
};

const kthRootMethod: MethodDefinition = {
  id: "1b",
  tabKey: "lab1.method.kthRoot.tab",
  titleKey: "lab1.method.kthRoot.title",
  nameKey: "lab1.method.kthRoot.name",
  explanation: [
    { kind: "text", key: "lab1.method.kthRoot.idea" },
    {
      kind: "formula",
      tex: "x_n = \\frac{1}{k}\\left[(k-1)\\,x_{n-1} + \\frac{c}{x_{n-1}^{\\,k-1}}\\right]",
    },
    { kind: "text", key: "lab1.method.kthRoot.start" },
    { kind: "text", key: "common.stopping" },
  ],
  fields: [
    { id: "c", kind: "number", symbol: "c", labelKey: "field.c", rule: { positive: true } },
    { id: "k", kind: "number", symbol: "k", labelKey: "field.k", rule: { integer: true, min: 2 } },
    epsField,
    maxIterField,
  ],
  valueColumn: "x_n^{\\,k} - c",
  defaults: { c: "2", k: "2", eps: "1e-4", maxIter: "1000" },
  prepare(values) {
    const { numbers, errors } = parseFields(kthRootMethod.fields, values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { c, k, eps, maxIter } = numbers;
    return {
      ok: true,
      prepared: {
        eps,
        run: () => kthRoot({ c, k, eps, maxIter }),
        plot: { kind: "tangent", f: (x) => x ** k - c },
        exact: { value: c ** (1 / k), tex: k === 2 ? `\\sqrt{${c}}` : `\\sqrt[${k}]{${c}}` },
      },
    };
  },
};

const fixedPointMethod: MethodDefinition = {
  id: "1c",
  tabKey: "lab1.method.fixedPoint.tab",
  titleKey: "lab1.method.fixedPoint.title",
  nameKey: "lab1.method.fixedPoint.name",
  explanation: [
    { kind: "text", key: "lab1.method.fixedPoint.idea" },
    { kind: "formula", tex: "x_{n+1} = \\varphi(x_n), \\qquad n = 0, 1, 2, \\dots" },
    { kind: "text", key: "lab1.method.fixedPoint.convergence" },
    { kind: "text", key: "common.stopping" },
  ],
  fields: [
    { id: "phi", kind: "expression", symbol: "\\varphi(x)", labelKey: "field.phi", variables: X },
    { id: "x0", kind: "number", symbol: "x_0", labelKey: "field.x0" },
    epsField,
    maxIterField,
  ],
  defaults: { phi: "sin(x) + 0.25", x0: "3*pi/8", eps: "1e-4", maxIter: "1000" },
  prepare(values) {
    const { numbers, functions, errors } = parseFields(fixedPointMethod.fields, values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { phi } = functions;
    const { x0, eps, maxIter } = numbers;
    return {
      ok: true,
      prepared: {
        eps,
        run: () => fixedPoint({ phi, x0, eps, maxIter }),
        plot: { kind: "cobweb", phi },
      },
    };
  },
};

const newtonBase = { eps: "1e-4", maxIter: "1000" };
const ex2 = { f: "x^5 - 5x + 1", df: "5x^4 - 5", a: "-1", b: "1", dda: "-20", ...newtonBase };
const sqrtPhi = (c: number) => `(x + ${c}) / (x + 1)`;

const presets: readonly Preset[] = [
  {
    id: "ex1",
    methodId: "1a",
    labelKey: "lab1.preset.ex1",
    tex: "x^3 - x - 1",
    values: { ...newtonMethod.defaults },
  },
  {
    id: "ex2-rule-r0",
    methodId: "1a",
    labelKey: "lab1.preset.ex2R0",
    tex: "x^5 - 5x + 1,\\ \\mathrm{R0}",
    values: { ...ex2, x0Mode: "r0", x0: "" },
  },
  {
    id: "ex2-manual-start",
    methodId: "1a",
    labelKey: "lab1.preset.ex2Manual",
    tex: "x^5 - 5x + 1,\\ x_0 = 0",
    values: { ...ex2, x0Mode: "manual", x0: "0" },
  },
  {
    id: "kepler",
    methodId: "1a",
    labelKey: "lab1.preset.kepler",
    tex: "x - \\sin x - 0.25",
    values: {
      f: "x - sin(x) - 0.25",
      df: "1 - cos(x)",
      a: "pi/4",
      b: "pi/2",
      x0Mode: "manual",
      dda: "sin(pi/4)",
      x0: "3*pi/8",
      ...newtonBase,
    },
  },
  ...([2, 3, 5] as const).map((c) => ({
    id: `sqrt${c}`,
    methodId: "1b",
    labelKey: `lab1.preset.sqrt${c}` as const,
    tex: `\\sqrt{${c}}`,
    values: { c: String(c), k: "2", ...newtonBase },
  })),
  ...([2, 3, 12] as const).map((c) => ({
    id: `cbrt${c}`,
    methodId: "1b",
    labelKey: `lab1.preset.cbrt${c}` as const,
    tex: `\\sqrt[3]{${c}}`,
    values: { c: String(c), k: "3", ...newtonBase },
  })),
  {
    id: "kepler-fixed-point",
    methodId: "1c",
    labelKey: "lab1.preset.keplerFp",
    tex: "\\varphi = \\sin x + 0.25",
    values: { ...fixedPointMethod.defaults },
  },
  ...([2, 3, 5] as const).map((c) => ({
    id: `sqrt${c}-fixed-point`,
    methodId: "1c",
    labelKey: `lab1.preset.sqrt${c}Fp` as const,
    tex: `\\sqrt{${c}}:\\ \\varphi(x) = (x + ${c})/(x + 1)`,
    values: { phi: sqrtPhi(c), x0: String(c), ...newtonBase },
  })),
];

const EPS_SET = [1e-4, 1e-8, 1e-12] as const;

export const lab1: ReadyLab = {
  number: 1,
  slug: "newton",
  status: "ready",
  titleKey: "lab1.title",
  topicKey: "lab1.topic",
  introKey: "lab1.intro",
  methods: [newtonMethod, kthRootMethod, fixedPointMethod],
  presets,
  // Only the comparisons the lab asks for (ex. 1–4). The ∛ examples are plain presets: the lab
  // asks to approximate them, not to compare.
  comparisons: [
    {
      id: "ex1",
      titleKey: "lab1.compare.ex1",
      taskKey: "lab1.compare.ex1.task",
      eps: EPS_SET,
      rows: [{ methodId: "1a", presetId: "ex1" }],
    },
    {
      id: "ex2",
      titleKey: "lab1.compare.ex2",
      taskKey: "lab1.compare.ex2.task",
      eps: EPS_SET,
      rows: [
        { methodId: "1a", presetId: "ex2-rule-r0" },
        { methodId: "1a", presetId: "ex2-manual-start" },
      ],
    },
    {
      id: "kepler",
      titleKey: "lab1.compare.kepler",
      taskKey: "lab1.compare.kepler.task",
      eps: [1e-4],
      rows: [
        { methodId: "1a", presetId: "kepler" },
        { methodId: "1c", presetId: "kepler-fixed-point" },
      ],
    },
    {
      id: "sqrt",
      titleKey: "lab1.compare.sqrt",
      taskKey: "lab1.compare.sqrt.task",
      eps: EPS_SET,
      rows: [2, 3, 5].flatMap((c) => [
        { methodId: "1b", presetId: `sqrt${c}` },
        { methodId: "1c", presetId: `sqrt${c}-fixed-point` },
      ]),
    },
  ],
};
