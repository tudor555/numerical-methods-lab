import type { MessageKey } from "@/i18n/en";
import type { ScalarRunResult } from "@/lib/methods/types";

/** Raw text of every form field, keyed by field id. */
export type FieldValues = Record<string, string>;

export interface FieldIssue {
  key: MessageKey;
  params?: Record<string, string | number>;
}

export type FieldErrors = Record<string, FieldIssue>;

interface FieldBase {
  id: string;
  /** Symbol shown before the label, in TeX (shared by all languages). */
  symbol: string;
  labelKey: MessageKey;
  /** When this returns false the field is hidden and not validated. */
  visibleWhen?: (values: FieldValues) => boolean;
}

/** A number typed as a constant expression (`3*pi/8`, `1e-4`). */
export interface NumberField extends FieldBase {
  kind: "number";
  rule?: { positive?: true; integer?: true; min?: number; max?: number };
  /** "Derive from f": evaluate the order-th derivative of field `from` at the number in field `at`. */
  derive?: { from: string; order: 1 | 2; at: string };
}

export interface ExpressionField extends FieldBase {
  kind: "expression";
  variables: readonly string[];
  /** "Derive from f": the symbolic derivative of field `from`. */
  derive?: { from: string };
}

export interface ChoiceField extends FieldBase {
  kind: "choice";
  options: readonly { value: string; labelKey: MessageKey }[];
}

export type FieldDefinition = NumberField | ExpressionField | ChoiceField;

/** What the function chart draws for a run. */
export type FunctionPlot =
  | { kind: "tangent"; f: (x: number) => number; interval?: readonly [number, number] }
  | { kind: "cobweb"; phi: (x: number) => number };

/** A known exact solution, e.g. ᵏ√c for the k-th root. `tex` names it in headers. */
export interface ExactSolution {
  value: number;
  tex: string;
}

export interface PreparedRun {
  run: () => ScalarRunResult & { x0Rule?: "a" | "b" };
  plot?: FunctionPlot;
  eps: number;
  /** Set when the exact solution is known, so the results can show the error at each iterate (CAP-5). */
  exact?: ExactSolution;
}

export type PrepareResult =
  { ok: true; prepared: PreparedRun } | { ok: false; errors: FieldErrors };

/**
 * A paragraph, or a display formula. Words inside a formula are written as `⟪name⟫`
 * and translated through `words` (e.g. `\\text{⟪otherwise⟫}`), so formulas never carry
 * hard-coded English.
 */
export type ExplanationBlock =
  | { kind: "text"; key: MessageKey }
  | { kind: "formula"; tex: string; words?: Readonly<Record<string, MessageKey>> };

export interface MethodDefinition {
  id: string;
  /** Tab label, e.g. "1a · Newton". */
  tabKey: MessageKey;
  titleKey: MessageKey;
  /** Short name used in comparison tables. */
  nameKey: MessageKey;
  explanation: readonly ExplanationBlock[];
  fields: readonly FieldDefinition[];
  /** TeX header of the value column in the iteration table; omit when the method has no f. */
  valueColumn?: string;
  defaults: FieldValues;
  prepare: (values: FieldValues) => PrepareResult;
}

export interface Preset {
  id: string;
  methodId: string;
  labelKey: MessageKey;
  /** Short TeX tag for comparison rows, e.g. `\sqrt{2}`. */
  tex: string;
  values: FieldValues;
}

/** A comparison the lab asks for, in the lab's order. */
export interface Comparison {
  id: string;
  titleKey: MessageKey;
  /** What the lab asks for here, paraphrased; shown under the title so its source is clear. */
  taskKey: MessageKey;
  eps: readonly number[];
  rows: readonly { methodId: string; presetId: string }[];
}

interface LabBase {
  number: number;
  slug: string;
  titleKey: MessageKey;
  topicKey: MessageKey;
}

export interface ReadyLab extends LabBase {
  status: "ready";
  introKey: MessageKey;
  methods: readonly MethodDefinition[];
  presets: readonly Preset[];
  comparisons: readonly Comparison[];
}

export interface PlannedLab extends LabBase {
  status: "coming-soon";
}

export type LabDefinition = ReadyLab | PlannedLab;
