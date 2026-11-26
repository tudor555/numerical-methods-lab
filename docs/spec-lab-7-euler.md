---
title: "Lab 7 (Euler-type methods for the Cauchy problem)"
type: "feature"
created: "2026-11-25"
status: "done"
baseline_commit: "2a03a8b71afac081dbe2cf602afce1e34d4bfbce"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/SPEC.md"
  - "{project-root}/docs/stack.md"
  - "{project-root}/docs/labs-catalog.md"
  - "{project-root}/docs/spec-lab-6-successive-approximations-gauss-seidel.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Lab 7 is a "coming soon" card, and the app has no path for a Cauchy problem y′ = f(x, y), y(x₀) = y₀: every lab so far iterates to a stopping rule, while Labs 7–9 compute y at fixed nodes and compare with an exact solution.

**Approach:** Add a shared Cauchy-problem path (node driver, run kind, results panel with node table and charts, node comparison) that Labs 8–9 will reuse, then ship Lab 7 on it: 7a Euler, 7b modified Euler (midpoint), 7c Euler–Heun, the lab's examples as presets, the lab's comparisons, EN/RO explanations, and the hub card live at `/labs/euler`.

## Boundaries & Constraints

**Always:**

- Follow the lab text and `labs-catalog.md` Lab 7. h = T/n, xᵢ = x₀ + i·h (computed from i, not accumulated), y₀ given, and for i = 1..n: 7a yᵢ = yᵢ₋₁ + h f(xᵢ₋₁, yᵢ₋₁); 7b K = f(xᵢ₋₁, yᵢ₋₁), U = f(xᵢ₋₁ + h/2, yᵢ₋₁ + (h/2)K), yᵢ = yᵢ₋₁ + hU; 7c K₁ = f(xᵢ₋₁, yᵢ₋₁), K₂ = f(xᵢ₋₁ + h, yᵢ₋₁ + hK₁), yᵢ = yᵢ₋₁ + (h/2)(K₁ + K₂). Output yᵢ for i = 1..n.
- Inputs as the lab lists them: x₀, y₀, T, n, f (expression in x, y). x₀, y₀ in [−10⁶, 10⁶], T in (0, 10⁶], n an integer from 1 to 10 000. No ε and no iteration cap.
- Errors: NaN, ±∞ or |yᵢ| above 10¹⁰⁰ stop the run (`undefined-value`, `overflow`, `diverged`) with a message naming the node (i, xᵢ₋₁, yᵢ₋₁) the step started from; the rows computed so far stay (CAP-9).
- Results: status, tiles yₙ (at x₀ + T), h and n; with an exact solution also y(xₙ), |y(xₙ) − yₙ| and the largest error over the nodes. Table: i, xᵢ, yᵢ, and with an exact solution y(xᵢ) and |y(xᵢ) − yᵢ|. Charts: yᵢ against the exact curve (CAP-6), and |y(xᵢ) − yᵢ| on a log scale when the exact solution is known.
- Lab wording and numbering: "Ex. 1", "Ex. 2" and the unnumbered "Numerical example" ("Exemplu numeric"). RO uses the lab's names ("Metoda lui Euler", "Metoda modificată a lui Euler (metoda mid-point)", "Metoda Euler–Heun") and course terms (problema Cauchy, pasul h, nodurile, soluția exactă). The intro doesn't name the lab number. Each comparison card has its short "Cerința" line and the input list.
- Labs 1–6 keep their behavior, counts and copy.

**Decisions:**

