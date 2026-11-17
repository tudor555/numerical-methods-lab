---
title: "Lab 4 (third-order iterative methods)"
type: "feature"
created: "2026-11-17"
status: "done"
baseline_commit: "e08ce1656bf8b1c5b3d34f81f528d5eb1ad12d81"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/SPEC.md"
  - "{project-root}/docs/stack.md"
  - "{project-root}/docs/labs-catalog.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Lab 4 is a "coming soon" card. The combined tangent method and the third-order square root can't be read about, run or compared with the lab's reference methods.

**Approach:** Ship Lab 4 on the Lab 3 pattern: 4a combined tangent and 4b third-order square root as pure methods, a lab definition with the lab's examples as presets and its comparisons (4a vs the tangent method, 4b vs 1b), EN/RO explanations, and the hub card switched on at `/labs/third-order`.

## Boundaries & Constraints

**Always:**

- Follow the lab text and `labs-catalog.md` Lab 4. 4a: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ) − f(xₙ − f(xₙ)/f′(xₙ))/f′(xₙ). 4b: xₙ₊₁ = xₙ(xₙ² + 3a)/(3xₙ² + a), x₀ = a. Both compute x₁ as a separate step, then loop from n = 1 while |xₙ − xₙ₋₁| ≥ ε; output n and xₙ; editable cap, default 1000.
- Inputs as the lab lists them. 4a: a, b, f, df, ε, x₀ entered directly (no R0, no f″ field; a, b set the chart range); df has "Derive from f". The 4a start text states the lab's condition f(x₀)·f″(x₀) > 0 as guidance, like Lab 3's Chebyshev text; it is not checked. 4b: a (symbol `a`, label "Radicand" via `field.c`, a > 0, at most 10⁶), ε.
- 4a: if f(xₙ) = 0 exactly, xₙ₊₁ = xₙ; f′(xₙ) = 0 otherwise is `zero-derivative`; partial table stays.
- Hub topic (replace the existing `lab4.topic`) follows the lab's two headings. EN: "Combined tangent method and third-order square roots". RO: "Metoda combinată a tangentei și calculul radicalilor cu metoda de ordinul 3". Titles stay. The intro has no lab number; the RO intro uses Lab 3's register ("Rezolvă …", "Compară apoi …").
- Lab wording and numbering: 4a "Ex. 1" (approximate the number √2, f = x² − 2) and "Ex. 2" (the real root of x³ − x − 1 = 0); 4b "Ex. 1" (√2, a = 2) and "Ex. 2". RO uses the lab's names ("Metoda combinată a tangentei", "Calculul radicalilor cu metoda de ordinul 3") and course terms (metoda tangentei, iterația inițială, precizia dorită). Each comparison card has its "Cerința" line, stating the other method's inputs as plain facts. The 4b cards name the reference method as the lab does: "the iterative method obtained from the tangent method" / "metoda iterativă obținută din metoda tangentei" (that is 1b; its row keeps Lab 1's name "Tangent method").
- Comparisons, in the lab's order, each over ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}: 4a ex. 1 vs Newton, 4a ex. 2 vs Newton, 4b ex. 1 vs 1b, 4b ex. 2 √3 vs 1b, 4b ex. 2 √5 vs 1b.

**Decisions:**

- 4b ex. 2 gets two presets and two comparison cards: a = 3 → √3 and a = 5 → √5. Both Cerința lines paraphrase the lab's task (approximate √5, compare with the method obtained from the tangent method) and add one plain fact: "The method converges to √a, so a = 3 gives √3 and √5 uses a = 5." Never words like typo, mistake or inconsistent in UI copy.
- Newton in the 4a comparisons uses the example's f′ (2x, 3x² − 1), [1, 2] and x₀ = 2 entered directly, as in Lab 3. 1b in the 4b comparisons uses c = a, k = 2 (its x₀ = c for c > 1 equals 4b's x₀ = a).
- 4a chart: per step, the solid step trace has two segments: Newton's tangent from (xₙ, f(xₙ)) to (yₙ, 0), yₙ = xₙ − f/f′, and a line with the same slope f′(xₙ) from (yₙ, f(yₙ)) to (xₙ₊₁, 0). The vertical from (yₙ, 0) to (yₙ, f(yₙ)) joins the dotted drop-line trace. Defensive fallback to one straight segment when f′(xₙ) is 0 or not finite, or f(yₙ) is undefined or not finite; the app's runs never reach it (the step fails first), so it is tested with fixture rows only. Own chart title and legend name.
- 4b chart: f = x² − a with Lab 3's tangent-hyperbola steps (`halley` plot kind, df = 2x, ddf = 2, no interval: range from the iterates, as 1b). The chart title and legend therefore name Halley's tangent hyperbolas, and that is intended: the 4b explanation says in one sentence that the iteration is Halley's method applied to x² − a, which also accounts for order 3. `valueColumn` is `x_n^2 - a`.
- 4b shows the exact value √a (error column and error trace), like 1b. 4a has none (f is free text, as in Labs 1–3).
- The |xₙ − xₙ₋₁| log chart stays for both methods.

