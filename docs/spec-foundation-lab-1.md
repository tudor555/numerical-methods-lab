---
title: "Foundation and Lab 1 (Newton, k-th roots, successive approximations)"
type: "feature"
created: "2026-11-09"
status: "done"
baseline_commit: "8c56faa4edeaebbd6ca08f25408dd6b98a21bfb9"
route: "dispatch"
review_loop_iteration: 0
context:
  - "{project-root}/docs/SPEC.md"
  - "{project-root}/docs/stack.md"
  - "{project-root}/docs/labs-catalog.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo has only docs and Prettier tooling. There is no app, so none of the 13 labs can be browsed or run.

**Approach:** Scaffold the Next.js app on the fixed stack. Build the shared foundation: Ember theme, EN/RO i18n, a restricted expression layer, a lab registry, the hub and a shared lab-page layout. Then implement Lab 1 (1a Newton, 1b k-th root, 1c scalar successive approximations) end to end as the reference pattern the other labs reuse.

## Boundaries & Constraints

**Always:**

- SPEC.md capabilities CAP-1…10 and constraints apply, scoped to the foundation and Lab 1. Algorithms follow `labs-catalog.md` Lab 1 and its Shared rules exactly: R0 for x₀ (with optional manual x₀ for 1a), x₁ computed as a separate step, loop from n = 1 while |xₙ − xₙ₋₁| ≥ ε, output n and xₙ. Max-iteration cap is editable, default 1000.
- Algorithm modules are pure TS with no React, Next or Plotly imports, and return `{ status: 'converged' | 'max-iterations' | 'error', result, iterations[], error? }`. An error carries a code (`zero-derivative`, `undefined-value` (NaN), `overflow` (±∞), `diverged` (|xₙ| > 1e100)) and keeps the partial iterations.
- Numeric fields accept constant expressions (`3*pi/8`, `1e-4`). Expression fields allow only the declared variables plus whitelisted constants and functions. Validation errors appear next to the field and block the run.
- Every UI string and explanation is keyed. `ro` must have exactly the keys of `en` (enforced by the type checker). A missing key renders a visible `⟦key⟧` marker in development. The language is stored in a cookie so the server renders it, and switching does not reset form state.
- Plotly loads client-only through a dynamic import with `ssr: false`.

**Decisions:**

- Lab 1 ex. 2 keeps the lab's interval [−1, 1]. Its preset shows the `zero-derivative` error at x₀ = 1. A second preset uses manual x₀ = 0 and converges to ≈ 0.20006.
- The hub lists all 13 labs. Labs 2–13 appear as disabled "coming soon" cards until they ship.
- The √c comparison presets (ex. 4) use 1c with φ(x) = (x + c)/(x + 1) and x₀ = c.
- The spec stays whole (≈ 2,400 tokens). The user accepted the size.
- Brand: the user's "Convergence Arc" icon (an orange rounded square with blue iterates converging to an orange point) is the app's favicon and logo. Use the derivatives cropped from it, never the Next.js defaults.
- A custom not-found page in the Ember theme, EN/RO, with a link back to the hub. Unknown routes, unknown lab slugs and labs not yet implemented all show it.
- The project has no `CLAUDE.md` or `AGENTS.md`. Delete any that the scaffold generates.

**Never:** Implement Labs 2–13 algorithms or pages, add e2e tests (Playwright or otherwise; the project has none), add a backend, add a light theme, add ESLint/Biome or any dependency beyond `stack.md` (plus `plotly.js-dist-min` and its types, `prettier-plugin-tailwindcss`, and the shadcn-generated deps), or run `create-next-app` in place.

## I/O & Edge-Case Matrix

