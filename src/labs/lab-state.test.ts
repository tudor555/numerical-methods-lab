import { describe, expect, it } from "vitest";
import { lab1 } from "./lab-1";
import { initialLabState, labReducer, sameValues, type LabState, type RunView } from "./lab-state";

const preset = (id: string) => {
  const p = lab1.presets.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p;
};

const runFor = (n: number): RunView => ({
  result: { status: "converged", result: 1, n, iterations: [] },
  eps: 1e-4,
});

/** Initial state with a stored run for every method. */
const withRuns = (): LabState =>
  ["1a", "1b", "1c"].reduce(
    (state, methodId, i) => labReducer(state, { type: "run", methodId, run: runFor(i) }),
    initialLabState(lab1),
  );

describe("sameValues", () => {
  it("compares every field, with a missing field equal to an empty one", () => {
    expect(sameValues({ a: "1", b: "" }, { a: "1" })).toBe(true);
    expect(sameValues({ a: "1" }, { a: "2" })).toBe(false);
    expect(sameValues({ a: "1" }, { a: "1", b: "x" })).toBe(false);
  });
});

describe("initialLabState", () => {
  const state = initialLabState(lab1);

  it("starts on the first method with no runs", () => {
    expect(state.activeId).toBe("1a");
    expect(state.runs).toEqual({});
  });

  it("puts every method on a copy of its defaults", () => {
    for (const m of lab1.methods) {
      expect(state.values[m.id]).toEqual(m.defaults);
      expect(state.values[m.id]).not.toBe(m.defaults);
    }
  });

  it("marks the preset each method's defaults match", () => {
    expect(state.presetIds).toEqual({ "1a": "ex1", "1b": "sqrt2", "1c": "kepler-fixed-point" });
  });

  it("marks no preset when the defaults match none", () => {
    const lab = { ...lab1, presets: lab1.presets.filter((p) => p.methodId !== "1b") };
    expect(initialLabState(lab).presetIds["1b"]).toBeNull();
  });
});

describe("labReducer", () => {
  it("select switches the method and keeps every method's values and runs", () => {
    const edited = labReducer(withRuns(), {
      type: "change",
      methodId: "1a",
      fieldId: "f",
      value: "x^2 - 2",
    });
    const switched = labReducer(edited, { type: "select", methodId: "1c" });
    expect(switched.activeId).toBe("1c");
    expect(switched.values).toBe(edited.values);
    expect(switched.runs).toBe(edited.runs);
    const back = labReducer(switched, { type: "select", methodId: "1a" });
    expect(back.values["1a"].f).toBe("x^2 - 2");
  });

  it("change edits one field, clears that method's preset and run, and leaves the others", () => {
    const before = withRuns();
    const after = labReducer(before, { type: "change", methodId: "1b", fieldId: "c", value: "7" });
    expect(after.values["1b"]).toEqual({ ...before.values["1b"], c: "7" });
    expect(after.values["1a"]).toBe(before.values["1a"]);
    expect(after.values["1c"]).toBe(before.values["1c"]);
    expect(after.presetIds).toEqual({ ...before.presetIds, "1b": null });
    expect(Object.keys(after.runs).sort()).toEqual(["1a", "1c"]);
    expect(before.runs["1b"]).toBeDefined();
  });

  it("change keeps the runs object when the method has no run", () => {
    const before = initialLabState(lab1);
    const after = labReducer(before, { type: "change", methodId: "1a", fieldId: "a", value: "0" });
    expect(after.runs).toBe(before.runs);
  });

  it("preset replaces the method's values, marks the preset and clears that method's run", () => {
    const before = labReducer(withRuns(), {
      type: "change",
      methodId: "1a",
      fieldId: "extra",
      value: "stale",
    });
    const kepler = preset("kepler");
    const after = labReducer(before, { type: "preset", preset: kepler });
    expect(after.values["1a"]).toEqual(kepler.values);
    expect(after.values["1a"]).not.toBe(kepler.values);
    expect(after.values["1a"].extra).toBeUndefined();
    expect(after.presetIds["1a"]).toBe("kepler");
    expect(after.runs["1a"]).toBeUndefined();
    expect(after.runs["1b"]).toBe(before.runs["1b"]);
  });

  it("preset applies to the preset's own method, not the active one", () => {
    const before = initialLabState(lab1);
    const after = labReducer(before, { type: "preset", preset: preset("cbrt3") });
    expect(after.activeId).toBe("1a");
    expect(after.values["1b"]).toEqual(preset("cbrt3").values);
    expect(after.values["1a"]).toBe(before.values["1a"]);
  });

  it("run stores the result for that method only", () => {
    const before = initialLabState(lab1);
    const run = runFor(5);
    const after = labReducer(before, { type: "run", methodId: "1c", run });
    expect(after.runs).toEqual({ "1c": run });
    expect(after.values).toBe(before.values);
    expect(after.presetIds).toBe(before.presetIds);
    const again = labReducer(after, { type: "run", methodId: "1c", run: runFor(6) });
    expect(again.runs["1c"].result.n).toBe(6);
  });

  it("never mutates the previous state", () => {
    const before = withRuns();
    const snapshot = structuredClone(before);
    labReducer(before, { type: "change", methodId: "1a", fieldId: "f", value: "x" });
    labReducer(before, { type: "preset", preset: preset("sqrt5") });
    labReducer(before, { type: "run", methodId: "1a", run: runFor(9) });
    labReducer(before, { type: "select", methodId: "1b" });
    expect(before).toEqual(snapshot);
  });
});