**Never:** Implement Labs 5–13, add dependencies or e2e tests, add methods or comparisons the lab doesn't ask for, change Lab 1–3 results or locked counts.

## I/O & Edge-Case Matrix

| Scenario           | Input / State                                | Expected Output / Behavior                                     | Error Handling         |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------- | ---------------------- |
| 4a ex. 1           | f = x² − 2, f′ = 2x, [1, 2], x₀ = 2          | → 1.41421356…; n = 3/4/4 for ε = 10⁻⁴/10⁻⁸/10⁻¹²; Newton 4/5/6 | N/A                    |
| 4a ex. 2           | f = x³ − x − 1, f′ = 3x² − 1, [1, 2], x₀ = 2 | → 1.32471795…; n = 4/5/5; Newton 5/6/7                         | N/A                    |
| 4b ex. 1           | a = 2                                        | → 1.41421356…; n = 3/4/4; 1b 4/5/6                             | N/A                    |
| 4b ex. 2 √3        | a = 3                                        | → 1.73205080…; n = 3/4/4; 1b 4/5/6                             | N/A                    |
| 4b ex. 2 √5        | a = 5                                        | → 2.23606797…; n = 4/4/5; 1b 5/6/6                             | N/A                    |
| 4a zero derivative | f = x² − 2, f′ = 2x, x₀ = 0                  | status `error`, code `zero-derivative`, row 0 kept             | Same message as Newton |
| 4a exact root hit  | f = x − 1, f′ = 1, x₀ = 1                    | x₁ = 1; `converged` at n = 1                                   | N/A                    |
| 4a f(yₙ) undefined | f = ln(x), f′ = 1/x, x₀ = 3 (y₀ < 0)         | status `error`, code `undefined-value`, row 0 kept             | Same message as Lab 1  |
| 4b root hit        | a = 1                                        | x₁ = 1; `converged` at n = 1                                   | N/A                    |
| 4b invalid a       | a = 0, a = −2, a = 2·10⁶                     | rejected next to the field; nothing runs                       | Field error            |
| NaN / ∞ / cap      | as Lab 1                                     | `undefined-value` / `overflow` / `diverged` / `max-iterations` | Same messages as Lab 1 |

</frozen-after-approval>

## Code Map

- `src/lib/methods/scalar-iterate.ts` -- one-point `step` driver; reuse unchanged. An `EvaluationError` from f(yₙ) (e.g. ln of a negative) becomes `undefined-value`.
- `src/lib/methods/lab3/chebyshev.ts` -- shape to copy for 4a (direct x₀, f(xₙ) = 0 → xₙ, `zero-derivative`).
- `src/lib/methods/lab1/kth-root.ts` -- shape to copy for 4b (pass `f: x => x*x - a` for the value column).
- `src/labs/lab-1.ts` -- export `kthRootMethod` (`id: "1b"`); nothing else changes.
- `src/labs/lab-3.ts:138,166-173` -- private `base` and `newtonPreset`. Move both into a new `src/labs/comparison-presets.ts` (imports `newtonMethod`/`kthRootMethod` from `lab-1.ts`; no cycle) with `newtonPreset(id, f, df)` (same values as today: a = 1, b = 2, x₀ = 2 manual, ε 10⁻⁴, cap 1000) and `kthRootPreset(id, c)` (k = 2). Lab 3 imports it; its values stay identical.
- `src/labs/compare.ts:13-14` -- presets are found by first id match across `presets` and `comparisonOnly.presets`, so every id below must be unique in Lab 4.
- `src/labs/shared-fields.ts` -- `functionField`, `derivativeField`, `intervalFields`, `epsField`, `maxIterField`, `EPS_SET`, `checkInterval`, `valueRule`, `VALUE_LIMIT`.
- `src/labs/types.ts:46-60` -- `FunctionPlot`: add `{ kind: "combined-tangent"; f; df; interval? }`.
- `src/components/lab/charts.ts:140-230` -- step loop and `stepName` map; `ChartLabels` gets `combinedSteps`.
- `src/components/lab/results-panel.tsx:18-25,71-72` -- `CHART_TITLE` and labels.
- `src/labs/registry.ts` -- `lab4` replaces `planned(4, …)`; `PlannedNumber` drops 4.
- `src/i18n/{en,ro}.ts` -- `lab4.*` keys; replace `lab4.topic`; add `chart.combinedTangent`, `chart.trace.combinedSteps`.

