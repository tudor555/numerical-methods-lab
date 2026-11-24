import {
  gaussSeidel2,
  gaussSeidel3,
  successiveApproximations,
  type FixedPointSystemInput,
} from "@/lib/methods/lab6/successive-approximations";
import type { SystemRunResult } from "@/lib/methods/types";
import { parseFields } from "./fields";
import { epsField, EPS_SET, maxIterField, valueRule, XY, XYZ } from "./shared-fields";
import type {
  ExplanationBlock,
  FieldDefinition,
  FieldValues,
  MethodDefinition,
  Preset,
  ReadyLab,
  SystemExactSolution,
} from "./types";

const startFields = (z: boolean): readonly FieldDefinition[] => [
  { id: "x0", kind: "number", symbol: "x_0", labelKey: "field.startX", rule: valueRule },
  { id: "y0", kind: "number", symbol: "y_0", labelKey: "field.startY", rule: valueRule },
  ...(z
    ? [
        {
          id: "z0",
          kind: "number",
          symbol: "z_0",
          labelKey: "field.startZ",
          rule: valueRule,
        } satisfies FieldDefinition,
      ]
    : []),
];

const fields2: readonly FieldDefinition[] = [
  { id: "F", kind: "expression", symbol: "F(x, y)", labelKey: "field.F", variables: XY },
  { id: "G", kind: "expression", symbol: "G(x, y)", labelKey: "field.G", variables: XY },
  ...startFields(false),
  epsField,
  maxIterField,
];

const fields3: readonly FieldDefinition[] = [
  { id: "F1", kind: "expression", symbol: "F_1(x, y, z)", labelKey: "field.F1", variables: XYZ },
  { id: "F2", kind: "expression", symbol: "F_2(x, y, z)", labelKey: "field.F2", variables: XYZ },
  { id: "F3", kind: "expression", symbol: "F_3(x, y, z)", labelKey: "field.F3", variables: XYZ },
  ...startFields(true),
  epsField,
  maxIterField,
];

const base = { eps: "1e-4", maxIter: "1000" };

const ex1System = { F: "sqrt((x * (y + 5) - 1) / 2)", G: "sqrt(x + 3 lg(x))" };

/** Ex. 2's system x² + y² = 5, xy = 2, written as x = F, y = G once per solution it is solved near. */
const ex2Forms = {
  near21: { F: "sqrt(5 - y^2)", G: "2 / x", exact: { x: 2, y: 1 } },
  near12: { F: "2 / y", G: "sqrt(5 - x^2)", exact: { x: 1, y: 2 } },
  nearMinus1Minus2: { F: "2 / y", G: "-sqrt(5 - x^2)", exact: { x: -1, y: -2 } },
  nearMinus2Minus1: { F: "-sqrt(5 - y^2)", G: "2 / x", exact: { x: -2, y: -1 } },
} as const;

const ex3System = {
  F1: "sqrt(0.5 (y z + 5x - 1))",
  F2: "sqrt(2x + ln(z))",
  F3: "sqrt(x y + 2z + 8)",
};

/**
 * The exact solution, known only for ex. 2's system: F and G matched by their text, with spaces
 * ignored, against one of its four forms. The start does not matter, so a run from anywhere that
 * converges shows its error against that form's solution.
 */
function exactSolution(values: FieldValues): SystemExactSolution | undefined {
  const compact = (text = "") => text.replace(/\s+/g, "");
  const form = Object.values(ex2Forms).find(
    (f) => compact(values.F) === compact(f.F) && compact(values.G) === compact(f.G),
  );
  return form?.exact;
}

type MethodKey = "successive" | "gaussSeidel3" | "gaussSeidel2";

const text = (key: MethodKey, part: "idea" | "start" | "failure" | "chart"): ExplanationBlock => ({
  kind: "text",
  key: `lab6.method.${key}.${part}`,
});

function explanation(
  key: MethodKey,
  formula: string,
  stopping: "common.systemStopping" | "common.system3Stopping",
): ExplanationBlock[] {
  return [
    text(key, "idea"),
    { kind: "formula", tex: formula },
    text(key, "start"),
    { kind: "text", key: stopping },
    text(key, "failure"),
    text(key, "chart"),
  ];
}

const names = (key: MethodKey) =>
  ({
    tabKey: `lab6.method.${key}.tab`,
    titleKey: `lab6.method.${key}.title`,
    nameKey: `lab6.method.${key}.name`,
  }) as const;

function method2(
  id: "6a" | "6c",
  key: "successive" | "gaussSeidel2",
  formula: string,
  defaults: FieldValues,
  run: (input: FixedPointSystemInput) => SystemRunResult,
): MethodDefinition {
  return {
    id,
    ...names(key),
    explanation: explanation(key, formula, "common.systemStopping"),
    fields: fields2,
    defaults,
    prepare(values) {
      const { numbers, functions, errors } = parseFields(fields2, values);
      if (Object.keys(errors).length > 0) return { ok: false, errors };
      const { F, G } = functions;
      const { x0, y0, eps, maxIter } = numbers;
      return {
        ok: true,
        prepared: {
          kind: "system",
          eps,
          run: () => run({ F, G, x0, y0, eps, maxIter }),
          plot: { kind: "fixed-point", F, G },
          exact: exactSolution(values),
        },
      };
    },
  };
}

