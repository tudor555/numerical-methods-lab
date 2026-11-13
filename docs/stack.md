# Stack and conventions

## Stack (fixed)

| Concern                   | Choice               |
| ------------------------- | -------------------- |
| Framework                 | Next.js (App Router) |
| Language                  | TypeScript (strict)  |
| Styling                   | Tailwind CSS         |
| UI components             | shadcn/ui            |
| Icons                     | Lucide React         |
| Expression parsing / math | math.js              |
| Math notation             | KaTeX                |
| Charts                    | Plotly.js            |
| Unit tests                | Vitest               |
| Package manager / runner  | Bun                  |

## Conventions

- **Split between algorithms and UI.** Each method is a pure function, roughly `run(input) → { status, result, iterations[] , message? }`. `status` is one of `converged | max-iterations | error`. `iterations[]` holds every iterate or node row the table and charts need. Nothing in this layer imports React, Next or Plotly.
- **Lab registry.** One typed definition per lab drives the hub and the lab page: id, slug, EN/RO title and topic, methods, form fields (with the variables each expression may use), and presets with their exact solutions. A new lab is added by adding its definition, the algorithm module and its explanation content. Presets and comparisons come only from the lab's own exercises, in the lab's order. Each comparison shows a short paraphrase of the lab task (`taskKey`) and says what the app chose wherever the lab leaves something open, such as a missing ε. A method whose exact solution is known declares it (`exact`: value and TeX name), and the page then shows the exact value, the error per iterate and an error line on the convergence chart (CAP-5).
- **Visual direction.** A modern, clean, professional look suited to an educational math platform. Responsive layouts, shadcn/ui components, clear parameter forms, readable notation. Theme: **Ember**, a single dark theme (palette below). Never a white background. The background is a flat `bg` color. Any glow or texture is optional and must stay subtle. Sizes follow an **8px grid**: spacing, control heights, icons, radii and line heights are multiples of 8, with 4px only as a half-step inside small segmented controls. Body text is 16px, small text 14px, headings 24/32/40/48px (the type scale lives in `globals.css`). Copy is natural and a little catchy. Lab numbers appear only on hub cards and as the chip above a lab title, never inside descriptions.
- **Shared lab page.** Every lab page has the same layout: explanation, then parameter form with presets, then results (summary, charts, iteration table), then comparisons. From 1024px up, each explanation paragraph sits beside its formula and the parameters and results share one row; below that everything stacks. Comparisons render as rows of ε tiles that wrap, so no screen size needs a sideways scroll. Lab 1 sets this pattern.
- **Expression layer.** One wrapper around math.js compiles an expression with a declared variable list into a `(…args) => number`. It rejects unknown symbols, assignment and function definitions, and throws a typed error on non-finite results.
- **Charts.** Plotly needs `window`, so load it only on the client with a dynamic import and `ssr: false`. The rest of the page renders on the server. Plotly's own toolbar is hidden. Each chart has the app's toolbar instead (zoom to an area, pan, zoom in, zoom out, reset, PNG download), and the cloud-share button is never offered. Chart data is built in `components/lab/charts.ts` without Plotly, so it can be unit-tested.
- **i18n.** EN/RO through translation keys: UI code refers to strings only by key (e.g. `lab1.method.newton.title`), and each language has its own dictionary with the same keys. Explanation text is keyed the same way. Formulas are shared between languages; a word inside a formula is written as a `⟪name⟫` placeholder with a translation key, never hard-coded in the TeX. A missing key shows as `⟦key⟧` in development. English is the default language, and the choice is stored in a cookie so the server renders it. **Romanian is the language the app is read and evaluated in**, so Romanian strings are written as a native speaker would, using the course's own terms (date de intrare, precizia dorită, iterația inițială, exemple numerice, problemă bilocală), a decimal comma and `;` between interval ends in display text. Input fields keep the decimal point.
- **Formatting.** Prettier runs on staged files before each commit. All config is in `package.json`: the `prettier` key, `simple-git-hooks` (pre-commit runs lint-staged) and `lint-staged`. Only `.prettierignore` is a separate file. After editing the hook in `package.json`, run `bunx simple-git-hooks` to reinstall it. `bun run format` and `bun run format:check` cover the whole repo. Multi-line formulas in Markdown go in fenced code blocks, because Prettier turns lines that start with `+`, `-` or `*` into list items. `package.json` existed before the app was scaffolded, so add Next.js in a temp folder and merge it in rather than running `bunx create-next-app --use-bun` in place. `prettier-plugin-tailwindcss` is configured in the `prettier` key and sorts Tailwind classes.
- **Tests.** Each algorithm has Vitest cases that reproduce every preset in `labs-catalog.md`, checking the converged value and iteration count or the node errors against the exact solution. Every pure helper has a test next to it. Components and routes are rendered to HTML with `react-dom/server` through `src/test/render.tsx`, in the `node` environment with no DOM library. Logic that would otherwise sit in click handlers lives in pure functions or reducers (`labs/lab-state.ts`) so it can be tested. There are no e2e tests; anything that needs a real browser (Plotly) is checked manually.
- **Naming and comments.** Folders, files and exported identifiers use full words (`lib/expressions`, `ExpressionError`, `starting-value.ts`). The lab's own symbols (`f`, `df`, `dda`, `eps`, `x0`, `phi`) keep the lab's notation. Comments are few: they explain why or name a non-obvious rule, and never restate the code.
- **Bun.** Bun is the package manager and script runner (`bun install`, `bun add`, `bun run <script>`, `bunx`). `bun.lock` is the only lockfile, so never add `package-lock.json` or `pnpm-lock.yaml`. Unit tests still run on Vitest through a `test` script (`bun run test`). `bun test` starts Bun's own test runner, which this project doesn't use. Bun skips install scripts from dependencies unless they're listed in `trustedDependencies`. If a package needs one, add it there. If Bun ever blocks the stack, fall back to pnpm.

## Palette: Ember

Map these colors to shadcn/ui's theme variables (`--background`, `--card`, `--primary`, and so on) so components pick them up automatically.

| Role       | Hex       | Use                                                                               |
| ---------- | --------- | --------------------------------------------------------------------------------- |
| Background | `#121110` | Page background                                                                   |
| Surface    | `#1A1816` | Cards, panels                                                                     |
| Raised     | `#24211E` | Inputs, stat tiles, active nav, formula blocks                                    |
| Border     | `#3A342E` | Borders, dividers, table rules                                                    |
| Text       | `#F3EEE9` | Main text                                                                         |
| Muted text | `#ABA298` | Labels, help text, axis ticks                                                     |
| Accent     | `#FF6A1A` | Primary buttons, active tab, focus ring, main chart series. Text on it: `#2A0E00` |
| Secondary  | `#7FD1FF` | Second chart series (exact solution, tangent steps, other method in a comparison) |
| Success    | `#6BDB8F` | "Converged" status                                                                |
| Warning    | `#FFC145` | "Max iterations reached" and similar warnings                                     |
| Error      | `#FF4D6A` | Errors, invalid inputs                                                            |

Error (rose) and Accent (orange) are close in hue, so error states always carry an icon and text as well as color.
