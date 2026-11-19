---
title: "Lab 2 (Secant and Steffensen methods)"
type: "feature"
created: "2026-11-15"
status: "done"
baseline_commit: "7bc58fe77c760422716b117ae83c5761fbcd6144"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/SPEC.md"
  - "{project-root}/docs/stack.md"
  - "{project-root}/docs/labs-catalog.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Lab 2 is a "coming soon" card. The secant and Steffensen methods can't be read about, run or compared with Newton.

**Approach:** Ship Lab 2 on the Lab 1 pattern: 2a Secant and 2b Steffensen as pure methods, a lab definition with the lab's three examples as presets and its three "compare with Newton" comparisons, EN/RO explanations, and the hub card switched on at `/labs/secant-steffensen`.

## Boundaries & Constraints

**Always:**

- Follow `labs-catalog.md` Lab 2 and its Shared rules. Secant: the user gives x₀ and x₁; row 1 is x₁ and the loop runs from n = 1 while |xₙ − xₙ₋₁| ≥ ε. Steffensen: x₀ from rule R0 (f(a)·dda > 0 → a, else b), x₁ as a separate step, then the same loop. Output n and xₙ. Max-iteration cap editable, default 1000.
- Inputs exactly as the lab lists them. Secant: a, b, f, ε, x₀, x₁ (a, b set the chart range). Steffensen: a, b, f, ε, dda (with "derive from f"). No manual x₀ for Steffensen: the lab only uses R0.
- If f(xₙ) = 0 exactly, the next iterate is xₙ (the root is exact), so the run stops. Otherwise a zero denominator (f(xₙ) = f(xₙ₋₁), or f(xₙ + f(xₙ)) = f(xₙ)) is a new error code `zero-denominator` with its own EN/RO message; the partial table stays.
- Comparisons, in the lab's order, each over ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}: ex. 1 Secant vs Newton, ex. 2 Secant vs Newton, the numerical example Steffensen vs Newton. Each card has its "Cerința" line and says what the lab leaves open: Newton uses the same f and [a, b], f′ derived from f, and R0 (x₀ = 2 in all three).
- Romanian copy is native, in the course's terms (metoda secantei, metoda lui Steffensen, metoda tangentei, iterația inițială, precizia dorită).

**Decisions:**

- Shared code is generalized, not copied: the driver accepts a given x₁ and a two-point step; R0 start handling, the ε and cap fields are shared by Labs 1 and 2; comparisons can include methods that are not tabs of the lab (Newton in Lab 2).
- Charts: Secant draws each step as the chord from (xₙ₋₁, f(xₙ₋₁)) through (xₙ, f(xₙ)) to (xₙ₊₁, 0). Steffensen draws the segment from (xₙ, f(xₙ)) to (xₙ₊₁, 0), because its auxiliary point xₙ + f(xₙ) can sit far outside [a, b] (x₀ + f(x₀) = 7 in the numerical example). Both keep the log-scale |xₙ − xₙ₋₁| chart.
- No exact value for ex. 1 (√2), as with Newton in Lab 1: f is free text, so an exact value couldn't follow edits. The Newton comparison shows both results side by side.
- The spec stays whole (≈ 2,200 tokens). The user accepted the size.

**Never:** Implement Labs 3–13, add dependencies or e2e tests, add methods or comparisons the lab doesn't ask for, change Lab 1's results or locked counts.

## I/O & Edge-Case Matrix

| Scenario         | Input / State                                        | Expected Output / Behavior                                     | Error Handling                |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| Secant ex. 1     | f = x² − 2, [1, 2], x₀ = 2, x₁ = 1.4                 | → 1.41421356…; n = 4/6/6 for ε = 10⁻⁴/10⁻⁸/10⁻¹²; Newton 4/5/6 | N/A                           |
| Secant ex. 2     | f = x³ − x − 1, [1, 2], x₀ = 2, x₁ = 1.5             | → 1.32471795…; n = 6/7/8; Newton 5/6/7                         | N/A                           |
| Steffensen num.  | f = x³ − x − 1, [1, 2], dda = 6                      | R0 gives x₀ = 2 (b); n = 11/12/13; Newton 5/6/7                | N/A                           |
| Zero denominator | Secant with f(xₙ) = f(xₙ₋₁) ≠ 0 (e.g. f = x², 1, −1) | status `error`, code `zero-denominator`, rows kept             | Specific message naming n, xₙ |
| Exact root hit   | f(xₙ) = 0 (Steffensen f = x − 1, [0, 2], dda = 0)    | x₁ = 1, x₂ = 1; `converged` at n = 2                           | N/A                           |
| x₁ = x₀          | Secant, x₀ = x₁ = 2                                  | Field message on x₁; Run disabled                              | No algorithm call             |
| NaN / ∞ / cap    | as Lab 1                                             | `undefined-value` / `overflow` / `diverged` / `max-iterations` | Same messages as Lab 1        |