- Presets. 7a: `ex1-h-1-4`, `ex1-h-1-8`, `ex1-h-1-16` (y′ = x² − y, x₀ = 0, y₀ = 1, T = 4, n = 16 / 32 / 64, i.e. h = 1/4, 1/8, 1/16); `ex2` (y′ = y + x, x₀ = 0, y₀ = 1, T = 1, n = 10). 7b: `example-modified`, 7c: `example-heun` (the numerical example: ex. 2's problem, n = 10). Defaults: 7a = `ex1-h-1-4`, 7b = `example-modified`, 7c = `example-heun`.
- Exact solution (user's choice 2026-11-25): an optional field "Exact solution y(x)" (expression in x, after the lab's inputs). Presets fill it with the lab's solution (ex. 1: x² − 2x + 2 − e⁻ˣ; ex. 2 and the numerical example: 2eˣ − x − 1). Blank means no exact tiles, columns, curve or error chart. An invalid formula is rejected next to the field.
- Comparison `ex1` (user's choice 2026-11-25): rows 7a `ex1-h-1-4`, `ex1-h-1-8`, `ex1-h-1-16`, shown at the nodes the three share (x = 0.25, 0.5, …, 4) with the exact value, so the error at x = 4 reads 0.2392 / 0.1189 / 0.0593.
- Comparison `example` (the numerical example's last request), after `ex1`: rows 7a `ex2`, 7b `example-modified`, 7c `example-heun`, shown at the nodes x₁..x₁₀ with the exact value.
- Tabs "7a · Euler", "7b · Modified Euler" / "7b · Euler modificată", "7c · Euler–Heun". Slug stays `euler`.

**Never:** Implement Labs 8–13, add dependencies or e2e tests, add methods, presets or comparisons the lab doesn't ask for, add adaptive step size, change Labs 1–6 results, counts or copy.

## I/O & Edge-Case Matrix

| Scenario          | Input / State                                | Expected Output / Behavior                                                                  | Error Handling         |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| 7a ex. 1          | y′ = x² − y, (0, 1), T = 4, n = 16 / 32 / 64 | y₁₆ = 9.7424831, y₃₂ = 9.8628026, y₆₄ = 9.9224293; error at x = 4: 0.2392 / 0.1189 / 0.0593 | N/A                    |
| 7a ex. 2          | y′ = y + x, (0, 1), T = 1, n = 10            | y₁ = 1.1, y₁₀ = 3.1874849; y(1) = 3.4365637, error 0.2490788                                | N/A                    |
| 7b, 7c example    | same problem, n = 10                         | both y₁ = 1.11, y₁₀ = 3.4281617; error 0.0084020                                            | N/A                    |
| `ex1` compare     | 7a at n = 16 / 32 / 64                       | 16 node rows (x = 0.25 … 4); at x = 4 the errors 0.2392 / 0.1189 / 0.0593                   | N/A                    |
| `example` compare | 7a, 7b, 7c on ex. 2's problem                | 10 node rows, each with y(xᵢ) and every method's yᵢ and error                               | N/A                    |
| No exact solution | ex. 2 with the exact field blank             | yₙ, h, n, table i, xᵢ, yᵢ and the solution chart only                                       | N/A                    |
| n = 1             | y′ = y + x, (0, 1), T = 1, n = 1             | one step; 7a y₁ = 2                                                                         | N/A                    |
| Undefined value   | f = sqrt(y − 2), (0, 1), T = 1, n = 10       | status `error`, `undefined-value` from node 0, row 0 kept                                   | Message names the node |
| Divergence        | f = y², (0, 1), T = 10, n = 10               | 7a: `diverged` at i = 9 (y₉ ≈ 1.66·10¹⁰⁴), rows 0–9 kept                                    | Message names the node |
| Invalid input     | f uses z, T = 0, n = 2.5 or 20 000           | rejected next to the field; nothing runs                                                    | Field error            |

</frozen-after-approval>

## Code Map

**Method layer**

- `src/lib/methods/types.ts` -- `RunStatus` gains `"completed"` (a Cauchy run has no convergence). New `CauchyNodeRow { i; x; y }`, `CauchyErrorCode = "undefined-value" | "overflow" | "diverged"`, `CauchyMethodError { code; i; x; y }` (the node the failing step started from; for `diverged`, the first node past 10¹⁰⁰, kept as a row), `CauchyRunResult` (`status: "completed" | "error"`, `result` = yₙ or null, `n`, `rows`, `error?`). Reuse `DIVERGENCE_LIMIT`, `MethodStepError`.
- New `src/lib/methods/cauchy.ts` -- `solveCauchy({ f, x0, y0, T, n }, step)`; `step(f, x, y, h)` returns yᵢ. Node loop, NaN/∞/divergence checks, partial rows. Labs 8–9 will add steps only.
- New `src/lib/methods/lab7/euler.ts` -- `euler`, `modifiedEuler`, `eulerHeun` steps + `lab7.test.ts` locking every matrix row.

**Lab layer**

- `src/labs/types.ts` -- `CauchyPreparedRun { kind: "cauchy"; run: () => CauchyRunResult; exact?: (x: number) => number }` joins `PreparedRun`. `Comparison` becomes a union: the current shape (with optional `kind: "precision"`) | `{ kind: "nodes"; id; titleKey; taskKey; rows }` (no ε).
- `src/labs/fields.ts` + `types.ts` -- `ExpressionField.optional?: true`; `parseFields` skips a blank (whitespace-only) optional field instead of failing; the form marks it optional (`field.optional` "optional" / "opțional").
- `src/labs/shared-fields.ts` -- Cauchy fields: `f` (symbol `f(x, y)`, `field.fxy`, variables `XY`), `x0` (`field.cauchyX0`), `y0` (`field.cauchyY0`, symbol `y_0 = y(x_0)`), `T` (`field.T`, positive, max 10⁶), `n` (`field.steps`, integer 1..10 000), and `exact` (`field.exactY`, symbol `y(x)`, variables `X`, optional).
- `src/labs/lab-state.ts` -- `RunView` and `toRunView` gain the `cauchy` kind.
- `src/labs/compare.ts` -- `runComparison` handles only precision comparisons; new `runNodeComparison(lab, comparison)` returns one `CauchyRunResult | null` per row. `comparisonInputs` lists Cauchy fields one per line; `(x_0, y_0)` merge is fine.
- New `src/labs/lab-7.ts` (shape of `lab-6.ts`) + `registry.ts`: `lab7` replaces `planned(7, …)`; `PlannedNumber` drops 7.

**UI**

- `src/components/lab/status.tsx` -- `STATUS_STYLE.completed` (CircleCheck, success); `cauchyErrorKey(code)` → `run.cauchyError.*` (params `i`, `x`, `y`).
- `src/components/lab/results-panel.tsx` -- dispatch `kind === "cauchy"` to a new `cauchy-results-panel.tsx` (tiles, charts, `cauchy-node-table.tsx` built like `iteration-table.tsx`, error row highlighted).
- `src/components/lab/charts.ts` -- `buildCauchySolutionChart(rows, labels, exact?)` (yᵢ lines+markers, exact sampled at 200 points over [x₀, x₀ + T]); `buildCauchyErrorChart(series[], labels)` (log y, i ≥ 1, zero/non-finite dropped), used by the panel (one series) and the node comparison (one per row). New `ChartLabels`: `approximation`, `exactSolution`, `nodeError`.
- `src/components/lab/comparison-panel.tsx` -- a `nodes` card: input list without the precisions line; node table (xᵢ, y(xᵢ), then per row yᵢ over its error, stacked like Lab 5's pairs) on the nodes of the row with the fewest; other rows read at index i·(nₖ/n_min); error chart; hint `compare.nodesHint`.

**Ids and keys**

- Methods `lab7.method.{euler,modified,heun}.{tab,title,name,idea,steps,failure,chart}`; `lab7.intro`; keep `lab7.title`, `lab7.topic`; presets `lab7.preset.{ex1H4,ex1H8,ex1H16,ex2,exampleModified,exampleHeun}`; `lab7.compare.{ex1,example}` + `.task` + `.note`. Shared: `result.status.completed`, `result.cauchy.completed` ("y computed at the n nodes with h = …"), `result.{stepH,steps,valueAtEnd,maxError}`, `run.cauchyError.*`, `table.node`, `chart.{cauchySolution,cauchyError}`.

**Tests to update** (Lab 7 ready, Lab 8 `runge-kutta-2-3` the unbuilt example): `src/labs/lab-1.test.ts:32`, `src/app/labs/[slug]/page.test.tsx:62,131`, `src/components/lab/lab-page.test.tsx:100`, `src/components/hub.test.tsx`, `charts.test.ts`, `results-panel.test.tsx`, `comparison-panel.test.tsx`, `compare.test.ts`, `fields.test.ts`, `i18n.test.ts` (key parity, KaTeX parse).

## Tasks & Acceptance

**Execution:**

- [x] `src/lib/methods/{types,cauchy}.ts` + `cauchy.test.ts` -- node driver, statuses, error cases
- [x] `src/lib/methods/lab7/euler.ts` + `lab7.test.ts` -- three steps; lock every matrix row
- [x] `src/labs/{types,fields,shared-fields,lab-state,compare,lab-7,registry}.ts` + `lab-7.test.ts` -- Cauchy run kind, node comparison, presets; lock preset and comparison ids
- [x] `src/components/lab/{status.tsx,charts.ts,results-panel.tsx,cauchy-results-panel.tsx,cauchy-node-table.tsx,comparison-panel.tsx}` + tests -- panel, table, charts, node card
- [x] `src/i18n/{en,ro}.ts` -- all keys above, KaTeX formulas with `⟪⟫` words, native RO
- [x] tests listed above -- Lab 7 ready, Lab 8 unbuilt
- [x] `docs/labs-catalog.md` -- Lab 7 presets and comparisons as built; input limits for T and n in Shared rules

**Acceptance Criteria:**

- Given the hub, when it loads, then the Lab 7 card is live and opens `/labs/euler`.
- Given Lab 7, when each preset runs, then the form fills and yₙ, h, n, the node table with exact value and error, and both charts appear.
- Given a comparison card, when it runs, then every node row shows the exact value and each row's yᵢ and error.
- Given filled inputs, when switching to RO, then every Lab 7 string is Romanian and inputs are kept.
- Given Labs 1–6, when their presets and comparisons run, then counts, results and copy are unchanged.

## Implementation Notes

- For y′ = y + x, 7b and 7c give the same yᵢ (every two-stage second-order method does on this linear f): 1 + h + h²/2 per step on y + x + 1. The comparison hint says so, so matching columns don't look like a bug. Tests compare them with `toBeCloseTo`, not `toBe`.
- `CauchyRunResult` also carries `h`, so the tiles and the chart range (x₀ + n·h) need no second source.
- `runNodeComparison` returns `{ result, exact? } | null` per row instead of a bare `CauchyRunResult`: the node table's y(xᵢ) column needs the exact solution the preset gives, and the method layer must not know it.
- `NodeComparison` has `eps?: never` and an optional `noteKey`. The first keeps `comparison.eps` readable on the union in the Lab 1–6 tests; the second carries a card's own remark, since `compare.nodesHint` is shared with Labs 8–9: the 7b = 7c remark on the numerical example (`lab7.compare.example.note`) and, added after delivery, ex. 1's analysis (`lab7.compare.ex1.note`). `runComparison` throws for a node comparison.
- Keys beyond the Code Map: `result.cauchy.partial` ("The nodes computed before the error are kept below"), `table.hiddenNodes`, `field.optional`, `lab7.compare.example.note`.
- The node comparison's error chart names each line "method, h = …" in plain text, since a Plotly legend can't show the preset's TeX tag; the third line is dotted so 7c stays visible on top of 7b.
- Ex. 2's error at x = 1 is 0.24907874, so it rounds to 0.2490787; the matrix's 0.2490788 is the difference of the two rounded values. Tests check it to 6 decimals.
- Adding the `cauchy` kind to `PreparedRun` made `run().iterations` and `.plot` unreadable on the union in a few Lab 1–4 tests; they now narrow with `scalarRun` (no behavior change).

- Ex. 1 ends with "Să se analizeze rezultatele obținute". The `ex1` card's note answers it with the numbers the tests lock: at x = 4 the error is 0.239 / 0.119 / 0.059, halving with h as an order-one method does, and every run's largest error is at x = 4. Missed in the first delivery; found by a line-by-line check against the lab PDF.

## Changes After Delivery

Made on user feedback after the review, 2026-11-26. Each is its own commit.

| Commit    | Change                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `d369ea2` | `lab7.method.*.chart` rewritten in short sentences, one idea each: what the first chart shows, when the exact curve and the error chart appear, and why the error axis is logarithmic (so very small errors stay visible). The user found the earlier text hard to read.                                                                                                                                                                             |
| `fb8afca` | Charts no longer widen the page while the window resizes. Cause: Plotly redraws a chart a beat after its box changes size, so during a drag the SVG keeps its old width; a headless drag from 1366 to 400 px overflowed in 64 of 81 frames, by up to 491 px. The chart box and its card now clip (`overflow-hidden`); the same drag gives 0 frames. Shared component, so Labs 1–6 get the fix too. Not a cache issue: the app has no service worker. |
| `e9de8d8` | The `ex1` comparison card gets the analysis note above (EN/RO) and a test for its key and numbers.                                                                                                                                                                                                                                                                                                                                                   |
| `dc10256` | Tests for gaps found by a coverage run: an exact solution undefined at a node (ln x at x = 0) shows "—" for y(xᵢ) and the error; the chart card's clip classes; ex. 1's largest error at x = 4 for every h, as its note says.                                                                                                                                                                                                                        |

## Review Triage Log

Review pass 1 (2026-11-26; blind = B, edge-case = E, verification-gap = VG).

| #   | Source | Finding                                                                                                                            | Verdict | Evidence                                                                                                                                                                                                     | Route               |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| 1   | B, E   | `solveCauchy` casts any `MethodStepError` code to `CauchyErrorCode`; a `zero-*` code would build a missing `run.cauchyError.*` key | low     | No Cauchy step throws `MethodStepError`, and `EvaluationError` only carries `undefined-value`/`overflow`; Labs 8–9 steps only evaluate f. Unreachable, and the fix adds a guard                              | rejected            |
| 2   | B, E   | `sharedNodes` matches rows by index without checking x₀ and T                                                                      | low     | Comparisons are fixed lab definitions; every Lab 7 row shares x₀ and T, and Labs 8–9 compare one problem. Unreachable from the UI; the fix adds a guard                                                      | rejected            |
| 3   | B, E   | A node comparison uses the first row's exact solution for every row                                                                | low     | Every row of a node comparison solves the same problem with the same y(x) (locked by the preset tests); the fix adds per-row branches                                                                        | rejected            |
| 4   | B, E   | A failed or invalid row in a node comparison shows only dashes; all-null cells give an empty table                                 | low     | Rows run fixed presets that are tested to complete; no user input reaches this path                                                                                                                          | rejected            |
| 5   | B      | `compare.nodesHint` mentions y(xᵢ) even without an exact solution                                                                  | low     | Every node-comparison preset carries its exact solution; the no-exact case exists only in a test                                                                                                             | rejected            |
| 6   | B      | Method chart copy says the error chart always appears, but it needs the optional exact solution                                    | low     | `lab7.method.*.chart` EN/RO: "The second shows…" while the panel builds the error chart only with `exact`; direct copy fix                                                                                   | patch               |
| 7   | B      | Precision paths take the whole `Comparison` union, with `eps?: never` and a runtime throw                                          | low     | The throw fails loudly on a call no code makes; narrowing ripples through the Lab 1–6 tests for no user-facing gain                                                                                          | rejected            |
| 8   | B      | `comparisonInputs` strips `" = "` from point symbols                                                                               | low     | Only `y_0 = y(x_0)` contains it; a dedicated symbol property adds public surface                                                                                                                             | rejected            |
| 9   | B      | RO mixes "h = 0,1" (copy) with "h = 0.1" (computed values); legend writes h as a decimal, headers as a fraction                    | low     | Pre-existing project convention: RO prose uses the decimal comma (`lab2.preset.ex2` "1,5", Lab 6 "(1,5; 1,5)"), `formatValue` prints computed numbers with a dot                                             | rejected            |
| 10  | B      | `field.nodes` / `result.nodes` name the step count n, not the n + 1 nodes; `.chart`/`.steps` copy repeats per method               | low     | The key names contradict their text ("Number of steps") and the clear-names rule; rename is a direct correction. Per-method copy keys follow Labs 1–6's pattern                                              | patch (rename only) |
| 11  | B      | Catalog says 0.2490787, matrix 0.2490788; browser checks not done                                                                  | false   | 0.24907874 rounds to 0.2490787 (Implementation Notes); the frozen matrix is the difference of rounded values and the tests check it to 6 decimals. Browser checks are a verification step, not a code defect | rejected            |
| 12  | B, VG  | `CauchyNodeTable`'s long-table split ("Hidden nodes", "Show all") is untested though n ≤ 10 000                                    | low     | Pre-verified gap: no test renders > 1001 nodes or reads `table.hiddenNodes`                                                                                                                                  | patch               |
| 13  | E      | `buildCauchyErrorChart` gives series 4+ the same solid style as series 1                                                           | low     | `SERIES_COLORS` has 3 entries and only k = 2 is dotted; Lab 8 compares five runs on this chart. Direct fix                                                                                                   | patch               |
| 14  | VG     | `maxNodeError` is never checked as a maximum                                                                                       | low     | Pre-verified gap: the only assertion is `/e-1$/` on a run whose largest error is the last node's                                                                                                             | patch               |
| 15  | VG     | The panel's `end = x₀ + n·h` for the exact curve is never checked                                                                  | low     | Pre-verified gap: the Plotly mock records only trace names; dropping `end` collapses the curve for a node-0 failure unnoticed                                                                                | patch               |

## Verification

**Commands:**

- `bun run typecheck` -- no errors
- `bun run test` -- all suites pass
- `bun run build` -- succeeds (smoke on a spare port, killed by PID)
- `bun run format:check` -- clean

**Manual checks:**

- Run every Lab 7 preset and comparison in EN and RO; the solution chart shows yᵢ against the exact curve; no horizontal scroll at phone width.

**Results (2026-11-26):**

- `bun run typecheck` clean; `bun run test` 42 files, 976 tests pass; `bun run format:check` clean; `bun run build` succeeds; `next start` smoke on port 3917 (killed by PID): `/`, `/labs/euler`, `/labs/nonlinear-systems` 200, `/labs/runge-kutta-2-3` 404; `/labs/euler` renders "Euler-type methods", and "Metode de tip Euler" with the RO cookie.
- Not done: the browser checks (Plotly charts drawn, phone width). The chart data, panels and comparison cards are covered by the render tests only.

**Results after review pass 1 (2026-11-26):**

- Six patches applied (triage rows 6, 10, 12–15); `bun run typecheck` clean; `bun run test` 44 files, 984 tests pass; `bun run format:check` clean; `bun run build` succeeds. Nothing deferred. The browser checks are still open.

**Results after the changes after delivery (2026-11-26):**

- `bun run typecheck` clean; `bun run test` 45 files, 989 tests pass; `bun run format:check` clean; `bun run build` succeeds.
- Coverage (v8) of the files this branch touches: lines and branches 100% in `cauchy.ts`, `lab7/euler.ts`, `lab-7.ts`, `fields.ts`, `shared-fields.ts`, `lab-state.ts`; `compare.ts` 100% lines. Left uncovered by design: `plotly-inner.tsx` (needs a browser; tests render to static HTML in Node) and the "Show all" click (state change, no DOM in tests).
- Browser checks, headless Chromium against the dev server: every page and lab, after running all presets and comparisons, at 10 widths from 320 to 1366 px in EN and RO, has no horizontal overflow; the Lab 7 solution, error and comparison charts render on desktop and phone (screenshots checked). Still open: a real browser with always-visible scrollbars, where the user saw the scroll persist after a hard reload; the headless browser has overlay scrollbars, so that case could not be reproduced.
- Dependencies: `next` 16.4.5 and `react` 19.3.0 have no GitHub advisories. `next` 16.4.6 (2026-11-09) and `react` 19.3.1 are bug-fix releases with no security notes. `bun audit`: one moderate advisory in `minimatch`, pulled in by the `shadcn` CLI (dev-only, not shipped to the browser).
