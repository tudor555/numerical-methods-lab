import {
  modifiedNewtonSystem,
  newtonSystem,
  type NewtonSystemInput,
} from "@/lib/methods/lab5/newton-system";
import type { SystemRunResult } from "@/lib/methods/types";
import { parseFields } from "./fields";
import { epsField, EPS_SET, maxIterField, valueRule, XY } from "./shared-fields";
import type {
  ExplanationBlock,
  FieldDefinition,
  FieldValues,
  MethodDefinition,
  Preset,
  ReadyLab,
  SystemExactSolution,
} from "./types";

const partialField = (id: string, from: "F" | "G", variable: "x" | "y"): FieldDefinition => ({
  id,
  kind: "expression",
  symbol: `\\frac{\\partial ${from}}{\\partial ${variable}}`,
  labelKey: "field.partial",
  variables: XY,
  derive: { from, variable },
});

const fields: readonly FieldDefinition[] = [
  { id: "F", kind: "expression", symbol: "F(x, y)", labelKey: "field.F", variables: XY },
  { id: "G", kind: "expression", symbol: "G(x, y)", labelKey: "field.G", variables: XY },
  partialField("Fx", "F", "x"),
  partialField("Fy", "F", "y"),
  partialField("Gx", "G", "x"),
  partialField("Gy", "G", "y"),
  { id: "x0", kind: "number", symbol: "x_0", labelKey: "field.startX", rule: valueRule },
  { id: "y0", kind: "number", symbol: "y_0", labelKey: "field.startY", rule: valueRule },
  epsField,
  maxIterField,
];

const base = { eps: "1e-4", maxIter: "1000" };

const ex1System = {
  F: "2x^3 - y^2 - 1",
  G: "x y^3 - y - 4",
  Fx: "6x^2",
  Fy: "-2y",
  Gx: "y^3",
  Gy: "3x y^2 - 1",
};

const ex2System = {
  F: "x^2 + y^2 - 10",
  G: "sqrt(x + y) - 2",
  Fx: "2x",
  Fy: "2y",
  Gx: "1 / (2 sqrt(x + y))",
  Gy: "1 / (2 sqrt(x + y))",
};

/** Ex. 2's two starting points and the exact solution the lab gives for each. */
const ex2Starts = [
  { x0: 0.9, y0: 3.1, exact: { x: 1, y: 3 } },
  { x0: 2.9, y0: 1.1, exact: { x: 3, y: 1 } },
] as const;

/**
 * The exact solution, known only for ex. 2's system from one of its two starts. F and G are
 * matched by their text with spaces ignored, and the start by value, so editing ε, the cap or a
 * partial derivative keeps it.
 */
function exactSolution(
  values: FieldValues,
  x0: number,
  y0: number,
): SystemExactSolution | undefined {
  const compact = (text = "") => text.replace(/\s+/g, "");
  if (compact(values.F) !== compact(ex2System.F) || compact(values.G) !== compact(ex2System.G)) {
    return undefined;
  }
  return ex2Starts.find((start) => start.x0 === x0 && start.y0 === y0)?.exact;
}

function systemMethod(
  id: "5a" | "5b",
  key: "newton" | "modified",
  formula: string,
  defaults: FieldValues,
  run: (input: NewtonSystemInput) => SystemRunResult,
): MethodDefinition {
  const text = (part: "idea" | "start" | "failure" | "chart"): ExplanationBlock => ({
    kind: "text",
    key: `lab5.method.${key}.${part}`,
  });
  const method: MethodDefinition = {
    id,
    tabKey: `lab5.method.${key}.tab`,
    titleKey: `lab5.method.${key}.title`,
    nameKey: `lab5.method.${key}.name`,
    explanation: [
      text("idea"),
      { kind: "formula", tex: formula },
      text("start"),
      { kind: "text", key: "common.systemStopping" },
      text("failure"),
      text("chart"),
    ],
    fields,
    defaults,
    prepare(values) {
      const { numbers, functions, errors } = parseFields(fields, values);
      if (Object.keys(errors).length > 0) return { ok: false, errors };
      const { F, G, Fx, Fy, Gx, Gy } = functions;
      const { x0, y0, eps, maxIter } = numbers;
      return {
        ok: true,
        prepared: {
          kind: "system",
          eps,
          run: () => run({ F, G, Fx, Fy, Gx, Gy, x0, y0, eps, maxIter }),
          plot: { kind: "system", F, G },
          exact: exactSolution(values, x0, y0),
        },
      };
    },
  };
  return method;
}