</frozen-after-approval>

## Code Map

As built (the pre-build plan pointed at the same places; `shared-fields.ts` is new).

- `src/lib/methods/scalar-iterate.ts` -- `scalarIterate` takes a one-point `step(x)` or a given `x1` with `twoPointStep(x, previous)`.
- `src/lib/methods/types.ts` -- `MethodErrorCode` gains `zero-denominator`.
- `src/lib/methods/starting-value.ts` -- `startByRuleR0` (R0, and "f(a) undefined" before any row), used by Newton and Steffensen.
- `src/lib/methods/lab2/{secant,steffensen}.ts` + `lab2.test.ts`.
- `src/labs/shared-fields.ts` -- f, a/b, dda, ε, the cap, the a < b check, the R0 formula and the input limits, shared by Labs 1 and 2.
- `src/labs/lab-1.ts` -- exports `newtonMethod` for Lab 2's comparisons.
- `src/labs/lab-2.ts` + `lab-2.test.ts`, `registry.ts` -- the lab definition, presets, comparisons and `comparisonOnly` Newton inputs.
- `src/labs/types.ts`, `compare.ts`, `fields.ts` -- `ComparisonPreset`, `FunctionPlot` kinds, `findComparisonMethod`/`findComparisonPreset`, range messages.
- `src/components/lab/{charts.ts,results-panel.tsx,comparison-panel.tsx,explanation.tsx,formula.tsx}` -- chord/step drawing, chart titles, one-column paragraphs, formulas that scroll inside their block.
- `src/lib/format.ts` -- `formatLimit` (10⁶, 10⁻¹⁵) for range messages.
- `src/i18n/{en,ro}.ts` -- all Lab 2 keys, `field.x1`, `run.error.zero-denominator`, range messages.

## Tasks & Acceptance

**Execution:**

- [x] `src/lib/methods/{scalar-iterate,types,starting-value}.ts`, `lab1/newton.ts` -- x₁ seed + two-point step, `zero-denominator`, shared R0 start -- Lab 1 tests stay green
- [x] `src/lib/methods/lab2/{secant,steffensen}.ts` + `lab2.test.ts` -- methods; lock every matrix row and count
- [x] `src/labs/{types,compare,shared-fields}.ts`, `lab-1.ts` -- shared fields, comparison-only methods, chord plot kind
- [x] `src/labs/lab-2.ts` + `lab-2.test.ts`, `registry.ts` -- definition, presets, three comparisons with `taskKey`; lock the n-matrix
- [x] `src/components/lab/{charts.ts,results-panel.tsx,comparison-panel.tsx}` + tests -- chord drawing and labels
- [x] `src/i18n/{en,ro}.ts` -- all Lab 2 keys, KaTeX formulas with `⟪⟫` words
- [x] hub, route and lab-1 tests -- Lab 2 ready, Lab 3 as the unbuilt example

**Acceptance Criteria:**

- Given the hub, when it loads, then the Lab 2 card is live and opens `/labs/secant-steffensen`.
- Given Lab 2, when each preset runs, then the form fills and the result, n, table and chord chart appear; each comparison shows n for both methods × ε.
- Given filled inputs, when switching to RO, then all Lab 2 strings and explanations are Romanian and inputs are kept.

## Implementation Notes

- `scalarIterate` takes either a one-point `step(x)` or a given `x1` with a `twoPointStep(x, previous)`, as a typed union, so Lab 1 callers are unchanged and the secant step always has xₙ₋₁. A given x₁ is row 1 with |x₁ − x₀|; past 10¹⁰⁰ it counts as `diverged`.
- `startByRuleR0` in `starting-value.ts` holds R0 with the "f(a) undefined → error before any row" case; Newton and Steffensen both use it. Steffensen returns `x0Rule`, so the results show "chosen by R0".
- `labs/shared-fields.ts` holds f, a/b, dda, ε, the cap, the a < b check and the R0 formula, used by Labs 1 and 2. `newtonMethod` is exported from `lab-1.ts`.
- Comparison-only methods and inputs live in `ReadyLab.comparisonOnly` (`ComparisonPreset` = a preset without a form button). `findComparisonMethod`/`findComparisonPreset` in `compare.ts` serve the runner and the panel. Newton's inputs are built with `deriveField`, the same code as "Derive from f": f′ = `2 * x` / `3 * x ^ 2 - 1`, dda = 2 / 6.
- `FunctionPlot` kinds: `tangent`, `secant`, `steffensen` (all draw f) and `cobweb`. Secant chords start at x₂, since x₁ is given. Each kind has its own chart title and legend name.
- x₁ = x₀ gives `field.error.different-from` on x₁ (numeric equality, so `4/2` vs `2` is caught too).
- Locked counts (ε = 10⁻⁴ / 10⁻⁸ / 10⁻¹²) match the matrix: ex. 1 secant 4/6/6, Newton 4/5/6; ex. 2 secant 6/7/8, Newton 5/6/7; numerical example Steffensen 11/12/13, Newton 5/6/7. Lab 1 counts are unchanged.