const startValues = (...start: number[]) =>
  Object.fromEntries(start.map((value, i) => [["x0", "y0", "z0"][i], String(value)]));

const ex1Values: FieldValues = { ...ex1System, ...startValues(3.5, 2.2), ...base };
const ex2Values = (form: keyof typeof ex2Forms): FieldValues => ({
  F: ex2Forms[form].F,
  G: ex2Forms[form].G,
  ...startValues(1.5, 1.5),
  ...base,
});
const ex3Values: FieldValues = {
  ...ex3System,
  ...startValues(10, 10, 10),
  eps: "1e-3",
  maxIter: base.maxIter,
};

const successiveMethod = method2(
  "6a",
  "successive",
  "\\begin{aligned} x_{n+1} &= F(x_n, y_n) \\\\ y_{n+1} &= G(x_n, y_n) \\end{aligned}",
  ex1Values,
  successiveApproximations,
);

const gaussSeidel3Method: MethodDefinition = {
  id: "6b",
  ...names("gaussSeidel3"),
  explanation: explanation(
    "gaussSeidel3",
    "\\begin{aligned} x_{n+1} &= F_1(x_n, y_n, z_n) \\\\ y_{n+1} &= F_2(x_{n+1}, y_n, z_n) \\\\ z_{n+1} &= F_3(x_{n+1}, y_{n+1}, z_n) \\end{aligned}",
    "common.system3Stopping",
  ),
  fields: fields3,
  defaults: ex3Values,
  prepare(values) {
    const { numbers, functions, errors } = parseFields(fields3, values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const { F1, F2, F3 } = functions;
    const { x0, y0, z0, eps, maxIter } = numbers;
    return {
      ok: true,
      prepared: {
        kind: "system",
        eps,
        run: () => gaussSeidel3({ F1, F2, F3, x0, y0, z0, eps, maxIter }),
        plot: { kind: "fixed-point-3d" },
      },
    };
  },
};

const gaussSeidel2Method = method2(
  "6c",
  "gaussSeidel2",
  "\\begin{aligned} x_{n+1} &= F(x_n, y_n) \\\\ y_{n+1} &= G(x_{n+1}, y_n) \\end{aligned}",
  ex2Values("near21"),
  gaussSeidel2,
);

/** Language-neutral tag for comparison rows: the start, without a point's separator. */
const startTex = (...start: number[]) =>
  start.map((value, i) => `${["x", "y", "z"][i]}_0 = ${value}`).join(",\\ ");

const ex2Preset = (id: string, form: keyof typeof ex2Forms, labelKey: Preset["labelKey"]) =>
  ({
    id,
    methodId: "6a",
    labelKey,
    tex: startTex(1.5, 1.5),
    values: ex2Values(form),
  }) satisfies Preset;

const presets: readonly Preset[] = [
  {
    id: "ex1",
    methodId: "6a",
    labelKey: "lab6.preset.ex1",
    tex: startTex(3.5, 2.2),
    values: ex1Values,
  },
  ex2Preset("ex2-near-2-1", "near21", "lab6.preset.ex2Near21"),
  ex2Preset("ex2-near-1-2", "near12", "lab6.preset.ex2Near12"),
  ex2Preset("ex2-near-minus-1-minus-2", "nearMinus1Minus2", "lab6.preset.ex2NearMinus1Minus2"),
  ex2Preset("ex2-near-minus-2-minus-1", "nearMinus2Minus1", "lab6.preset.ex2NearMinus2Minus1"),
  {
    id: "ex3",
    methodId: "6b",
    labelKey: "lab6.preset.ex3",
    tex: startTex(10, 10, 10),
    values: ex3Values,
  },
  // The lab's 2-equation remark: Gauss–Seidel on ex. 2's system near (2, 1).
  {
    id: "ex4",
    methodId: "6c",
    labelKey: "lab6.preset.ex4",
    tex: startTex(1.5, 1.5),
    values: ex2Values("near21"),
  },
];

export const lab6: ReadyLab = {
  number: 6,
  slug: "nonlinear-systems",
  status: "ready",
  titleKey: "lab6.title",
  topicKey: "lab6.topic",
  introKey: "lab6.intro",
  methods: [successiveMethod, gaussSeidel3Method, gaussSeidel2Method],
  presets,
  comparisons: [
    {
      id: "ex4",
      titleKey: "lab6.compare.ex4",
      taskKey: "lab6.compare.ex4.task",
      eps: EPS_SET,
      rows: [
        { methodId: "6c", presetId: "ex4" },
        { methodId: "6a", presetId: "ex2-near-2-1" },
      ],
    },
  ],
};