const startValues = (x0: number, y0: number) => ({ x0: String(x0), y0: String(y0) });

const ex1Values: FieldValues = { ...ex1System, ...startValues(1.2, 1.7), ...base };
const ex2Values = (i: 0 | 1): FieldValues => ({
  ...ex2System,
  ...startValues(ex2Starts[i].x0, ex2Starts[i].y0),
  ...base,
});

const newtonMethod = systemMethod(
  "5a",
  "newton",
  "\\begin{aligned} x_{n+1} &= x_n - \\frac{F\\,G_y - G\\,F_y}{J} \\\\ y_{n+1} &= y_n - \\frac{F_x\\,G - G_x\\,F}{J} \\\\ J &= F_x\\,G_y - F_y\\,G_x \\end{aligned}",
  ex1Values,
  newtonSystem,
);

const modifiedMethod = systemMethod(
  "5b",
  "modified",
  "\\begin{aligned} x_{n+1} &= x_n - \\frac{F\\,G_y^0 - G\\,F_y^0}{J_0} \\\\ y_{n+1} &= y_n - \\frac{F_x^0\\,G - G_x^0\\,F}{J_0} \\\\ J_0 &= F_x^0\\,G_y^0 - F_y^0\\,G_x^0 \\end{aligned}",
  ex2Values(0),
  modifiedNewtonSystem,
);

const startTex = (x0: number, y0: number) => `x_0 = ${x0},\\ y_0 = ${y0}`;

const presets: readonly Preset[] = [
  {
    id: "ex1",
    methodId: "5a",
    labelKey: "lab5.preset.ex1",
    tex: startTex(1.2, 1.7),
    values: ex1Values,
  },
  {
    id: "ex2-first",
    methodId: "5a",
    labelKey: "lab5.preset.ex2First",
    tex: startTex(0.9, 3.1),
    values: ex2Values(0),
  },
  {
    id: "ex2-second",
    methodId: "5a",
    labelKey: "lab5.preset.ex2Second",
    tex: startTex(2.9, 1.1),
    values: ex2Values(1),
  },
  // The lab asks for modified Newton on ex. 2's system only.
  {
    id: "ex3-first",
    methodId: "5b",
    labelKey: "lab5.preset.ex3First",
    tex: startTex(0.9, 3.1),
    values: ex2Values(0),
  },
  {
    id: "ex3-second",
    methodId: "5b",
    labelKey: "lab5.preset.ex3Second",
    tex: startTex(2.9, 1.1),
    values: ex2Values(1),
  },
];

export const lab5: ReadyLab = {
  number: 5,
  slug: "newton-systems",
  status: "ready",
  titleKey: "lab5.title",
  topicKey: "lab5.topic",
  introKey: "lab5.intro",
  methods: [newtonMethod, modifiedMethod],
  presets,
  comparisons: [
    {
      id: "ex3",
      titleKey: "lab5.compare.ex3",
      taskKey: "lab5.compare.ex3.task",
      eps: EPS_SET,
      rows: [
        { methodId: "5b", presetId: "ex3-first" },
        { methodId: "5a", presetId: "ex2-first" },
        { methodId: "5b", presetId: "ex3-second" },
        { methodId: "5a", presetId: "ex2-second" },
      ],
    },
  ],
};