**Ids and keys:** methods `4a`, `4b`. Presets `combined-ex1`, `combined-ex2` (4a), `root-ex1`, `root-ex2-sqrt3`, `root-ex2-sqrt5` (4b). Comparisons use the same five ids. Comparison-only presets `<id>-newton` (4a) and `<id>-kth-root` (4b). Keys `lab4.method.{combinedTangent,thirdOrderRoot}.*`, `lab4.preset.{combinedEx1,combinedEx2,rootEx1,rootEx2Sqrt3,rootEx2Sqrt5}`, `lab4.compare.<same>` and `.task`.

**Tests to update** (Lab 4 becomes ready, Lab 5 `newton-systems` is the unbuilt example):

- `src/labs/lab-1.test.ts:20-30` -- ready slugs, test title "Labs 1–4", unbuilt slug.
- `src/components/hub.test.tsx:36-45` -- "5–13", `slice(4)`, length 9, `Lab ${i + 5}`, `href=` count 4.
- `src/app/labs/[slug]/page.test.tsx:34-38,47,92` -- ready-lab `it.each`, unbuilt slug.
- `src/components/lab/results-panel.test.tsx:21-23,220-222` -- `allMethods` plus comment, chart-title `it.each` (add combined-tangent).
- `src/components/lab/charts.test.ts:13-27` -- `ChartLabels` fixture gets `combinedSteps`.
- `src/components/lab/comparison-panel.test.tsx` -- Lab 4 block like Lab 3's (:154-215), with Cerința check.
- `src/components/lab/lab-page.test.tsx` -- Lab 4 block like Lab 3's (:143-166).

## Tasks & Acceptance

**Execution:**

- [x] `src/lib/methods/lab4/{combined-tangent,third-order-root}.ts` + `lab4.test.ts` -- methods; lock every matrix row and count
- [x] `src/labs/comparison-presets.ts`, `lab-1.ts`, `lab-3.ts` -- shared comparison presets, export `kthRootMethod`; Lab 1 and 3 tests stay green
- [x] `src/labs/types.ts`, `src/components/lab/{charts.ts,results-panel.tsx}` + tests -- `combined-tangent` kind (two solid segments, vertical in the drop trace, fixture-tested fallback), title, legend name
- [x] `src/labs/lab-4.ts` + `lab-4.test.ts`, `registry.ts` -- definition, five presets, five comparisons with `taskKey`; lock the n-matrix, preset and comparison ids
- [x] `src/i18n/{en,ro}.ts` -- all Lab 4 keys, KaTeX formulas with `⟪⟫` words, native RO; replaced topic
- [x] tests listed above -- Lab 4 ready, Lab 5 as the unbuilt example, Lab 4 panel and page blocks
- [x] `docs/labs-catalog.md` -- Lab 4: number the examples as the lab does (4a Ex. 1–2, 4b Ex. 1–2), 4a's x₀ entered directly with a, b as chart range; Shared rules input limits add 4b's a in (0, 10⁶]

**Acceptance Criteria:**

- Given the hub, when it loads, then the Lab 4 card is live and opens `/labs/third-order`.
- Given Lab 4, when each preset runs, then the form fills and the result, n, table and chart appear; each comparison shows n for both methods × ε.
- Given filled inputs, when switching to RO, then all Lab 4 strings and explanations are Romanian and inputs are kept.

## Implementation Notes

- `comparison-presets.ts` also exports `exampleBase` (a = 1, b = 2, ε = 10⁻⁴, cap 1000), the old private `base` of Lab 3, so Lab 3 and Lab 4 share it. Lab 3's preset values are unchanged.
- The 4a chart computes yₙ and f(yₙ) from the plot's own f and f′ (`combinedHelper` in `charts.ts`); the drop-line trace holds the vertical at yₙ before the drop at xₙ₊₁.
- 4b has no `errorKeys` and no failure text: with a > 0 and x₀ = a every iterate is positive and the denominator 3xₙ² + a never vanishes. NaN, ∞, divergence and the cap still go through the shared driver.
- Tab names: "4a · Combined tangent" / "4a · Metoda combinată a tangentei" and "4b · Square roots" / "4b · Calculul radicalilor" ("third-order root" would read as a cube root). Comparison row names: "Combined tangent method" and "Third-order method" / "Metoda de ordinul 3"; the reference rows keep Lab 1's "Tangent method".

## Spec Change Log

## Review Triage Log

Review pass 1 (blind = B, edge-case = E, verification-gap = VG).

