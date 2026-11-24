---
title: "Lab 6 (Successive approximations and Gauss–Seidel for nonlinear systems)"
type: "feature"
created: "2026-11-24"
status: "done"
baseline_commit: "9dad42e3076446c3a0b848e16a7cbddf94e729c1"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/SPEC.md"
  - "{project-root}/docs/stack.md"
  - "{project-root}/docs/labs-catalog.md"
  - "{project-root}/docs/spec-lab-5-newton-systems.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Lab 6 is a "coming soon" card. Successive approximations for a 2-D system and the Gauss–Seidel method for 3-D and 2-D systems can't be read about, run or compared, and the system path from Lab 5 only handles points (x, y) with residuals F = G = 0.

**Approach:** Extend Lab 5's system path to fixed-point systems x = F(x, y), y = G(x, y) and to points (x, y, z), then ship Lab 6 on it: 6a successive approximations, 6b Gauss–Seidel (3 equations), 6c Gauss–Seidel (2 equations), the lab's four examples as presets, ex. 4 as the one comparison, EN/RO explanations, and the hub card live at `/labs/nonlinear-systems`.

## Boundaries & Constraints

**Always:**

- Follow the lab text and `labs-catalog.md` Lab 6. 6a: (x₁, y₁) = (F(x₀, y₀), G(x₀, y₀)), then xₙ₊₁ = F(xₙ, yₙ), yₙ₊₁ = G(xₙ, yₙ). 6c: the same first step, then xₙ₊₁ = F(xₙ, yₙ), yₙ₊₁ = G(xₙ₊₁, yₙ). 6b: (x₁, y₁, z₁) all from (x₀, y₀, z₀), then xₙ₊₁ = F₁(xₙ, yₙ, zₙ), yₙ₊₁ = F₂(xₙ₊₁, yₙ, zₙ), zₙ₊₁ = F₃(xₙ₊₁, yₙ₊₁, zₙ). From n = 1, loop while any component difference is ≥ ε; output n and the point; editable cap, default 1000.
- Inputs as the lab lists them. 6a, 6c: x₀, y₀, F, G (expressions in x, y), ε. 6b: x₀, y₀, z₀, F₁, F₂, F₃ (expressions in x, y, z), ε. Starting values in [−10⁶, 10⁶]. No derivative fields.
- Errors: NaN, ±∞ or a component above 10¹⁰⁰ stop the run (`undefined-value`, `overflow`, `diverged`), messages name the whole point, partial table stays (CAP-9). No `zero-jacobian` here.
- Results: tiles xₙ, yₙ (zₙ), n, then the starting point. Table: n, the point, the differences (stacked like Lab 5). There are no F/G residual columns: F and G are the iteration maps, so F(xₙ, yₙ) would just repeat xₙ₊₁. 2-D charts: the iteration path over the curves x = F(x, y) and y = G(x, y) (zero contours of x − F and y − G), and the differences on a log scale with ε.
- Ex. 2 shows the exact solution for the form the preset uses ((2, 1), (1, 2), (−1, −2), (−2, −1)): exact tile, error tile, error column and trace, max-norm over the components. It shows in 6a and 6c while F and G match one of ex. 2's four forms (text, whitespace ignored), whatever the start.
- Lab wording and numbering: "Ex. 1" … "Ex. 4" as the lab numbers its examples (ex. 3 is the Gauss–Seidel example, ex. 4 is the 2-equation remark's example). RO uses the lab's names ("Metoda aproximațiilor succesive pentru sisteme neliniare", "Metoda Gauss–Seidel") and course terms (iterația inițială, precizia, soluția exactă). The intro doesn't name the lab number. The comparison card has its short "Cerința" line and the input list.
- Lab 5 keeps its behavior, counts and copy.

**Decisions:**

- Presets. 6a: `ex1` (lab's F, G, (3.5, 2.2), ε = 10⁻⁴); `ex2-near-2-1`, `ex2-near-1-2`, `ex2-near-minus-1-minus-2`, `ex2-near-minus-2-minus-1` (the lab's four (F, G) pairs, each from (1.5, 1.5), ε = 10⁻⁴; the start is the one ex. 4 gives, see Errata). 6b: `ex3` ((10, 10, 10), ε = 10⁻³). 6c: `ex4` (form near (2, 1), (1.5, 1.5), ε = 10⁻⁴). Defaults: 6a = `ex1`, 6b = `ex3`, 6c = `ex4`.
- One comparison, `ex4`: rows 6c `ex4`, then 6a `ex2-near-2-1`, over ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²} (`EPS_SET`, user's choice 2026-11-24, as in Labs 1–5). Its Cerința states plainly, as a fact, that it runs the three precisions.
- 6b charts (user's choice 2026-11-24): a components chart, xₙ, yₙ, zₙ against n, and the three differences on a log scale with ε. No 3-D chart.
- Tabs "6a · Successive approximations" / "6a · Aproximații succesive", "6b · Gauss–Seidel, 3 equations" / "6b · Gauss–Seidel, 3 ecuații", "6c · Gauss–Seidel, 2 equations" / "6c · Gauss–Seidel, 2 ecuații". Slug stays `nonlinear-systems`.

**Never:** Implement Labs 7–13, add dependencies or e2e tests, add methods, presets or comparisons the lab doesn't ask for, change Labs 1–5 results, counts or copy.

## I/O & Edge-Case Matrix

| Scenario          | Input / State                                     | Expected Output / Behavior                                    | Error Handling          |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| 6a ex. 1          | lab's F, G; (3.5, 2.2), 10⁻⁴                      | → (3.4872672, 2.2615452); n = 9                               | N/A                     |
| 6a ex. 2 (each)   | form near s, (1.5, 1.5), 10⁻⁴                     | → s within 7·10⁻⁵ per component; n = 14; exact s shown        | N/A                     |
| 6b ex. 3          | lab's F₁, F₂, F₃; (10, 10, 10), 10⁻³              | → (4.5298512, 3.2913483, 5.8897793); n = 14                   | N/A                     |
| 6c ex. 4          | form near (2, 1), (1.5, 1.5), 10⁻⁴                | → (1.99998, 1.00001); n = 9; exact (2, 1) shown               | N/A                     |
| `ex4` comparison  | 6c vs 6a, ε = 10⁻⁴ / 10⁻⁸ / 10⁻¹²                 | 6c n = 9 / 16 / 22; 6a n = 14 / 27 / 40                       | N/A                     |
| Solution at start | form near (2, 1), (2, 1)                          | (x₁, y₁) = (2, 1); `converged` at n = 1                       | N/A                     |
| Undefined value   | form near (2, 1), (3, 3); 6b from (−10, −10, −10) | status `error`, code `undefined-value`, row 0 kept            | Message names the point |
| Divergence / cap  | F = 2x, G = 2y, (1, 1); cap 10                    | `diverged` (row past 10¹⁰⁰ kept) / `max-iterations` at n = 10 | System wording          |
| Invalid input     | F = `x + z` in 6a, z₀ = 2·10⁶, ε = 0              | rejected next to the field; nothing runs                      | Field error             |

</frozen-after-approval>

## Code Map

**Method layer**

- `src/lib/methods/types.ts` -- `SystemIterationRow` gains optional `z`, `dz`; `F`, `G` become optional (absent for fixed-point methods, which have no residuals). `SystemPoint` and `SystemMethodError` gain optional `z`. Lab 6 uses only `undefined-value | overflow | diverged` of `SystemErrorCode`.
- `src/lib/methods/system-iterate.ts` -- generalize: optional `z0` (3-D run iff given), `step` returns 2 or 3 components, optional residual `F`, `G` for the table columns. NaN/∞/divergence checks and the stopping rule cover every component. Lab 5's call changes shape only; `lab5.test.ts` must pass untouched.
- New `src/lib/methods/lab6/successive-approximations.ts` -- `successiveApproximations` (6a), `gaussSeidel2` (6c), `gaussSeidel3` (6b). The first step is computed from the start only. Gauss–Seidel's in-step use of new components starts at n ≥ 1: track "first step done" in a closure, as 5b caches J₀.

**Lab layer**

- `src/labs/types.ts` -- `SystemPlot` becomes a union: `{ kind: "system"; F; G }` (Lab 5, curves F = 0, G = 0) | `{ kind: "fixed-point"; F; G }` (curves x = F, y = G) | `{ kind: "fixed-point-3d" }`.
- `src/labs/shared-fields.ts` -- add `XYZ`; reuse `valueRule`, `epsField`, `maxIterField`.
- New `src/labs/lab-6.ts` (shape of `lab-5.ts`) + `registry.ts`: `lab6` replaces `planned(6, …)`; `PlannedNumber` drops 6.
- `src/labs/compare.ts:65` -- `comparisonInputs` point merge also folds `z0` into `(x_0, y_0, z_0)` (unused by `ex4`, keeps 6b readable if ever compared).

**UI**

- `src/lib/format.ts:11` -- `formatPoint(values: readonly number[], separator)`; update its 3 callers.
- `src/components/lab/system-results-panel.tsx` -- zₙ tile and (x₀, y₀, z₀) when the run has z; 3-D messages; F/G-less table; picks charts by `plot.kind`.
- `src/components/lab/system-iteration-table.tsx` -- `Pair` becomes a stack of 2–3 values; F/G column only when rows carry `F`; error column max over components.
- `src/components/lab/charts.ts:418` -- `buildPathChart` draws contours of x − F and y − G for `fixed-point` (labels `curveFixedX` "x = F(x, y)", `curveFixedY` "y = G(x, y)"), returns null for `fixed-point-3d`. `buildSystemConvergenceChart` adds a dz trace (`diffZ`). New `buildComponentsChart(rows, labels)` for 6b (lines+markers per component against n, `chart.components` "xₙ, yₙ and zₙ at each iteration", traces `chart.trace.{componentX,componentY,componentZ}`).
- `src/components/lab/comparison-panel.tsx:59,84` -- `formatPoint` callers.

**Ids and keys**

- Fields: `F`, `G` (as Lab 5), `F1`, `F2`, `F3` (symbols `F_1(x, y, z)` …; labels `field.F1` "Function F₁" / "Funcția F₁" …), `x0`, `y0`, `z0` (`field.startZ` "Starting point, z" / "Punctul inițial, z"), `eps`, `maxIter`.
- Methods: `lab6.method.{successive,gaussSeidel3,gaussSeidel2}.{tab,title,name,idea,start,failure,chart}`; `lab6.intro`; keep `lab6.title`, `lab6.topic`; presets `lab6.preset.{ex1,ex2Near21,ex2Near12,ex2NearMinus1Minus2,ex2NearMinus2Minus1,ex3,ex4}` (e.g. "Ex. 2: x² + y² = 5, xy = 2, near (2, 1)"); `lab6.compare.ex4` + `.task`.
- 3-D copy: `common.system3Stopping`, `result.system3.{converged,maxIterations}`, `run.system3Error.{undefined-value,overflow,diverged}`, `chart.fixedPointPath` "x = F(x, y) and y = G(x, y) with the iteration path", `chart.trace.{curveFixedX,curveFixedY,diffZ}`, `table` header `|z_n - z_{n-1}|`.

**Tests to update** (Lab 6 ready, Lab 7 `euler` the unbuilt example): `src/labs/lab-1.test.ts:20-30`, `src/components/hub.test.tsx:36-45`, `src/app/labs/[slug]/page.test.tsx`, `src/lib/format.test.ts` (`formatPoint`), `system-iterate.test.ts`, `charts.test.ts`, `results-panel.test.tsx`, `comparison-panel.test.tsx`, `lab-page.test.tsx`, `compare.test.ts`, `i18n.test.ts` (key parity, KaTeX parse).

## Tasks & Acceptance

**Execution:**

- [x] `src/lib/methods/{types,system-iterate}.ts` + test -- optional z and residuals; 3-D driver cases
- [x] `src/lib/methods/lab6/successive-approximations.ts` + `lab6.test.ts` -- 6a, 6b, 6c; lock every matrix row and count
- [x] `src/labs/{types,shared-fields,compare,lab-6,registry}.ts` + `lab-6.test.ts` -- definition, seven presets, `ex4`, exact rule; lock preset/comparison ids
- [x] `src/lib/format.ts`, `src/components/lab/{charts.ts,system-results-panel.tsx,system-iteration-table.tsx,comparison-panel.tsx}` + tests -- fixed-point curves, z tile/column/trace, 6b charts
- [x] `src/i18n/{en,ro}.ts` -- all keys above, KaTeX formulas with `⟪⟫` words, native RO
- [x] tests listed above -- Lab 6 ready, Lab 7 unbuilt
- [x] `docs/labs-catalog.md` -- Lab 6 example numbering as presets; the Errata row reads "ex. 1 gives no ε, ex. 2 no starting point"

**Acceptance Criteria:**

- Given the hub, when it loads, then the Lab 6 card is live and opens `/labs/nonlinear-systems`.
- Given Lab 6, when each preset runs, then the form fills and the point, n, the table and the charts appear; ex. 2 and ex. 4 also show the exact solution and error.
- Given the `ex4` card, when it runs, then n and the point appear for 6c and 6a.
- Given filled inputs, when switching to RO, then every Lab 6 string is Romanian and inputs are kept.
- Given Lab 5, when its presets and comparison run, then counts, results and copy are unchanged.

## Implementation Notes

- `systemIterate` takes `z0` and a 3-argument step as one branch of a union on `z0`, so Lab 5's 2-argument step type-checks unchanged. Rows carry `z`/`dz` only in a 3-D run and `F`/`G` only when residuals are passed, so 2-D rows keep exactly Lab 5's keys.
- 6b and 6c track the first step in a closure (`firstStepDone`), as 5b caches J₀; a failure in that step is still a driver error at n = 0.
- `SystemPlot` is `{ kind: "system" | "fixed-point"; F; G } | { kind: "fixed-point-3d" }`. `lab-5.test.ts` narrows on `plot.kind` before calling `plot.F` (one line; the Lab 5 method test is untouched).
- `formatPoint(values, separator)` takes the components; `pointValues(point?)` turns a `SystemPoint` or error into them (NaNs when missing).
- `systemErrorKey(code, threeUnknowns)` picks `run.system3Error.*` for a 3-D run (falls back to the 2-D key for `zero-jacobian`, which Lab 6 never throws).
- One key beyond the Code Map: `chart.system3Convergence` ("Convergence: |xₙ − xₙ₋₁|, |yₙ − yₙ₋₁| and |zₙ − zₙ₋₁| on a log scale"), since 6b's convergence chart has three differences and the 2-D title names only two.
- 6b tiles sit two per row from 640 px up (xₙ, yₙ / zₙ, n): three 15-digit values side by side would be cut off in the results column.
- Lab 6 expressions need an explicit `*` before a parenthesis after a variable (`x * (y + 5)`), since math.js reads `x (…)` as a call.

## Spec Change Log

## Review Triage Log

Review pass 1 (2026-11-24; blind = B, edge-case = E, verification-gap = VG). VG found no gaps.

| #   | Source | Finding                                                                      | Verdict | Evidence                                                                                                                                                                                                                                                                            | Route                                  |
| --- | ------ | ---------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | B      | Path chart draws a false contour along a pole (F = 2/y, G = 2/x)             | medium  | `ex2-near-minus-1-minus-2` iterates run y from 1.5 to −2, so `x − 2/y` jumps from +∞ to −∞ between grid rows and Plotly draws its zero line along y = 0; same along x = 0 for `ex2-near-minus-2-minus-1`                                                                            | patch (blank grid cells across a pole) |
| 2   | B, E   | Exact solution follows the text of F and G, not where the run ends           | low     | Real: the form near (2, 1) started exactly on (1, 2) converges at n = 1 and shows (2, 1) with error 1. (1, 2) repels that iteration (Jacobian eigenvalues ±2), so only a start exactly on it gets there, and the approved intent says the exact solution shows "whatever the start" | rejected                               |
| 3   | B      | Errata reason doesn't cover ex. 1's ε                                        | low     | The Why cites ex. 4's ε and start "for the same system", but ex. 1 is another system                                                                                                                                                                                                | patch (reword)                         |
| 4   | B      | Catalog Examples mix lab wording with project decisions                      | false   | The catalog already records decisions in Examples (Lab 5 ex. 3 lists the three ε "as Labs 1–4 compare"); the convention is followed                                                                                                                                                 | rejected                               |
| 5   | B      | App doesn't show the lab's (x₆, y₆) and M = 0.81 claim for ex. 1             | low     | The table shows row 6; showing the claim adds UI the spec doesn't ask for                                                                                                                                                                                                           | rejected                               |
| 6   | B      | "near (−1, −2)" labels start at (1.5, 1.5)                                   | low     | The labels name the lab's form ("în vecinătatea"); the shared start is an approved decision                                                                                                                                                                                         | rejected                               |
| 7   | B      | RO `lab6.method.successive.start` mixes "," and ";" between point components | low     | `(x_1; y_1) = (F(x_0, y_0); G(x_0, y_0))` next to `(x, y) \mapsto (F(x, y), G(x, y))`                                                                                                                                                                                               | patch                                  |
| 8   | B      | Typing `x(y+5)` gives an "unknown function" error                            | medium  | math.js reads `x(…)` as a call; ex. 1's lab form invites it. Pre-existing in the compile layer for every lab                                                                                                                                                                        | defer                                  |
| 9   | B      | Division by zero reported as overflow                                        | low     | `2/0` is ±∞, and the shared message says a value became ±∞, which is accurate; changing it touches every lab's copy                                                                                                                                                                 | rejected                               |
| 10  | B      | Verification incomplete: toolbar not exercised, logs empty                   | low     | The toolbar code is unchanged and works on any 2-D chart, including the components chart; the logs are filled at review                                                                                                                                                             | rejected                               |
| 11  | B      | Uneven naming: 6c name vs 6b name, EN/RO hub topic differ                    | low     | 6c's name is the comparison row label and uses the lab's name; the topic keys predate this change. No named harm                                                                                                                                                                    | rejected                               |
| 12  | B      | Exact error ignores z                                                        | false   | No Lab 6 example has a 3-D exact solution; `SystemExactSolution` is documented as (x*, y*)                                                                                                                                                                                          | rejected                               |

## Verification

**Commands:**

- `bun run typecheck` -- no errors
- `bun run test` -- all suites pass
- `bun run build` -- succeeds (smoke on a spare port, killed by PID)
- `bun run format:check` -- clean

**Manual checks:**

- Run every Lab 6 preset and the comparison in EN and RO; the path chart shows both curves crossing at the solution; toolbar works; no horizontal scroll at phone width.

**Results (2026-11-24):**

- `bun run typecheck` clean; `bun run test` 39 files, 868 tests pass; `bun run format:check` clean; `bun run build` succeeds; `next start` smoke on a spare port (killed by PID): `/`, `/labs/nonlinear-systems`, `/labs/newton-systems` 200, `/labs/euler` 404.
- Headless Chrome via the DevTools protocol (session scratchpad, not committed), EN and RO at 360 and 1280 px: 6a ex. 1 and ex. 2 near (−1, −2), 6b ex. 3, 6c ex. 4 and the `ex4` comparison all run with the locked n; two Plotly charts per run, contour legends "x = F(x, y)" / "y = G(x, y)" for 6a/6c and xₙ, yₙ, zₙ for 6b; no page overflow; no console errors. Screenshots checked by eye: the curves cross at (2, 1) with the Gauss–Seidel path on y = G; 6b phone cards show the three stacked components and differences. The chart toolbar was not exercised.
- After review pass 1 (2026-11-24): the pole fix in the path chart, the Errata reason and the RO separator are patched; `bun run typecheck` clean, `bun run test` 39 files, 869 tests pass, `bun run format:check` clean, `bun run build` succeeds.
