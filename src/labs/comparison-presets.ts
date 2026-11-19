import { kthRootMethod, newtonMethod } from "./lab-1";
import type { ComparisonPreset } from "./types";

// Inputs for the Lab 1 methods that later labs compare their own methods with.

/** What the f(x) = 0 examples of Labs 3 and 4 share: [1, 2], ε = 10⁻⁴ and the default cap. */
export const exampleBase = { a: "1", b: "2", eps: "1e-4", maxIter: "1000" };

/** Newton's inputs for one comparison: the example's own f and f′ as the lab gives them, x₀ = 2. */
export function newtonPreset(id: string, f: string, df: string): ComparisonPreset {
  return {
    id,
    methodId: newtonMethod.id,
    tex: `${f},\\ x_0 = 2`,
    values: { f, df, x0Mode: "manual", dda: "", x0: "2", ...exampleBase },
  };
}

/** 1b's inputs for √c: k = 2, so x₀ = c for c > 1. */
export function kthRootPreset(id: string, c: number): ComparisonPreset {
  return {
    id,
    methodId: kthRootMethod.id,
    tex: `\\sqrt{${c}}`,
    values: { c: String(c), k: "2", eps: exampleBase.eps, maxIter: exampleBase.maxIter },
  };
}