## Spec Change Log

Changes made during development, after the review pass, each at the user's request or from the user's review of the running page.

- **Lab wording and numbering (PDF fidelity).** The lab numbers only the two secant examples; the Steffensen one is its unnumbered "Exemplu numeric". The page, ids and keys follow it: "Ex. 3" became "Exemplu numeric" / "Numerical example", `ex3` → `steffensen`, `ex3-newton` → `steffensen-newton`. Ex. 1 says "Aproximează numărul √2 … folosind f(x) = x² − 2", ex. 2 and the numerical example say "rădăcina reală", as in the lab. The Steffensen start text states f(x₀)·f″(x₀) > 0 before rule R0. A test keeps Lab 2 copy from naming an example the page doesn't have.
- **Comparison tasks state Newton's inputs plainly** (same f and [a, b], f′ derived from f, x₀ = 2 from R0), without "the lab doesn't say". Lab 1's √ comparison task got the same treatment.
- **Romanian copy** in an academic register: intro rewritten, the secant idea reordered (convergence first, then how xₙ₊₁ is built).
- **Layout.** Plain explanation paragraphs stack in one column, so they read top to bottom. Display formulas get `min-w-0`: the secant formula had widened phone pages to 432 px at 390 px; it now scrolls inside its block. Checked in headless Chrome at 360/390/768/1024/1280 px, EN and RO: no horizontal scroll.
- **Input limits** (both labs, see `labs-catalog.md` Shared rules): values in [−10⁶, 10⁶], ε in [10⁻¹⁵, 1], cap 1–100 000, Lab 1's c in (0, 10⁶] and k in 2–100, with EN/RO range messages. This also closes review finding 20: x₀ beyond 10¹⁰⁰ can no longer be typed.
- **Comments** in the files Lab 2 touched rewritten to explain why, once, where the code acts on it.
- **Code Map** now lists what was built (review finding 14).

Kept as is: the Steffensen formula shows n = 0, 1, 2, … where the lab writes n ∈ ℕ*, because the lab's own step 2 computes x₁ with the same formula. Comparison formulas write decimals with a point (x₁ = 1.4) in both languages, as Lab 1 does (0.25), matching what the inputs accept; Romanian prose labels use a comma.

- **Comparison inputs and short tasks (2026-11-19, from Lab 4).** Every comparison card now lists each row's inputs (f, [a, b], x₀, x₁, f′, dda, "x₀: Regula R0") in a "Date de intrare" block built from the presets. The Cerința lines keep only the task plus one sentence on what the lab leaves open and the list can't show: "Pentru metoda tangentei, f′ este calculată din f, iar x₀ este dat de regula R0." This replaces the frozen line's "says what the lab leaves open" by listing the values; the open choices are unchanged.

## Review Triage Log

Review pass 1 (blind = B, edge-case = E, verification-gap = VG).