| Scenario      | Input / State                                                            | Expected Output / Behavior                                         | Error Handling                   |
| ------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------- |
| Newton ex. 1  | f = x³−x−1, [1, 2], dda = 6, ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}                     | R0 gives x₀ = 2; converges to 1.324717957…; n grows with smaller ε | N/A                              |
| Kepler        | f = x − sin x − 0.25, manual x₀ = 3π/8, ε = 10⁻⁴, vs 1c φ = sin x + 0.25 | Both converge to ≈ 1.17122…; comparison shows both n side by side  | N/A                              |
| k-th root     | c ∈ {2, 3, 5} (k = 2), c ∈ {2, 3, 12} (k = 3)                            | x₀ = c if c > 1 else 1; converges to ᵏ√c                           | N/A                              |
| f′(xₙ) = 0    | Newton reaching a zero derivative                                        | status `error`, code `zero-derivative`, rows up to xₙ kept         | Specific message naming n and xₙ |
| NaN / ∞       | f = sqrt(x) at x < 0, or overflow                                        | status `error`, `undefined-value` or `overflow`                    | Specific message, partial table  |
| Divergence    | φ = 2x + 1, x₀ = 1                                                       | status `error`, `diverged`                                         | Specific message, partial table  |
| Cap reached   | maxIter = 3 on ex. 1, ε = 10⁻¹²                                          | status `max-iterations`, 3 iterations listed, warning shown        | Warning (amber, icon + text)     |
| Invalid input | `x^ +`, `y*x` (y undeclared), ε = 0, a ≥ b, k = 1.5, `x = 2`             | Field-level message; Run disabled                                  | No algorithm call                |

</frozen-after-approval>

## Code Map

Greenfield at the start: only `package.json` (Prettier, lint-staged, simple-git-hooks), `.gitignore`, `.prettierignore` and `docs/` existed. Final layout:

