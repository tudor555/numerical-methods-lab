import type { ScalarRunResult } from "@/lib/methods/types";
import type { ExactSolution, FieldValues, FunctionPlot, Preset, ReadyLab } from "./types";

/** A finished run as the results panel shows it. */
export interface RunView {
  result: ScalarRunResult & { x0Rule?: "a" | "b" };
  plot?: FunctionPlot;
  eps: number;
  exact?: ExactSolution;
}

/**
 * Everything a lab page remembers, per method, so switching method tabs or the language keeps
 * the inputs.
 */
export interface LabState {
  activeId: string;
  /** Form values, keyed by method id. */
  values: Record<string, FieldValues>;
  /** The preset the values came from, keyed by method id; null once a field is edited. */
  presetIds: Record<string, string | null>;
  /** The last run, keyed by method id; absent when there is none or the inputs changed since. */
  runs: Record<string, RunView>;
}

export type LabAction =
  /** Switches the method tab. */
  | { type: "select"; methodId: string }
  /** Edits one field of a method. */
  | { type: "change"; methodId: string; fieldId: string; value: string }
  /** Replaces a method's values with a preset's. */
  | { type: "preset"; preset: Preset }
  /** Stores a finished run for a method. */
  | { type: "run"; methodId: string; run: RunView };

/** True when both have the same text in every field; a missing field counts as empty. */
export function sameValues(a: FieldValues, b: FieldValues): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (a[k] ?? "") === (b[k] ?? ""));
}

/** First method active, every method on its defaults, marked with the preset they match (if any). */
export function initialLabState(lab: ReadyLab): LabState {
  return {
    activeId: lab.methods[0].id,
    values: Object.fromEntries(lab.methods.map((m) => [m.id, { ...m.defaults }])),
    presetIds: Object.fromEntries(
      lab.methods.map((m) => [
        m.id,
        lab.presets.find((p) => p.methodId === m.id && sameValues(p.values, m.defaults))?.id ??
          null,
      ]),
    ),
    runs: {},
  };
}

/** Drops a method's result once its inputs change, so no stale result is shown. */
function clearRun(runs: Record<string, RunView>, methodId: string): Record<string, RunView> {
  if (!(methodId in runs)) return runs;
  const { [methodId]: _dropped, ...rest } = runs;
  return rest;
}

export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case "select":
      return { ...state, activeId: action.methodId };
    case "change": {
      const { methodId, fieldId, value } = action;
      return {
        ...state,
        values: { ...state.values, [methodId]: { ...state.values[methodId], [fieldId]: value } },
        presetIds: { ...state.presetIds, [methodId]: null },
        runs: clearRun(state.runs, methodId),
      };
    }
    case "preset": {
      const { preset } = action;
      return {
        ...state,
        values: { ...state.values, [preset.methodId]: { ...preset.values } },
        presetIds: { ...state.presetIds, [preset.methodId]: preset.id },
        runs: clearRun(state.runs, preset.methodId),
      };
    }
    case "run":
      return { ...state, runs: { ...state.runs, [action.methodId]: action.run } };
  }
}
