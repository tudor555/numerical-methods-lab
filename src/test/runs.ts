import type { RunView } from "@/labs/lab-state";
import type { CauchyPreparedRun, PreparedRun, ScalarPreparedRun } from "@/labs/types";

/** A Lab 1–4 prepared run, narrowed so tests can read scalar-only fields such as `x0Rule`. */
export function scalarRun(prepared: PreparedRun): ScalarPreparedRun {
  if (prepared.kind === "system" || prepared.kind === "cauchy") {
    throw new Error("expected a scalar run");
  }
  return prepared;
}

/** A Lab 7 prepared run, narrowed to the Cauchy kind. */
export function cauchyRun(prepared: PreparedRun): CauchyPreparedRun {
  if (prepared.kind !== "cauchy") throw new Error("expected a Cauchy run");
  return prepared;
}

/** A run view narrowed to the scalar kind. */
export function scalarView(view: RunView): Exclude<RunView, { kind: "system" | "cauchy" }> {
  if (view.kind === "system" || view.kind === "cauchy") throw new Error("expected a scalar run");
  return view;
}

/** A run view narrowed to the system kind. */
export function systemView(view: RunView): Extract<RunView, { kind: "system" }> {
  if (view.kind !== "system") throw new Error("expected a system run");
  return view;
}

/** A run view narrowed to the Cauchy kind. */
export function cauchyView(view: RunView): Extract<RunView, { kind: "cauchy" }> {
  if (view.kind !== "cauchy") throw new Error("expected a Cauchy run");
  return view;
}
