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
| E2E tests                 | Playwright           |
| Package manager / runner  | Bun                  |

## Conventions

- **Split between algorithms and UI.** Each method is a pure function, roughly `run(input) → { status, result, iterations[] , message? }`. `status` is one of `converged | max-iterations | error`. `iterations[]` holds every iterate or node row the table and charts need. Nothing in this layer imports React, Next or Plotly.
- **Lab registry.** One typed definition per lab drives the hub and the lab page: id, slug, EN/RO title and topic, methods, form fields (with the variables each expression may use), and presets with their exact solutions. A new lab is added by adding its definition, the algorithm module and its explanation content.
- **Visual direction.** A modern, clean, professional look suited to an educational math platform. Responsive layouts, shadcn/ui components, clear parameter forms, readable notation. Theme: **Ember**, a single dark theme (palette below). Never a white background. The background is a flat `bg` color. Any glow or texture is optional and must stay subtle; finish it during the foundation build.
- **Shared lab page.** Every lab page has the same layout: explanation, then parameter form with presets, then results (summary, iteration table, chart), then comparison. Lab 1 sets this pattern.
- **Expression layer.** One wrapper around math.js compiles an expression with a declared variable list into a `(…args) => number`. It rejects unknown symbols, assignment and function definitions, and throws a typed error on non-finite results.
- **Charts.** Plotly needs `window`, so load it only on the client with a dynamic import and `ssr: false`. The rest of the page renders on the server.
- **i18n.** EN/RO through translation keys: UI code refers to strings only by key (e.g. `lab1.method.newton.title`), and each language has its own dictionary with the same keys. Explanation text is keyed the same way. Formulas are shared between languages. A missing key should be easy to spot in development.
- **Formatting.** Prettier runs on staged files before each commit. All config is in `package.json`: the `prettier` key, `simple-git-hooks` (pre-commit runs lint-staged) and `lint-staged`. Only `.prettierignore` is a separate file. After editing the hook in `package.json`, run `bunx simple-git-hooks` to reinstall it. `bun run format` and `bun run format:check` cover the whole repo. Multi-line formulas in Markdown go in fenced code blocks, because Prettier turns lines that start with `+`, `-` or `*` into list items. `package.json` existed before the app was scaffolded, so add Next.js in a temp folder and merge it in rather than running `bunx create-next-app --use-bun` in place. When Tailwind arrives, add `prettier-plugin-tailwindcss`.
- **Tests.** Each algorithm has Vitest cases that reproduce every preset in `labs-catalog.md`, checking the converged value and iteration count or the node errors against the exact solution. Each lab page has one Playwright smoke test: load a preset, run it, see the result.
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