| #   | Source | Finding                                                                                                           | Verdict | Evidence                                                                                                                                                 | Route                           |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | VG     | The 4a prepared plot's `f`/`df` wiring is never checked; a mis-wired `df` draws wrong steps with every test green | low     | `lab-4.test.ts` matches only `kind` and `interval`; chart tests build their own plot; the results-panel stub drops coordinates                           | patch (assert `f(2)`, `df(2)`)  |
| 2   | B      | 4b `idea` says "only arithmetic" follows from being Halley's method                                               | low     | 1b on the same f is arithmetic-only too; Halley explains the cubic order                                                                                 | patch (EN/RO copy)              |
| 3   | B      | The √3 card opens with "Approximate √5…" and names a = 3 only at the end; "√5 uses a = 5" reads awkwardly         | low     | `lab4.compare.rootEx2Sqrt3.task` in EN and RO                                                                                                            | patch (reorder, symmetric fact) |
| 4   | B      | Comparison-panel Cerința check for 4a can't fail: "metoda tangentei" is a substring of the 4b phrase              | low     | `comparison-panel.test.tsx` Lab 4 block                                                                                                                  | patch (negative assertion)      |
| 5   | B      | No render test for the 4b tab (fields, symbol `a` with the radicand label, no "Derive from f")                    | low     | `lab-page.test.tsx` renders only the default 4a tab                                                                                                      | patch (one test)                |
| 6   | B      | 4b's radicand rule duplicates Lab 1's inline rule for c; the catalog says limits live in `shared-fields.ts`       | low     | `lab-4.ts` and `lab-1.ts` both inline `{ positive: true, max: VALUE_LIMIT }`                                                                             | patch (shared `radicandRule`)   |
| 7   | B      | 4a reports false convergence when f′(xₙ) = ±∞ (f = ∛x − 1, f′ = 1/(3∛x²), x₀ = 0)                                 | false   | Probed: the compiled f′ throws `overflow` at 0, so the run stops with `overflow`; typed expressions are always compiled                                  | rejected                        |
| 8   | E      | 4b with a ≪ ε (a = 10⁻⁶, ε = 10⁻⁴) stops at n = 1 near 3a, not √a                                                 | low     | Probed: converged, x₁ ≈ 3·10⁻⁶. This is the lab's own x₀ = a with an absolute stopping rule; a students never meet; a fix changes the frozen input limit | rejected                        |
| 9   | E      | Exact value header renders `\sqrt{1e-7}` for tiny a                                                               | low     | KaTeX shows √(1e−7), not raw TeX; same as 1b today; cosmetic for inputs nobody uses                                                                      | rejected                        |
| 10  | E      | A far helper point yₙ / f(yₙ) isn't range-limited and squashes the 4a chart                                       | low     | Axes use Plotly autorange, so a far helper widens them; never happens on the lab's examples; a fix adds a guard (Steffensen omits its helper instead)    | rejected                        |
| 11  | B      | The x-range ignores yₙ, so the vertical and parallel segment can be clipped; no stated reason                     | false   | `xRange` only sets the f-curve sample range; the axes autorange over every trace, so nothing is clipped (row 10 covers the real effect)                  | rejected                        |
| 12  | B      | An error at the helper point names xₙ, not yₙ (f = ln x, x₀ = 3)                                                  | low     | The message says "in the step from n = 0, xₙ = 3", which is accurate; the 4a failure text explains yₙ; a dedicated message adds keys and `errorKeys`     | rejected                        |
| 13  | B      | `kthRootPreset` assumes c > 1 without enforcing it                                                                | false   | Its only callers pass 2, 3 and 5                                                                                                                         | rejected                        |
| 14  | B      | Exact-root step draws zero-length segments, untested                                                              | low     | Zero-length segments are invisible; no user-visible effect                                                                                               | rejected                        |
| 15  | B      | `results-panel.test.tsx` picks the convergence chart by index `[1]`                                               | low     | Test-only fragility; chart order is fixed in `ResultsPanel`                                                                                              | rejected                        |

## Verification

**Commands:**

- `bun run typecheck` -- no errors
- `bun run test` -- all suites pass
- `bun run build` -- succeeds
- `bun run format:check` -- clean

**Manual checks:**

- Run every Lab 4 preset and comparison in EN and RO; chart toolbar works; no horizontal scroll at phone width.

**Results (2026-11-17):**

- typecheck clean; 32 files, 626 tests pass; format clean; production build succeeds.
- Coverage: `lab4/combined-tangent.ts`, `lab4/third-order-root.ts`, `lab-4.ts`, `comparison-presets.ts` and `charts.ts` at 100% lines, branches and functions.
- Every row of the I/O matrix is locked in `lab4.test.ts` and `lab-4.test.ts`, including the n-matrix of all five comparisons (both methods × three ε).
- `/labs/third-order` served by `next start` in EN and RO: no `katex-error`, no `⟦key⟧`. Every Lab 4 formula and inline `$…$` parses with KaTeX `throwOnError`.
- Not yet done: the browser checks above (preset runs, chart toolbar, phone width).
