import type { RunView } from "@/labs/lab-state";
import type { PreparedRun, ScalarPreparedRun } from "@/labs/types";

/** A Lab 1–4 prepared run, narrowed so tests can read scalar-only fields such as `x0Rule`. */
export function scalarRun(prepared: PreparedRun): ScalarPreparedRun {
  if (prepared.kind === "system") throw new Error("expected a scalar run");
  return prepared;
}

/** A run view narrowed to the scalar kind. */
export function scalarView(view: RunView): Exclude<RunView, { kind: "system" }> {
  if (view.kind === "system") throw new Error("expected a scalar run");
  return view;
}

/** A run view narrowed to the system kind. */
export function systemView(view: RunView): Extract<RunView, { kind: "system" }> {
  if (view.kind !== "system") throw new Error("expected a system run");
  return view;
}