- `src/lib/expressions/compile.ts` -- restricted math.js layer: AST whitelist, declared variables, `predictable: true`, `ExpressionError` / `EvaluationError`, `parseConstant`, `derive`
- `src/lib/methods/` -- pure algorithms: `types.ts` (run result and errors), `scalar-iterate.ts` (shared x₀ → x₁ → loop driver, reused by Labs 2–4), `starting-value.ts` (rule R0), `lab1/{newton,kth-root,fixed-point}.ts`
- `src/lib/format.ts` -- number formatting for the table, tiles and ε labels
- `src/labs/` -- lab definitions and their pure logic: `types.ts`, `registry.ts`, `lab-1.ts` (fields, presets, the lab's comparisons with `taskKey`), `fields.ts` (parsing, validation, "derive from f"), `compare.ts`, `explanation.ts` (paragraph–formula rows, words inside formulas), `lab-state.ts` (the lab page reducer)
- `src/i18n/` -- `en.ts` (keys), `ro.ts` (same keys, type-checked), `translate.ts`, `provider.tsx`, `config.ts` (languages, `languageCookie`), `server.ts` (language from the request cookie)
- `src/components/lab/` -- shared lab page: `lab-page`, `explanation`, `method-form`, `results-panel`, `iteration-table`, `comparison-panel`, `status`, `formula` (KaTeX), `charts.ts` (chart data, zoom and file-name helpers), `plotly-chart` / `plotly-inner` (browser-only, app toolbar)
- `src/components/` -- `hub`, `site-header`, `not-found-view`, `ui/` (shadcn primitives)
- `src/app/` -- `layout`, `page` (hub), `labs/[slug]/page`, `not-found`, icons, `globals.css` (Ember, 8px grid, type scale)
- `src/test/render.tsx` -- renders components to HTML inside the i18n provider for tests (no DOM)

## Tasks & Acceptance

**Execution:**

- [x] `package.json`, configs -- scaffold Next.js (App Router, TS strict, Tailwind, `src/`, no linter) in a temp folder and merge it in. Add shadcn/ui, lucide-react, mathjs, katex, plotly.js-dist-min, vitest and prettier-plugin-tailwindcss. Scripts: `dev`, `build`, `start`, `typecheck`, `test`.
- [x] `src/app/globals.css` -- map Ember to the shadcn variables, keep the flat `bg`, add an optional subtle glow
- [x] `src/lib/expressions/compile.ts` + test -- restricted compile, constant-expression parse, derivative helper
- [x] `src/lib/methods/**` + tests -- driver and the three Lab 1 methods. Tests cover every preset (value and locked n per ε) and every I/O-matrix error row.
- [x] `src/i18n/**` -- EN/RO dictionaries and provider. Header language switch.
- [x] `src/labs/**` -- registry and Lab 1 definition with all presets and comparisons
- [x] `src/components/**`, `src/app/**` -- hub, shared lab page, Lab 1 explanation (KaTeX), form with "derive from f" for f′ and dda, results summary, iteration table (n, xₙ, f(xₙ), |xₙ − xₙ₋₁|), charts (f with the iterates and tangent steps for 1a; log-scale |xₙ − xₙ₋₁|), comparisons (methods × ε, rendered as wrapping ε tiles)
- [x] `src/app/{favicon.ico,icon.png,apple-icon.png}`, `public/logo.png` -- brand files cropped from the user's Convergence Arc icon (favicon.ico 16/32/48, icon.png 512, apple-icon.png 180, logo.png 128). Replace the scaffold favicon. Show the logo with `next/image` next to the app name in the header.
- [x] `src/app/not-found.tsx` -- keyed EN/RO 404 page in the shared shell, with logo and a link to the hub. `labs/[slug]` calls `notFound()` for unknown or unimplemented slugs.
- [x] `README.md` -- title only for now; the full README (CAP-10) is deferred to the end of the project at the user's request (see `docs/deferred-work.md`)

**Acceptance Criteria:**

- Given the hub, when it loads, then Lab 1 shows its EN title and topic and opens `/labs/newton`.
- Given Lab 1, when a preset is clicked, then the form fills, and Run shows the result, n, the table and the charts. Running the comparison shows n for each method × ε.
- Given filled inputs, when the language is switched to RO, then all strings and explanations change, the inputs are kept, and the choice persists across a reload.
- Given any page, then the background is `#121110`, and errors carry an icon and text.
- Given any page, then the browser tab shows the Convergence Arc favicon, and the header shows the logo.
- Given `/does-not-exist`, `/labs/unknown` or `/labs/<lab 2 slug>`, when it loads, then the 404 page renders in the current language with a working link back to the hub.

## Implementation Notes

- Scaffolded with `create-next-app` (Next.js 16.4.5, Turbopack, Tailwind 4) in a temp folder and merged in. `cacheComponents` and `partialPrefetching` were dropped from `next.config.ts`: the root layout reads the language cookie, and keeping them would require Suspense around it. `agentRules: false` stops `next dev` from writing `AGENTS.md`; the scaffold's copy was deleted.
- shadcn/ui was initialised with the `radix-nova` style. It added `cn`, `class-variance-authority`, `radix-ui`, `shadcn` (for `shadcn/tailwind.css`) and `tw-animate-css`. Only the components in use are kept (button, badge, input, table). KaTeX 0.19 ships its own types, so no `@types/katex`.
- `iterations[]` holds rows n = 0..N, with the starting row n = 0. `n` in the result is N, the number of iterations. On `max-iterations`, rows 1..maxIter are listed. On an error, `error.n`/`error.x` name the last valid iterate (the step from it failed), except `diverged`, which names the first iterate past 10¹⁰⁰.
- Locked iteration counts (ε = 10⁻⁴ / 10⁻⁸ / 10⁻¹²), cross-checked against an independent Python run: ex. 1: 5/6/7. Ex. 2, x₀ = 0: 2/3/4. Kepler, Newton: 2 (ε = 10⁻⁴); 1c: 5. 1b: √2 4/5/6, √3 4/5/6, √5 5/6/6, ∛2 5/6/6, ∛3 6/7/7, ∛12 8/9/10. 1c with φ = (x + c)/(x + 1): √2 6/12/17, √3 9/16/23, √5 12/22/31.
- The Kepler comparison uses only ε = 10⁻⁴, as the lab states. The function chart for 1c is a cobweb (φ, y = x and the iteration path). The 1b chart reuses the tangent chart on f = xᵏ − c.
- Expressions accept `ln` and `lg` as aliases of `log` and `log10`, so Labs 6+ can use the course notation.

**Changes made during review and user feedback (2026-11-11 → 2026-11-13).** Each of these was asked for or approved by the user after the spec was frozen. The frozen intent still holds; these refine how it is met.

- **No e2e tests, no agent files.** Playwright was dropped from the project (SPEC, stack, spec). `AGENTS.md` from the scaffold was deleted and `agentRules: false` keeps `next dev` from recreating it.
- **Brand and 404.** The favicon, app icons and header logo come from the user's Convergence Arc icon. The 404 page is EN/RO and covers unknown routes, unknown labs and labs not built yet.
- **Hydration error report.** It came from the user's browser (an extension or a stale tab): served HTML and client chunks matched, and a clean Chrome profile hydrated with no error. No code change was needed.
- **8px grid.** Spacing, control heights, icons, radii and line heights are multiples of 8. Body text went from 14px to 16px, small text from 12px to 14px, controls to 40/32/48px, the header to 64px. The type scale lives in `globals.css`.
- **Desktop layout.** From 1024px up, each explanation paragraph sits beside its formula, and the parameters and results share a row (5/12 + 7/12). The container went from 1152px to 1280px. The result tile is wider, and fields that have a "derive" button span the full row.
- **Copy.** The hub tagline and intro were rewritten to be natural, with no lab count. Lab descriptions never repeat the lab number; it appears as a chip above the title.
- **Romanian.** Every RO string was rewritten in natural Romanian using the course's terms (date de intrare, precizia dorită, iterația inițială, exemple numerice, problemă bilocală, metoda tangentei), with one informal register, a decimal comma and `;` in intervals in display text. Result sentences avoid the "20 de iterații" plural trap. English stays the default.
- **Formulas.** Words inside TeX are `⟪name⟫` placeholders with translation keys, so no formula carries English. The R0 formula shows both branches (`dacă f(a)·f″(a) > 0` / `≤ 0`) and the paragraph explains dda in words.
- **Chart toolbar.** Plotly's toolbar is hidden. Each chart has an app-styled toolbar (zoom to an area, pan, zoom in, zoom out, reset, PNG) with translated labels. The PNG uses the card background. Plotly's "Share chart" button, which uploads data to Plotly Cloud, was removed.
- **Comparisons follow the lab.** Only the four comparisons the lab asks for are listed (ex. 1–4), each with a "Cerința" / "Lab task" line. The ∛ comparison was removed (the lab only asks to approximate those). Where the lab leaves something open (ε for √c, the extra x₀ = 0 row in ex. 2), the card says so. Rows use the lab's wording ("Metoda tangentei"). Comparisons render as ε tiles that wrap, so no width needs a sideways scroll.
- **Names.** `lib/expr` → `lib/expressions`, `r0.ts` → `starting-value.ts` (`chooseStartingValue`), abbreviated types spelled out (`ExpressionError`, `EvaluationError`, `ExpressionField`, `CompiledFunction`, `…Definition`), and preset ids `-fp` → `-fixed-point`, `ex2-r0` / `ex2-x0` → `ex2-rule-r0` / `ex2-manual-start`. The lab's symbols (f, df, dda, eps, x0, phi) keep the lab's notation.
- **Comments.** Rewritten to explain why (the separate x₁ step, the 10¹⁰⁰ divergence limit, the language cookie). Ones that only restated the code were removed, and stale ones fixed.
- **Tests added.** Unit tests for number formatting, chart data, zoom and file names, explanation rows, and field parsing (107 → 181). Four small bugs found along the way were fixed: the ε line was invisible when a run stopped at n = 1, error messages had a trailing space, Greek letters were dropped from PNG names, and the `T` component was dead code.
- **Coverage pass (2026-11-13).** Tests grew to 301 in 26 files. Components and routes are rendered to HTML with `react-dom/server` (helper `src/test/render.tsx`), with no DOM and no new dependencies. The lab page's state moved into a pure reducer (`labs/lab-state.ts`), so edit, preset, run and tab switching are unit-tested; this also stops each run from executing twice under React Strict Mode. The result grid became its own component, `ComparisonResults`, so its tiles are tested. The language cookie string moved to `languageCookie()` and is tested, which closes the deferred cookie item. Coverage (v8, measured outside the project): lines ~85% overall; `lib/` and `labs/` 97–100%, `i18n` 90%. What's left untested is by design: `plotly-inner` (needs a browser), `layout.tsx` (needs `next/font`), click handlers (their logic is in the reducer), and four unreachable defensive lines. A Chrome smoke run covered preset → run → language switch (inputs and result kept) → reload (RO kept) → edit (stale result cleared).
- **Validation fixes (2026-11-13).**
  - **CAP-5 for 1b.** The k-th root now declares its exact value ᵏ√c (`PreparedRun.exact`). The results show the exact value and the final error, the iteration table gets a |xₙ − ᵏ√c| column, and the convergence chart a second line for the error. Methods without a known exact value (1a, 1c) show none.
  - **`package.json`.** `ignoreScripts` and `trustedDependencies` were removed: `unrs-resolver` isn't installed, and `sharp` 0.35 has no install script, so both keys did nothing. `bun install` reports no changes.
  - **The f(xₙ) column.** It now hides only "undefined here" errors and re-throws any other error, like a step does.
  - **Long tables.** A run above the default cap shows its first and last 50 rows, a "hidden iterations" line and a "show all" button (scoped to that run), so a 100 000-iteration run no longer freezes the page. Runs at the default cap of 1000 are always shown in full.
- **Screenshots and README.** The README holds only the title, and the early screenshot was removed because the UI has changed since. Both get redone at the end of the project, with screenshots in `docs/screenshots/`.

## Spec Change Log

- **2026-11-09, human renegotiation (before implementation).** The user removed e2e tests from the project ("for this project will not have e2e tests"). Playwright, the `test:e2e` script and the smoke-test task were dropped, and a Never clause was added.
- **2026-11-09, human renegotiation (during implementation).** The user added scope: favicon and logo from the Convergence Arc icon, a not-found page, and no `CLAUDE.md`/`AGENTS.md`. Added as Decisions, two tasks and two acceptance criteria. KEEP: the 404 covers unknown routes, unknown labs and labs not built yet.
- **2026-11-13, human renegotiation.** The user approved removing the course-materials clause from the Never list, because the docs don't refer to those files. Nothing else in the frozen block changed.
- **2026-11-11 → 13, user-directed refinements after review.** These are listed under Implementation Notes. None changes the frozen intent: they refine layout, copy, Romanian, charts, comparisons (only what the lab asks for), naming and tests.

## Review Triage Log

Review pass 1 (blind = B, edge-case = E, verification-gap = VG).

| #   | Source | Finding                                                                                                                      | Verdict                       | Evidence                                                                                                      | Route                                                   |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | E      | Whitelisted function with wrong arity (`sin(x, 2)`, `sin()`) passes validation, then math.js throws a raw TypeError          | high                          | Probe: `prepare` with ε = `sin(1,2)` throws TypeError inside the render `useMemo`, so typing crashes the page | patch                                                   |
| 2   | E      | Same raw TypeError escapes `parseConstant`/`prepare`                                                                         | high                          | Same root cause as #1 (probe confirmed)                                                                       | patch (with #1)                                         |
| 3   | E      | Same raw TypeError escapes `scalarIterate` during a run                                                                      | high                          | Same root cause as #1: `phi = sin(x,2)` throws on Run                                                         | patch (with #1)                                         |
| 4   | E      | k-th root: `x ** (k-1)` overflows for large k, so `c/power = 0` and the run reports false convergence                        | medium                        | Probe: c = 2, k = 10⁶ → `converged`, n = 1, 1.999998                                                          | patch                                                   |
| 5   | B, E   | `maxIter` has no upper bound; a non-diverging oscillation runs synchronously and freezes the tab                             | medium                        | Field rule is only integer ≥ 1; φ = −x never trips the 10¹⁰⁰ divergence check                                 | patch                                                   |
| 6   | E      | `xRange` spreads every iterate into `Math.min/max`, overflowing the stack past ~120k rows                                    | medium                        | Reachable only through #5; grouped with it                                                                    | patch (with #5)                                         |
| 7   | B, E   | Iteration table renders every row into the DOM                                                                               | low                           | Bounded once #5 caps maxIter at 10⁵; virtualising adds complexity                                             | patch (bounded via #5); head/tail + show all 2026-11-13 |
| 8   | E      | "Derive from f" on `tanh` writes `sech(x)^2`, which the field then rejects                                                   | low                           | Probe: every whitelisted function round-trips except tanh → sech                                              | patch                                                   |
| 9   | B, E   | A failed "derive" message stays after the source f is fixed or a preset loads, and masks the field's real validation message | low                           | `deriveIssue` is cleared only by editing the same input; `shown = deriveIssue ?? issue`                       | patch                                                   |
| 10  | B      | Old results stay on screen after inputs change or another preset loads, with no sign they no longer match                    | medium                        | `runs[method.id]` is replaced only on Run; loading √3 still shows the √2 run                                  | patch                                                   |
| 11  | B, E   | Server-rendered tab titles and descriptions stay English in RO                                                               | low                           | `generateMetadata` uses `en[...]`; root and 404 metadata are hard-coded English                               | patch                                                   |
| 12  | B, E   | Newton R0 with f(a) undefined returns `iterations: []`, contradicting the `RunResult` doc                                    | low                           | `newton.ts` R0 branch; doc says row n = 0 is always present                                                   | patch (doc + test)                                      |
| 13  | VG     | R0's x₀ = a branch is never tested                                                                                           | low                           | Every R0 test has f(a)·f″(a) < 0                                                                              | patch                                                   |
| 14  | VG     | Newton's R0 path with f(a) undefined has no test                                                                             | low                           | No R0 call uses an f undefined at a                                                                           | patch (with #12)                                        |
| 15  | VG     | Derive failure message keys are not pinned; the `derive-undefined` branch is never reached                                   | low                           | `lab-1.test.ts` only asserts `.ok === false`                                                                  | patch                                                   |
| 16  | VG     | No check that the language cookie the client writes is the one the server reads (path, value)                                | medium (unverified by a test) | No e2e tests by decision; browser check passed during implementation                                          | defer → resolved 2026-11-13 (`languageCookie` + tests)  |
| 17  | B      | Two `compile.test.ts` tests put `expect` inside `try/catch` and pass if nothing throws                                       | low                           | "names rejected constructs readably" and the `1/x` overflow case                                              | patch                                                   |
| 18  | B      | `chart.noData` is defined in EN and RO but never used                                                                        | low                           | No reference outside the dictionaries; the error message already explains the empty run                       | patch (delete key)                                      |
| 19  | B      | Tab and radio roles without arrow-key handling; `role="img"` hides the chart modebar from assistive tech                     | low                           | `lab-page.tsx` tablist, `method-form.tsx` radiogroup, `plotly-chart.tsx`                                      | patch (plain `aria-pressed` buttons, drop `role="img"`) |
| 20  | B      | README says only "Requires Bun", but `next` runs on Node                                                                     | low                           | The `next` bin uses a Node shebang; `bun run dev` needs Node                                                  | patch                                                   |
| 21  | B      | `stack.md` still says "When Tailwind arrives, add prettier-plugin-tailwindcss"                                               | low                           | The plugin is now installed and configured                                                                    | patch                                                   |
| 22  | B      | `package.json` lists sharp and unrs-resolver in both `ignoreScripts` and `trustedDependencies`                               | maybe-false                   | Unclear whether Bun 1.4 reads `ignoreScripts`; install and build both work. Would only be low                 | rejected → fixed 2026-11-13 (both keys removed)         |
| 23  | B      | `@tailwindcss/turbopack` is outside the spec's dependency list                                                               | false                         | It is Tailwind's own build integration from the Next.js scaffold, and Tailwind is in `stack.md`               | rejected                                                |
| 24  | B      | The spec contains a session temp path and an open status                                                                     | low                           | The fix edits this build's spec; status is closed by the workflow                                             | rejected (spec edit)                                    |
| 25  | B      | The convergence chart drops a final step with diff = 0                                                                       | low                           | Rare (exact fixed point); a fix adds branches                                                                 | rejected                                                |
| 26  | B      | No unit tests for `format.ts`/`charts.ts`; some AC are only checked manually                                                 | low                           | No defect shown; no e2e by project decision; manual checks live in the spec                                   | rejected                                                |
| 27  | B      | shadcn UI imports `cn` from `"cn"` instead of `@/lib/utils`                                                                  | low                           | This is shadcn's generated output, and `@/lib/utils` re-exports the same function; no caller diverges         | rejected                                                |
| 28  | E      | Deriving dda with `a` invalid blames f                                                                                       | false                         | The message says "Fix the function (and the point) first"                                                     | rejected                                                |
| 29  | E      | An unknown `x0Mode` value is treated as R0                                                                                   | false                         | The value only comes from the radio buttons and static presets; no path produces another value                | rejected                                                |
| 30  | E      | A comparison row can feed one method's preset into another method                                                            | false                         | Comparisons are static data; `lab-1.test.ts` locks every row's results                                        | rejected                                                |

## Verification

**Commands:**

- `bun run typecheck` -- no errors
- `bun run test` -- all Vitest suites pass (26 files, 321 tests)
- `bun run build` -- succeeds
- `bun run format:check` -- clean

**Manual checks:**

- Run every Lab 1 preset in EN and RO. Zoom, pan, reset and PNG download work from the chart toolbar, and hover shows values. At phone width there is no horizontal page scroll, including the comparisons.
- Switch the language with inputs filled: inputs and results stay, and a reload keeps the language.
