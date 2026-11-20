---
title: "Lab 5 (Newton's method for 2×2 nonlinear systems)"
type: "feature"
created: "2026-11-19"
status: "done"
baseline_commit: "3b8f25c44db1b224daeca3994378d2b2a2c649e2"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/SPEC.md"
  - "{project-root}/docs/stack.md"
  - "{project-root}/docs/labs-catalog.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Lab 5 is a "coming soon" card. Newton's method for a 2×2 nonlinear system and its modified form can't be read about, run or compared, and the app has no path yet for a method whose iterate is a point (x, y).

**Approach:** Add a system path next to the scalar one (2-D rows and result, a system driver, results panel, table, path chart, comparison cells), then ship Lab 5 on it: 5a Newton and 5b modified Newton, the lab's examples as presets, ex. 3 as the one comparison, EN/RO explanations, and the hub card live at `/labs/newton-systems`.

## Boundaries & Constraints

**Always:**

- Follow the lab text and `labs-catalog.md` Lab 5. J = Fₓ·G_y − F_y·Gₓ. 5a: xₙ₊₁ = xₙ − (F·G_y − G·F_y)/J, yₙ₊₁ = yₙ − (Fₓ·G − Gₓ·F)/J, all at (xₙ, yₙ). 5b (the lab's step 4′): F, G at (xₙ, yₙ); partials and J fixed at (x₀, y₀). Both compute (x₁, y₁) as a separate step, then loop from n = 1 while |xₙ − xₙ₋₁| ≥ ε or |yₙ − yₙ₋₁| ≥ ε; output n, xₙ, yₙ; editable cap, default 1000.
- Inputs as the lab lists them, for both methods: x₀, y₀, F, G, ∂F/∂x, ∂F/∂y, ∂G/∂x, ∂G/∂y (typed expressions in x and y), ε. Each partial has a "Derive from F" / "Derive from G" button (math.js `derivative` in that field's variable). x₀, y₀ in [−10⁶, 10⁶].
- F = G = 0 exactly at (xₙ, yₙ) → (xₙ₊₁, yₙ₊₁) = (xₙ, yₙ), as Labs 1–4 do for f(xₙ) = 0. J = 0 otherwise → new code `zero-jacobian` (5b: at n = 0, since J is fixed). Partial table stays (CAP-9).
- A system run fails on NaN, ±∞ or |xₙ| or |yₙ| > 10¹⁰⁰ in either component, with messages that name the point (xₙ, yₙ), not xₙ alone.
- Results: tiles xₙ, yₙ, n, then the starting point (x₀, y₀). Table: n, xₙ, yₙ, F(xₙ, yₙ), G(xₙ, yₙ), |xₙ − xₙ₋₁|, |yₙ − yₙ₋₁|. Charts: the iteration path in the (x, y) plane over the curves F = 0 and G = 0, and both differences on a log scale with ε (CAP-5, CAP-6).
- Lab wording and numbering: "Ex. 1", "Ex. 2" (two starts), "Ex. 3" (modified Newton on ex. 2's system). RO uses the lab's names ("Metoda lui Newton pentru sisteme neliniare", "Metoda lui Newton modificată") and course terms (punctul inițial, precizia, soluția exactă). Intro without the lab number, RO in Lab 4's register ("Rezolvă …", "Compară apoi …"). The comparison card has its short "Cerința" line and the input list.
- Ex. 2 shows the exact solution, (1, 3) from (0.9, 3.1) and (3, 1) from (2.9, 1.1): exact tile, error tile and an error column/trace using max(|xₙ − x*|, |yₙ − y*|).

**Decisions:**

- Presets. 5a: `ex1` (1.2, 1.7), `ex2-first` (0.9, 3.1), `ex2-second` (2.9, 1.1), all ε = 10⁻⁴ with the lab's F, G and partials. 5b: `ex3-first`, `ex3-second` (ex. 2's system from each start, ε = 10⁻⁴). No 5b ex. 1 preset: the lab asks modified Newton only on ex. 2. Defaults: 5a = `ex1`, 5b = `ex3-first`.
- One comparison, `ex3`: rows 5b and 5a from (0.9, 3.1), then 5b and 5a from (2.9, 1.1), over ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²} (`EPS_SET`, user's choice 2026-11-19). Its Cerința states plainly, as facts, that both of ex. 2's starting points are used and that it runs the three precisions.
- The exact solution shows for both methods while F and G are ex. 2's text (trimmed) and (x₀, y₀) equals one of its two starts as numbers; so ex. 2 and ex. 3 presets show it, and editing ε, the cap or a partial keeps it. Comparison cells don't show it.
- Tab ids 5a/5b, as the catalog numbers them. Tabs "5a · Newton" / "5a · Metoda lui Newton", "5b · Modified Newton" / "5b · Newton modificată"; comparison row names "Newton's method" / "Metoda lui Newton" and "Modified Newton" / "Metoda lui Newton modificată".
- The "Derive from f" label becomes "Derive from {source}" / "Calculează din {source}" (source = the `derive.from` field id) for every lab, so Labs 1–4 still read "Derive from f".

**Never:** Implement Labs 6–13, add dependencies or e2e tests, add methods, presets or comparisons the lab doesn't ask for, change Labs 1–4 results, counts or copy (other than the derive label's parameter).

## I/O & Edge-Case Matrix

| Scenario          | Input / State                          | Expected Output / Behavior                                       | Error Handling                   |
| ----------------- | -------------------------------------- | ---------------------------------------------------------------- | -------------------------------- |
| 5a ex. 1          | lab's F, G, partials; (1.2, 1.7), 10⁻⁴ | → (1.2342745, 1.6615265); n = 3                                  | N/A                              |
| 5a ex. 2 first    | (0.9, 3.1), 10⁻⁴                       | → (1, 3) within 10⁻¹⁰; n = 3; exact (1, 3) shown                 | N/A                              |
| 5a ex. 2 second   | (2.9, 1.1), 10⁻⁴                       | → (3, 1) within 10⁻⁹; n = 3; exact (3, 1) shown                  | N/A                              |
| 5b ex. 3 first    | ex. 2 system, (0.9, 3.1)               | n = 4/8/12 for ε = 10⁻⁴/10⁻⁸/10⁻¹²; 5a n = 3/4/5; exact shown    | N/A                              |
| 5b ex. 3 second   | ex. 2 system, (2.9, 1.1)               | n = 4/9/13; 5a n = 3/4/5; exact shown                            | N/A                              |
| 5b ex. 1 (locked) | ex. 1 system, (1.2, 1.7)               | n = 3/6/9; 5a n = 3/4/4; no exact                                | N/A                              |
| Root at start     | ex. 2 system, (1, 3)                   | (x₁, y₁) = (1, 3); `converged` at n = 1                          | N/A                              |
| Zero Jacobian     | F = x + y, G = x + y − 1, (0, 0)       | status `error`, code `zero-jacobian`, row 0 kept (5a and 5b)     | Message names (x₀, y₀)           |
| Undefined value   | ex. 2 system, (−5, −5)                 | status `error`, code `undefined-value`, row 0 kept, G cell empty | Message names the point          |
| Invalid input     | F = `x + z`, y₀ = 2·10⁶, ε = 0         | rejected next to the field; nothing runs                         | Field error                      |
| NaN / ∞ / cap     | as Lab 1, per component                | `undefined-value` / `overflow` / `diverged` / `max-iterations`   | System wording of Lab 1 messages |

</frozen-after-approval>

## Code Map

**Method layer**

- `src/lib/methods/types.ts` -- split codes: `ScalarErrorCode` (today's five), `SystemErrorCode = "zero-jacobian" | "undefined-value" | "overflow" | "diverged"`, `MethodErrorCode` = their union (for `MethodStepError`). `MethodError` and `RunResult` gain a code type parameter (default scalar), so `ScalarRunResult` is unchanged. `SystemIterationRow { n, x, y, F, G, dx, dy }` (F, G, dx, dy nullable like `fx`, `diff`); `SystemRunResult` with value `{ x, y }` and an error that also carries `y`.
- `src/lib/methods/scalar-iterate.ts` -- model for a new `system-iterate.ts` (`step: (x, y) => [x, y]`, x₁ first, F/G cells null when undefined, `MethodStepError`/`EvaluationError` → their code). The scalar driver doesn't change.
- `src/lib/methods/lab4/combined-tangent.ts` -- shape for `lab5/newton-system.ts`: `newtonSystem`, `modifiedNewtonSystem`. 5b computes its partials and J₀ inside the first step (cached), so a failure there is a driver error at n = 0, not an escaped throw.

**Lab layer**

- `src/labs/types.ts` -- `ExpressionField.derive.variable?`; `SystemPlot { kind: "system"; F; G }`; `SystemExactSolution { x; y }`; `PreparedRun` = scalar (today's shape plus optional `kind?: "scalar"`, so Labs 1–4 don't change) | `{ kind: "system"; run: () => SystemRunResult; plot: SystemPlot; eps; exact? }`. `errorKeys` stays `Partial<Record<ScalarErrorCode, …>>`.
- `src/labs/fields.ts:115` -- `deriveField` derives in `field.derive.variable ?? source.variables[0]`.
- `src/labs/shared-fields.ts` -- add `XY = ["x", "y"]`; reuse `valueRule`, `epsField`, `maxIterField`.
- `src/labs/lab-state.ts` -- `RunView` mirrors the union (`kind`, result, plot, eps, exact); add pure `toRunView(prepared)` that runs it. `lab-page.tsx:57-61` `execute` and the `results-panel.test.tsx:26-33` `view()` helper use it (destructuring loses the union link).
- `src/labs/compare.ts` -- `runComparison` returns `ComparisonCell = { kind: "scalar"; result: ScalarRunResult } | { kind: "system"; result: SystemRunResult } | null`, kind from `prepared.kind`. `comparisonInputs` shows `x0` and `y0` as one `(x_0, y_0) = (0.9, 3.1)` (`;` in RO) when both are visible.
- `src/labs/registry.ts` -- `lab5` replaces `planned(5, …)`; `PlannedNumber` drops 5.

**UI**

- `src/components/lab/results-panel.tsx` -- a thin wrapper picks `SystemResultsPanel` (new `system-results-panel.tsx`) or today's body by `view.kind` before any hook (rules of hooks). The system table is `system-iteration-table.tsx`, reusing `splitRows`/`FULL_TABLE_LIMIT`.
- `src/components/lab/charts.ts` -- `buildPathChart(plot, rows, labels)`: two `contour` traces, z = F and z = G on an 80×80 grid over the padded x and y ranges of the iterates (`xRange` per axis; `PLOT_LIMIT` filter), throwing or non-finite cells → null, `contours: { start: 0, end: 0, size: 1, coloring: "none" }`, `showscale: false`, `showlegend: true`, accent and secondary lines; the path as lines+markers with n in hover. `buildSystemConvergenceChart(rows, eps, labels, exact?)`: dx and dy traces (each drops its own zero/non-finite points), ε line, optional max-norm error trace.
- `src/components/lab/status.tsx:21` -- `runErrorKey` stays scalar; add `systemErrorKey(code)` → `run.systemError.${code}`, params `{ n, point }` (point = `formatPoint`).
- `src/components/lab/comparison-panel.tsx:46-80` -- `ResultCell` switches on `cell.kind`; system cells show n and the point; hint is `compare.systemHint` when every row of the card is a system row.
- `src/components/lab/method-form.tsx:147-151` -- `t("form.derive", { source: field.derive.from })`.
- `src/lib/format.ts` -- `formatPoint(x, y, separator)` → `(1.23, 1.66)` / `(1.23; 1.66)`, each part through `formatValue`.

**Ids and keys**

- Fields: `F`, `G` (symbols `F(x, y)`, `G(x, y)`; labels `field.F` "Function F" / "Funcția F", `field.G`), `Fx`, `Fy`, `Gx`, `Gy` (symbols `\frac{\partial F}{\partial x}` …; label `field.partial` "Partial derivative" / "Derivata parțială"; `derive: { from: "F" | "G", variable: "x" | "y" }`), `x0`, `y0` (symbols `x_0`, `y_0`; labels `field.startX` "Starting point, x" / "Punctul inițial, x", `field.startY`), `eps`, `maxIter`.
- Presets: labels `lab5.preset.{ex1,ex2First,ex2Second,ex3First,ex3Second}` ("Ex. 2: x² + y² = 10, √(x + y) = 2, from (0.9, 3.1)"; RO "Ex. 2: …, din (0,9; 3,1)"); `tex` language-neutral: `x_0 = 0.9,\ y_0 = 3.1`.
- Methods: `lab5.method.{newton,modified}.{tab,title,name,idea,start,failure,chart}`; `lab5.intro`; keep `lab5.title`, `lab5.topic`. Comparison `lab5.compare.ex3` + `.task`. Shared `common.systemStopping`.
- System copy: `result.system.{converged,maxIterations}` (both differences), `result.startPoint`, `result.exactSolution` "Exact solution" / "Soluția exactă" (TeX `(x^*, y^*)`), error tile and column TeX `\max(|x_n - x^*|, |y_n - y^*|)`, `run.systemError.{zero-jacobian,undefined-value,overflow,diverged}`, `compare.systemHint`, `chart.path` "F = 0 and G = 0 with the iteration path", `chart.systemConvergence` "Convergence: |xₙ − xₙ₋₁| and |yₙ − yₙ₋₁| on a log scale", `chart.trace.{curveF,curveG,diffY,systemError}`. Table headers: `n, x_n, y_n, F(x_n, y_n), G(x_n, y_n), |x_n - x_{n-1}|, |y_n - y_{n-1}|`.

**Tests to update** (Lab 5 ready, Lab 6 `nonlinear-systems` the unbuilt example)

- `src/labs/lab-1.test.ts:20-30`, `src/components/hub.test.tsx:36-45`, `src/app/labs/[slug]/page.test.tsx` -- ready list, counts, unbuilt slug.
- `src/labs/lab-2.test.ts:72`, `src/labs/lab-3.test.ts:284` -- `.x0Rule` on a now-union run: narrow on scalar.
- `src/components/lab/results-panel.test.tsx` -- `view()` via `toRunView`; system panel cases.
- `src/components/lab/comparison-panel.test.tsx` -- cell fixtures become `{ kind, result }`; Lab 5 block like Lab 4's.
- `src/components/lab/charts.test.ts` -- labels fixture; path and system convergence cases.
- `src/components/lab/lab-page.test.tsx` (Lab 5 block), `method-form.test.tsx` (derive label), `status.test.tsx` (`systemErrorKey`), `src/labs/fields.test.ts` (derive in y), `src/labs/compare.test.ts` (point input, cell kind), `src/i18n/i18n.test.ts` (key parity covers the new keys).

## Tasks & Acceptance

**Execution:**

- [x] `src/lib/methods/{types,system-iterate}.ts` + `system-iterate.test.ts` -- error code split, system rows/result, driver
- [x] `src/lib/methods/lab5/newton-system.ts` + `lab5.test.ts` -- 5a, 5b; lock every matrix row and count
- [x] `src/labs/{types,fields,shared-fields,lab-state,compare}.ts` + tests -- system prepared run, `toRunView`, derive in y, comparison cells and inputs
- [x] `src/lib/format.ts`, `src/components/lab/{charts.ts,status.tsx,results-panel.tsx,system-results-panel.tsx,system-iteration-table.tsx,comparison-panel.tsx,method-form.tsx,lab-page.tsx}` + tests -- system results, charts, cells, derive label
- [x] `src/labs/lab-5.ts` + `lab-5.test.ts`, `registry.ts` -- definition, five presets, `ex3`, exact rule; lock preset/comparison ids and the n-matrix
- [x] `src/i18n/{en,ro}.ts` -- all keys above, KaTeX formulas with `⟪⟫` words, native RO
- [x] tests listed above -- Lab 5 ready, Lab 6 unbuilt
- [x] `docs/labs-catalog.md` -- Lab 5 example numbering, ex. 3 from both starts over the three ε; Shared rules input limits name y₀

**Acceptance Criteria:**

- Given the hub, when it loads, then the Lab 5 card is live and opens `/labs/newton-systems`.
- Given Lab 5, when each preset runs, then the form fills and xₙ, yₙ, n, the table and both charts appear; ex. 2 and ex. 3 also show the exact solution and error.
- Given the `ex3` card, when it runs, then n and the point appear for 5b and 5a from both starts at each ε.
- Given a partial-derivative field, when "Derive from F" is pressed, then it fills with the derivative in that field's variable.
- Given filled inputs, when switching to RO, then every Lab 5 string is Romanian and inputs are kept.

## Implementation Notes

- The first implementation pass was stopped by the user midway (2026-11-19); the work was checked and finished in the main session from the working tree.
- `src/test/runs.ts` (`scalarRun`, `scalarView`, `systemView`) narrows the new unions in tests, so Lab 1–4 tests read `x0Rule` and `exact` without casts. Comparison-cell reads in Lab 1–4 tests moved from `cell.n` to `cell.result.n`.
- Shared UI pieces moved to `results-common.tsx` (`Stat`, `useChartLabels`) so the scalar and system panels use one tile and one label set.
- 5b computes its partials and J₀ lazily inside the first step and caches them (`modifiedNewtonSystem`), so J₀ = 0 or an undefined partial is a driver error at n = 0.
- Lab 5 "start" paragraphs use the impersonal register of Labs 3–4 ("se introduc direct" / "are entered directly"), not "you enter".
- `formatValue` prints 1.0000000000000002 as 1, so ex. 2 results show as (1, 3) in the cells.

## Spec Change Log

## Review Triage Log

Readiness review before approval (2026-11-19), all patched into this spec: error-key typing (code split, `systemErrorKey`); comparison cells carry `kind`; unlisted tests broken by the union (`x0Rule`, `view()`, `execute` → `toRunView`); system copy keys; field/preset/method ids and language-neutral preset TeX; exact rule covers 5b and matches by text/number; 5b J₀ computed inside the first step; result tiles fixed as xₙ, yₙ, n; path-chart grid, nulls, contour settings, hooks-safe delegation. Lab text and every I/O matrix number re-verified by an independent script.

Review pass 1 (2026-11-20; blind = B, edge-case = E, verification-gap = VG).

| #   | Source   | Finding                                                                             | Verdict | Evidence                                                                                                                                                                  | Route                                                                                                      |
| --- | -------- | ----------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | B        | Spec file missing from the review diff                                              | false   | Left out on purpose: the spec is the claims file, read by the edge-case layer only                                                                                        | rejected                                                                                                   |
| 2   | B        | Exact solution matched by trimmed text: `sqrt(x+y) - 2` loses it                    | low     | `exactSolution` compared `trim()` text; a test locked the whitespace edit as a system change                                                                              | patch (compare with all whitespace removed; test now edits the system itself)                              |
| 3   | B        | A wrong partial can send ex. 2 to the other root while (x*, y*) still shows         | low     | The approved decision keeps the exact solution when a partial is edited; changing it edits the spec                                                                       | rejected                                                                                                   |
| 4   | B, E     | `as SystemErrorCode` / `as ScalarErrorCode` casts could build a missing message key | low     | No step throws a foreign code today (`newtonSystem` throws only `zero-jacobian`; `EvaluationError` codes are in both sets); a guard adds a branch for an unreachable case | rejected                                                                                                   |
| 5   | B, E, VG | Comparison hint falls back to "final xₙ" when a Lab 5 row is all null               | low     | `allSystem` needed a system cell in every row                                                                                                                             | patch (system wording when the card has system cells and no scalar ones; asserted on the all-null fixture) |
| 6   | B        | (x₀, y₀) merging keyed on field ids will reach Labs 7–9                             | false   | No other built lab has `x0` and `y0`; for a Cauchy problem the pair (x₀, y₀) still reads correctly                                                                        | rejected                                                                                                   |
| 7   | B        | Two "Derive from F" buttons share one accessible name                               | low     | Real, but Lab 1 already has two "Derive from f" buttons (f′, dda); pre-existing pattern                                                                                   | defer                                                                                                      |
| 8   | B        | RO tabs/topic name modified Newton inconsistently                                   | low     | Tab text and keeping `lab5.topic` are approved decisions                                                                                                                  | rejected                                                                                                   |
| 9   | B        | RO points show a decimal point with `;`                                             | low     | Every lab prints numbers with `formatValue` (decimal point); `;` between parts is the approved separator                                                                  | rejected                                                                                                   |
| 10  | B        | Cerința presents the three ε as the lab's requirement                               | false   | The approved decision asks the task to state the three precisions plainly as a fact; it names no requirement                                                              | rejected                                                                                                   |
| 11  | B        | Identical `.chart` copy for 5a and 5b                                               | low     | No named harm; two keys let the methods diverge later                                                                                                                     | rejected                                                                                                   |
| 12  | B        | Path chart has no equal aspect ratio                                                | low     | On the lab's examples both ranges are about 2 wide; a fix adds a `ChartSpec` option and Plotly layout code                                                                | rejected                                                                                                   |
| 13  | E        | J = ±∞ from finite partials gives zero steps and a false "converged"                | low     | Needs partial products above 1.8·10³⁰⁸ with finite F, G; the compiled functions throw `overflow` well before that on any lab input; fix is a new guard                    | rejected                                                                                                   |
| 14  | E        | J = NaN shows `undefined-value` instead of `overflow`                               | low     | Same unreachable overflow path as row 13                                                                                                                                  | rejected                                                                                                   |
| 15  | E        | `derive.variable` not among the source's variables                                  | false   | Static field definitions only; every `variable` is x or y of an XY source                                                                                                 | rejected                                                                                                   |
| 16  | E        | 80-point grid too coarse for widely spread iterates                                 | low     | Only for runs wandering over 10⁵-wide ranges; fix adds adaptive sampling                                                                                                  | rejected                                                                                                   |
| 17  | E        | Grid catch swallows non-evaluation bugs                                             | low     | Same as the scalar `sample()` used since Lab 1                                                                                                                            | rejected                                                                                                   |
| 18  | VG       | Failed-row highlight test passes on the status box's class                          | medium  | `bg-error/10` is also in `STATUS_STYLE.error.tint`                                                                                                                        | patch (one `<tbody>` row, highlighted, with its cells)                                                     |
| 19  | VG       | No test reads the system table's cell values                                        | medium  | Only header TeX was asserted                                                                                                                                              | patch (ex. 2 row 0 and last row, error column)                                                             |
| 20  | VG       | Panel's second chart (                                                              | Δy      | and error trace) unchecked                                                                                                                                                | low                                                                                                        | `traceNames` read only the first chart | patch (whole trace attribute of the convergence chart) |
| 21  | VG       | No test pins the scalar comparison hint                                             | low     | RO prefix is shared by both hints                                                                                                                                         | patch (Lab 1 card asserts "the final xₙ." and no "(xₙ, yₙ)")                                               |

## Verification

**Commands:**

- `bun run typecheck` -- no errors
- `bun run test` -- all suites pass
- `bun run build` -- succeeds (smoke on a spare port, killed by PID)
- `bun run format:check` -- clean

**Manual checks:**

- Run every Lab 5 preset and the comparison in EN and RO; the path chart shows both curves crossing at the root; toolbar works; no horizontal scroll at phone width.
