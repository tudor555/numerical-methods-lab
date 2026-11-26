import { solveCauchy, type CauchyStep } from "@/lib/methods/cauchy";
import { euler, eulerHeun, modifiedEuler } from "@/lib/methods/lab7/euler";
import { parseFields } from "./fields";
import { cauchyFields } from "./shared-fields";
import type { ExplanationBlock, FieldValues, MethodDefinition, Preset, ReadyLab } from "./types";

/** Ex. 1: y′ = x² − y, y(0) = 1 on [0, 4], with the lab's exact solution. */
const ex1Problem = { x0: "0", y0: "1", T: "4", f: "x^2 - y", exact: "x^2 - 2x + 2 - e^(-x)" };

/** Ex. 2 and the numerical example: y′ = y + x, y(0) = 1 on [0, 1], h = 0.1. */
const ex2Values: FieldValues = {
  x0: "0",
  y0: "1",
  T: "1",
  n: "10",
  f: "y + x",
  exact: "2 e^x - x - 1",
};

/** Ex. 1 with h = T/n = 1/4, 1/8 or 1/16. */
const ex1Values = (n: number): FieldValues => ({ ...ex1Problem, n: String(n) });

type MethodKey = "euler" | "modified" | "heun";

const text = (key: MethodKey, part: "idea" | "steps" | "failure" | "chart"): ExplanationBlock => ({
  kind: "text",
  key: `lab7.method.${key}.${part}`,
});

const NODES_TEX = "h = \\frac{T}{n}, \\qquad x_i = x_0 + i\\,h, \\quad i = 0, 1, \\dots, n";

function cauchyMethod(
  id: "7a" | "7b" | "7c",
  key: MethodKey,
  formula: string,
  defaults: FieldValues,
  step: CauchyStep,
): MethodDefinition {
  return {
    id,
    tabKey: `lab7.method.${key}.tab`,
    titleKey: `lab7.method.${key}.title`,
    nameKey: `lab7.method.${key}.name`,
    explanation: [
      text(key, "idea"),
      { kind: "formula", tex: formula },
      text(key, "steps"),
      { kind: "formula", tex: NODES_TEX },
      text(key, "failure"),
      text(key, "chart"),
    ],
    fields: cauchyFields,
    defaults,
    prepare(values) {
      const { numbers, functions, errors } = parseFields(cauchyFields, values);
      if (Object.keys(errors).length > 0) return { ok: false, errors };
      const { f, exact } = functions;
      const { x0, y0, T, n } = numbers;
      return {
        ok: true,
        prepared: {
          kind: "cauchy",
          run: () => solveCauchy({ f, x0, y0, T, n }, step),
          exact: exact ? (x: number) => exact(x) : undefined,
        },
      };
    },
  };
}

const eulerMethod = cauchyMethod(
  "7a",
  "euler",
  "y_i = y_{i-1} + h\\,f(x_{i-1}, y_{i-1}), \\quad i = 1, \\dots, n",
  ex1Values(16),
  euler,
);

const modifiedMethod = cauchyMethod(
  "7b",
  "modified",
  "\\begin{aligned} K &= f(x_{i-1}, y_{i-1}) \\\\ U &= f\\left(x_{i-1} + \\tfrac{h}{2},\\ y_{i-1} + \\tfrac{h}{2}K\\right) \\\\ y_i &= y_{i-1} + h\\,U \\end{aligned}",
  ex2Values,
  modifiedEuler,
);

const heunMethod = cauchyMethod(
  "7c",
  "heun",
  "\\begin{aligned} K_1 &= f(x_{i-1}, y_{i-1}) \\\\ K_2 &= f(x_{i-1} + h,\\ y_{i-1} + h K_1) \\\\ y_i &= y_{i-1} + \\tfrac{h}{2}(K_1 + K_2) \\end{aligned}",
  ex2Values,
  eulerHeun,
);

/** Language-neutral tag for comparison rows: the step as the lab writes it, and n. */
const stepTex = (denominator: number, n: number) => `h = \\frac{1}{${denominator}},\\ n = ${n}`;

const presets: readonly Preset[] = [
  {
    id: "ex1-h-1-4",
    methodId: "7a",
    labelKey: "lab7.preset.ex1H4",
    tex: stepTex(4, 16),
    values: ex1Values(16),
  },
  {
    id: "ex1-h-1-8",
    methodId: "7a",
    labelKey: "lab7.preset.ex1H8",
    tex: stepTex(8, 32),
    values: ex1Values(32),
  },
  {
    id: "ex1-h-1-16",
    methodId: "7a",
    labelKey: "lab7.preset.ex1H16",
    tex: stepTex(16, 64),
    values: ex1Values(64),
  },
  {
    id: "ex2",
    methodId: "7a",
    labelKey: "lab7.preset.ex2",
    tex: stepTex(10, 10),
    values: ex2Values,
  },
  {
    id: "example-modified",
    methodId: "7b",
    labelKey: "lab7.preset.exampleModified",
    tex: stepTex(10, 10),
    values: ex2Values,
  },
  {
    id: "example-heun",
    methodId: "7c",
    labelKey: "lab7.preset.exampleHeun",
    tex: stepTex(10, 10),
    values: ex2Values,
  },
];

export const lab7: ReadyLab = {
  number: 7,
  slug: "euler",
  status: "ready",
  titleKey: "lab7.title",
  topicKey: "lab7.topic",
  introKey: "lab7.intro",
  methods: [eulerMethod, modifiedMethod, heunMethod],
  presets,
  comparisons: [
    {
      kind: "nodes",
      id: "ex1",
      titleKey: "lab7.compare.ex1",
      taskKey: "lab7.compare.ex1.task",
      noteKey: "lab7.compare.ex1.note",
      rows: [
        { methodId: "7a", presetId: "ex1-h-1-4" },
        { methodId: "7a", presetId: "ex1-h-1-8" },
        { methodId: "7a", presetId: "ex1-h-1-16" },
      ],
    },
    {
      kind: "nodes",
      id: "example",
      titleKey: "lab7.compare.example",
      taskKey: "lab7.compare.example.task",
      noteKey: "lab7.compare.example.note",
      rows: [
        { methodId: "7a", presetId: "ex2" },
        { methodId: "7b", presetId: "example-modified" },
        { methodId: "7c", presetId: "example-heun" },
      ],
    },
  ],
};
