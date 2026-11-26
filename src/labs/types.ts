import type { MessageKey } from "@/i18n/en";
import type {
  CauchyRunResult,
  ScalarErrorCode,
  ScalarRunResult,
  SystemRunResult,
} from "@/lib/methods/types";

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
  /** A blank optional field is skipped instead of rejected, like the exact solution y(x). */
  optional?: true;
  /**
   * "Derive from f": the symbolic derivative of field `from`, of the given order (default 1), in
   * `variable` (default: the source's first variable, as ∂F/∂y needs y).
   */
  derive?: { from: string; order?: 1 | 2; variable?: string };
}

export interface ChoiceField extends FieldBase {
  kind: "choice";
  options: readonly { value: string; labelKey: MessageKey }[];
}

export type FieldDefinition = NumberField | ExpressionField | ChoiceField;

/** What the function chart draws: f with each method's steps (see `buildFunctionChart`), or φ with the cobweb path. */
export type FunctionPlot =
  | {
      kind: "tangent" | "secant" | "steffensen";
      f: (x: number) => number;
      interval?: readonly [number, number];
    }
  | {
      /** Halley's tangent hyperbola and Chebyshev's tangent parabola both need f′ and f″ at xₙ. */
      kind: "halley" | "chebyshev";
      f: (x: number) => number;
      df: (x: number) => number;
      ddf: (x: number) => number;
      interval?: readonly [number, number];
    }
  | {
      /** The combined tangent method needs f′(xₙ) to draw both of its tangent steps. */
      kind: "combined-tangent";
      f: (x: number) => number;
      df: (x: number) => number;
      interval?: readonly [number, number];
    }
  | { kind: "cobweb"; phi: (x: number) => number };

/** A known exact solution, e.g. ᵏ√c for the k-th root. `tex` names it in headers. */
export interface ExactSolution {
  value: number;
  tex: string;
}

/**
 * What the charts draw for a system. `system`: F(x, y) = 0, G(x, y) = 0, so the path chart shows
 * the curves F = 0 and G = 0. `fixed-point`: x = F(x, y), y = G(x, y), so it shows the curves
 * x = F and y = G. `fixed-point-3d`: three unknowns, so there is no path chart, only the
 * components against n.
 */
export type SystemPlot =
  | {
      kind: "system" | "fixed-point";
      F: (x: number, y: number) => number;
      G: (x: number, y: number) => number;
    }
  | { kind: "fixed-point-3d" };

/** A known exact solution (x*, y*) of a 2×2 system. */
export interface SystemExactSolution {
  x: number;
  y: number;
}

/** A run whose iterate is a number xₙ. `kind` may be left out, so Labs 1–4 need not name it. */
export interface ScalarPreparedRun {
  kind?: "scalar";
  run: () => ScalarRunResult & { x0Rule?: "a" | "b" };
  plot?: FunctionPlot;
  eps: number;
  /** Set when the exact solution is known, so the results can show the error at each iterate (CAP-5). */
  exact?: ExactSolution;
}

/** A run whose iterate is a point (xₙ, yₙ) or (xₙ, yₙ, zₙ). */
export interface SystemPreparedRun {
  kind: "system";
  run: () => SystemRunResult;
  plot: SystemPlot;
  eps: number;
  exact?: SystemExactSolution;
}

/** A run that computes y at the nodes of a Cauchy problem y′ = f(x, y), y(x₀) = y₀. */
export interface CauchyPreparedRun {
  kind: "cauchy";
  run: () => CauchyRunResult;
  /** The exact solution y(x), when the user gives one; it may throw where it is undefined. */
  exact?: (x: number) => number;
}

export type PreparedRun = ScalarPreparedRun | SystemPreparedRun | CauchyPreparedRun;

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
  /** Messages for error codes whose shared wording doesn't fit this method (`run.error.*` otherwise). */
  errorKeys?: Partial<Record<ScalarErrorCode, MessageKey>>;
}

/** The inputs of one comparison row. */
export interface ComparisonPreset {
  id: string;
  methodId: string;
  /** Short TeX tag for comparison rows, e.g. `\sqrt{2}`. */
  tex: string;
  values: FieldValues;
}

/** A worked example: a comparison preset that also has a button in the form. */
export interface Preset extends ComparisonPreset {
  labelKey: MessageKey;
}

interface ComparisonBase {
  id: string;
  titleKey: MessageKey;
  /** What the lab asks for here, paraphrased; shown under the title so its source is clear. */
  taskKey: MessageKey;
  rows: readonly { methodId: string; presetId: string }[];
}

/** A comparison of iteration counts, one column per ε. `kind` may be left out (Labs 1–6). */
export interface PrecisionComparison extends ComparisonBase {
  kind?: "precision";
  eps: readonly number[];
}

/** A comparison of Cauchy-problem runs node by node, with the exact value and each row's error. */
export interface NodeComparison extends ComparisonBase {
  kind: "nodes";
  /** No ε: the runs compute y at fixed nodes. */
  eps?: never;
  /** A remark shown after the hint, for a result that could otherwise look like a bug. */
  noteKey?: MessageKey;
}

/** A comparison the lab asks for, in the lab's order. */
export type Comparison = PrecisionComparison | NodeComparison;

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
  /**
   * Methods and inputs that only comparisons use, with no tab or preset button: the lab compares
   * with them but does not ask to run them on their own (Newton in Lab 2).
   */
  comparisonOnly?: {
    methods: readonly MethodDefinition[];
    presets: readonly ComparisonPreset[];
  };
}

export interface PlannedLab extends LabBase {
  status: "coming-soon";
}

export type LabDefinition = ReadyLab | PlannedLab;