| #   | Source | Finding                                                                                                      | Verdict | Evidence                                                                                                                                                           | Route                                             |
| --- | ------ | ------------------------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 1   | B      | Secant blames x₁ when f(x₀) is undefined                                                                     | medium  | Probe: `sqrt(x)`, x₀ = −1, x₁ = 4 → `undefined-value` at n = 1, x = 4, a valid point; CAP-9 wants the specific cause                                               | patch                                             |
| 2   | VG     | Translated legend names for the secant/Steffensen step traces are never asserted                             | low     | The `PlotlyChart` stub in `results-panel.test.tsx` drops `spec`; `charts.test.ts` uses fixed labels, so swapping the keys in `results-panel.tsx` passes every test | patch                                             |
| 3   | B, E   | Secant chart: a skipped chord also drops the dotted line to a computed xₙ₊₁                                  | low     | `charts.ts` `continue`s before the drop-line push when `before` is missing or has no f                                                                             | patch (move the drop line before the chord check) |
| 4   | B      | RO legend "Pașii metodei" doesn't name the method                                                            | low     | EN says "Steffensen steps", RO title says "pașii metodei lui Steffensen"                                                                                           | patch                                             |
| 5   | B      | EN zero-denominator message hangs on a vague "in it"                                                         | low     | `run.error.zero-denominator` in `en.ts`                                                                                                                            | patch                                             |
| 6   | B      | Steffensen failure text never says f must be defined at xₙ + f(xₙ)                                           | low     | A domain error at the helper point reads as "the step from xₙ", and ex. 3 already reaches 7                                                                        | patch (one sentence, EN/RO)                       |
| 7   | B      | Secant explanation gives no order of convergence                                                             | low     | Steffensen's says "quadratically"; nothing explains secant 4/6/6 vs Newton 4/5/6                                                                                   | patch (one sentence, EN/RO)                       |
| 8   | B      | Steffensen text vs ex. 3 numbers (11/12/13 vs 5/6/7) unexplained                                             | low     | Quadratic only near the root; from x₀ = 2 the helper point is 7 and the first steps are slow                                                                       | patch (one sentence, EN/RO)                       |
| 9   | E      | Steffensen: x + f(x) rounds to x when f is tiny, so the run stops with `zero-denominator`                    | low     | Real only for contrived f (1e-20·(x − 1)); probe: ex. 3 converges for ε down to 10⁻²⁰. Fix adds a guard                                                            | rejected                                          |
| 10  | E      | Secant: f differences underflow near the root → `zero-denominator`                                           | low     | Probe: ex. 1 and ex. 2 converge for ε down to 10⁻²⁰ (the exact-root rule catches it). Fix adds a guard                                                             | rejected                                          |
| 11  | B      | Secant evaluates f about three times per step                                                                | low     | Correct results; it only costs time. Passing stored values adds plumbing                                                                                           | rejected                                          |
| 12  | B      | `ScalarIterateInput` union isn't strict (`x1` with `step` silently ignored)                                  | low     | No caller passes both; `?: never` fields add surface for an unreachable mistake                                                                                    | rejected                                          |
| 13  | B      | `newtonPreset` derives at module load and could take the registry down; ex2/ex3 Newton presets are identical | false   | The inputs are fixed literals, and `lab-2.test.ts` locks the derived values, so a failure shows up in tests, not at run time. Duplicate presets are harmless       | rejected                                          |
| 14  | B      | Spec Code Map is stale and the matrix lacks a Steffensen zero-denominator row                                | low     | The fix would edit this build's spec                                                                                                                               | rejected (spec edit)                              |
| 15  | B      | Secant results don't show x₁ as a given start                                                                | low     | Row 1 of the table shows x₁, and the explanation says it is given; a stat adds a UI branch                                                                         | rejected                                          |
| 16  | B      | Some tests are weaker than their names (Newton `x0Rule`, RO metadata for Lab 2)                              | low     | The asserted behaviour is correct; RO Lab 2 strings are covered by the hub, lab-page and comparison tests                                                          | rejected                                          |
| 17  | B      | `lab-2.ts` imports `newtonMethod` from `lab-1.ts`                                                            | low     | Works today; revisit when Lab 3 also compares with Newton                                                                                                          | rejected                                          |
| 18  | E      | Secant with maxIter = 1 stops at x₁ without a computed step                                                  | false   | n counts iterate indices and x₁ is n = 1, so cap 1 means n ≤ 1; the run says `max-iterations`, not converged                                                       | rejected                                          |
| 19  | E      | x₁ within ε of x₀ reports converged at a non-root                                                            | false   | That is the lab's own stopping rule: start at n = 1 while \|x₁ − x₀\| ≥ ε                                                                                          | rejected                                          |
| 20  | E      | Secant with \|x₀\| > 10¹⁰⁰ reports overflow at x₁ instead of diverged                                        | low     | Needs a typed x₀ beyond 10¹⁰⁰; fix adds a guard                                                                                                                    | rejected                                          |

## Verification

**Commands:**

- `bun run typecheck` -- no errors
- `bun run test` -- all suites pass
- `bun run build` -- succeeds
- `bun run format:check` -- clean

**Manual checks:**

- Run every Lab 2 preset and comparison in EN and RO; chart toolbar works; no horizontal scroll at phone width.

**Validation run (2026-11-15):** typecheck, 425 tests in 28 files, format check and production build pass. Headless Chrome on the production build, EN and RO at 390 and 1280 px: every preset runs (n = 4, 6, 11), each draws its charts, all three comparisons fill, no horizontal scroll, no console errors, and switching language keeps an edited input. Hovering and the chart toolbar still need a person.
