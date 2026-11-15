---
title: "Lab 3 (Halley and Chebyshev methods)"
type: "feature"
created: "2026-11-15"
status: "ready-for-dev"
baseline_commit: "b3d5ff9eb12aa3ef41d9d39478d99892acf7c06f"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/SPEC.md"
  - "{project-root}/docs/stack.md"
  - "{project-root}/docs/labs-catalog.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Lab 3 is a "coming soon" card. Halley's and Chebyshev's methods can't be read about, run or compared with Newton.

**Approach:** Ship Lab 3 on the Lab 2 pattern: 3a Halley and 3b Chebyshev as pure methods, a lab definition with the lab's three examples as presets and its three "compare with the tangent method" comparisons, EN/RO explanations, and the hub card switched on at `/labs/halley-chebyshev`.

## Boundaries & Constraints

**Always:**

- Follow the lab text and `labs-catalog.md` Lab 3. Halley: xₙ₊₁ = xₙ − 2f f′ / (2f′² − f f″). Chebyshev: xₙ₊₁ = xₙ − f/f′ − f² f″ / (2f′³). Both compute x₁ as a separate step, then loop from n = 1 while |xₙ − xₙ₋₁| ≥ ε; output n and xₙ; editable cap, default 1000.
- Inputs as the lab lists them, with f, f′ and f″ all typed expressions (`ddf`, not the number `dda`). Halley: a, b, f, df, ddf, ε, and x₀ from rule R0 using ddf(a), or entered directly (the lab's "eventual se dă direct x[0]"). Chebyshev: a, b, f, df, ddf, ε, x₀ entered directly (no R0 in its algorithm); a, b set the chart range.
- f′ and f″ have "Derive from f" (f″ is the second derivative of f).
- If f(xₙ) = 0 exactly, xₙ₊₁ = xₙ and the run stops. Otherwise Halley's 2f′² − f f″ = 0 is `zero-denominator` and Chebyshev's f′ = 0 is `zero-derivative`; the partial table stays.
- Hub title and topic follow the lab's headings. EN: "Halley's method and Chebyshev-type methods", "Generalizations of the tangent method". RO: "Metoda lui Halley și metode de tip Cebîșev", "Generalizări ale metodei tangentei". The intro has no lab number, and the RO intro uses Lab 1's academic register ("Rezolvă …", ending "Compară apoi rezultatele … cu cele obținute prin metoda tangentei").
- Lab wording and numbering: Halley has "Ex. 1" (approximate the number √2, f = x² − 2) and "Ex. 2" (the real root of x³ − x − 1 = 0); Chebyshev's is the unnumbered "Numerical example" / "Exemplu numeric". Romanian uses the lab's spelling "Cebîșev" (title "Metoda lui Halley și metode de tip Cebîșev") and course terms (metoda tangentei, iterația inițială, precizia dorită). Each comparison card has its "Cerința" line, stating Newton's inputs as plain facts.
- Comparisons, in the lab's order, each over ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}: ex. 1 Halley vs Newton, ex. 2 Halley vs Newton, numerical example Chebyshev vs Newton.

**Decisions:**

- Halley presets enter x₀ = 2 directly, as each example states. The form keeps Lab 1's R0 / "Enter x₀" switch, so R0 (which also picks 2) is one click away.
- Newton in the comparisons uses the example's own f′ as the lab gives it (2x, 3x² − 1) and x₀ = 2 entered directly; the "Cerința" line says so.
- Function charts draw the curve each method follows instead of Newton's tangent, from (xₙ, f(xₙ)) to (xₙ₊₁, 0), only between those two points. Halley: the tangent hyperbola g(x) = (f + B·t)/(1 + C·t), t = x − xₙ, C = −f″/(2f′), B = f′ + f·C (it matches f, f′, f″ at xₙ and crosses zero at xₙ₊₁). Chebyshev: the tangent parabola x(y) = xₙ + (y − f)/f′ − f″(y − f)²/(2f′³), from y = f(xₙ) to y = 0. Both curves need f′ and f″ at xₙ, so these plot kinds carry df and ddf. When 2f′² − f f″ < 0 the hyperbola's pole lies between the two points, and that step is drawn as a straight segment instead. Each kind has its own chart title and legend name; the |xₙ − xₙ₋₁| log chart stays.
- No exact value for ex. 1 (√2), as in Labs 1 and 2: f is free text, so an exact value couldn't follow edits.
- The spec stays whole (≈ 2,500 tokens). The user accepted the size.

**Never:** Implement Labs 4–13, add dependencies or e2e tests, add methods or comparisons the lab doesn't ask for, change Lab 1 or Lab 2 results or locked counts.

## I/O & Edge-Case Matrix

| Scenario              | Input / State                                 | Expected Output / Behavior                                     | Error Handling                |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| Halley ex. 1          | f = x² − 2, f′ = 2x, f″ = 2, [1, 2], x₀ = 2   | → 1.41421356…; n = 3/4/4 for ε = 10⁻⁴/10⁻⁸/10⁻¹²; Newton 4/5/6 | N/A                           |
| Halley ex. 2          | f = x³ − x − 1, f′ = 3x² − 1, f″ = 6x, x₀ = 2 | → 1.32471795…; n = 4/4/5; Newton 5/6/7                         | N/A                           |
| Chebyshev num. ex.    | same f, f′, f″ as ex. 2, x₀ = 2               | → 1.32471795…; n = 4/4/5; Newton 5/6/7                         | N/A                           |
| Halley by R0          | ex. 1 with "Rule R0": f(1)·f″(1) = −2 ≤ 0     | x₀ = b = 2, "chosen by R0"; same counts                        | N/A                           |
| Halley zero denom.    | f = x − 1, f′ = 1, f″ = 2, x₀ = 2             | status `error`, code `zero-denominator`, row 0 kept            | Specific message naming n, xₙ |
| Chebyshev zero deriv. | f = x² − 2, f′ = 2x, f″ = 2, x₀ = 0           | status `error`, code `zero-derivative`, row 0 kept             | Same message as Newton        |
| Exact root hit        | Halley f = x − 1, f′ = 1, f″ = 0, x₀ = 1      | x₁ = 1; `converged` at n = 1                                   | N/A                           |
| NaN / ∞ / cap         | as Lab 1                                      | `undefined-value` / `overflow` / `diverged` / `max-iterations` | Same messages as Lab 1        |

</frozen-after-approval>

## Code Map

- `src/lib/methods/scalar-iterate.ts` -- one-point `step` driver; reuse unchanged.
- `src/lib/methods/starting-value.ts` -- `startByRuleR0(f, a, b, dda)`; let it also take f″ as a function, so an undefined f(a) or ddf(a) fails before row 0 in one place. Newton and Steffensen keep passing a number.
- `src/lib/methods/lab1/newton.ts` -- `NewtonStart` union (`r0` / `manual`): Halley copies this shape.
- `src/lib/methods/types.ts` -- `zero-denominator` and `zero-derivative` already exist; no new codes.
- `src/labs/shared-fields.ts` -- f, interval, ε, cap, `checkInterval`, `ruleR0Formula`; add the shared df/ddf expression fields here.
- `src/labs/types.ts` -- `ExpressionField.derive` gets an optional `order: 1 | 2`; `fields.ts` `deriveField` uses it for expressions too.
- `src/labs/lab-1.ts` -- `newtonMethod` (imported by Labs 2 and 3), plus the private `usesRuleR0` and the inline `x0Mode` choice and x₀ fields: move those to `shared-fields.ts` so Lab 1 and Halley share them. Lab 1 behaviour is unchanged.
- `src/labs/lab-2.ts` -- pattern for `comparisonOnly` Newton presets and `EPS_SET`. Lab 3's Newton presets are literal values (f, df, `x0Mode: "manual"`, x0 = 2), not derived; move `EPS_SET` to `shared-fields.ts` for both labs. Lab 2 values stay identical.
- `src/labs/registry.ts` -- replace `planned(3, …)` with `lab3`; `PlannedNumber` drops 3.
- `src/components/lab/charts.ts` -- `buildFunctionChart` only sees rows (n, x, f(x)); the halley/chebyshev branches evaluate df/ddf from the plot. `results-panel.tsx` -- `CHART_TITLE` map and `ChartLabels` (`satisfies Record<FunctionPlot["kind"], …>`, so new kinds fail typecheck until added).
- `src/i18n/{en,ro}.ts` -- `lab3.*` keys; replace `lab3.title`/`lab3.topic` in both languages; new `field.ddf` (only `field.df` exists).
- Tests that use Lab 3 as the "unbuilt" example switch to Lab 4: `src/labs/lab-1.test.ts:27`, `src/app/labs/[slug]/page.test.tsx:46,79`, `src/components/hub.test.tsx:26` ("labs 3–13" → "4–13").
- `docs/labs-catalog.md` -- Lab 3: Chebyshev example is the unnumbered numerical example; f″ is the expression ddf.

## Tasks & Acceptance

**Execution:**

- [ ] `src/lib/methods/lab3/{halley,chebyshev}.ts` + `lab3.test.ts` -- methods; lock every matrix row and count
- [ ] `src/lib/methods/starting-value.ts` -- R0 accepts f″ as a function; Lab 1 and 2 tests stay green
- [ ] `src/labs/{types,fields,shared-fields}.ts`, `lab-1.ts` -- second-order expression derive, shared df/ddf and x₀-mode fields; Lab 1 tests stay green
- [ ] `src/labs/lab-3.ts` + `lab-3.test.ts`, `registry.ts`, `lab-2.ts` -- definition, presets, three comparisons with `taskKey` and literal Newton presets; shared `EPS_SET`; lock the n-matrix and comparison ids; Lab 2 tests stay green
- [ ] `src/components/lab/{charts.ts,results-panel.tsx}` + tests -- `halley` hyperbola and `chebyshev` parabola kinds (curve passes through (xₙ, f(xₙ)) and (xₙ₊₁, 0)), titles, legend names
- [ ] `src/i18n/{en,ro}.ts` -- all Lab 3 keys, KaTeX formulas with `⟪⟫` words, native RO
- [ ] hub, route and page tests -- Lab 3 ready, Lab 4 as the unbuilt example
- [ ] `docs/labs-catalog.md` -- Lab 3 wording fixes

**Acceptance Criteria:**

- Given the hub, when it loads, then the Lab 3 card is live and opens `/labs/halley-chebyshev`.
- Given Lab 3, when each preset runs, then the form fills and the result, n, table and chart appear; each comparison shows n for both methods × ε.
- Given filled inputs, when switching to RO, then all Lab 3 strings and explanations are Romanian and inputs are kept.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**

- `bun run typecheck` -- no errors
- `bun run test` -- all suites pass
- `bun run build` -- succeeds
- `bun run format:check` -- clean

**Manual checks:**

- Run every Lab 3 preset and comparison in EN and RO; chart toolbar works; no horizontal scroll at phone width.
