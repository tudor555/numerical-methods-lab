# Deferred work

- source_spec: `docs/spec-foundation-lab-1.md`
  summary: Unit-test the language cookie round trip (the string `setLang` writes, with `path=/`, is one the server's `isLang` accepts) and add "reload after switching language" to the manual checks.
  evidence: No test covers the cookie the client writes against the one the server reads. Dropping `path=/` would break persistence across pages unnoticed. Not verified by a test (medium if it regresses); the browser check during implementation passed.
  status: resolved 2026-11-13. `languageCookie()` in `src/i18n/config.ts` builds the cookie and is unit-tested (path=/, one-year max-age, value accepted by `isLang`). `getRequestLang` is tested with a mocked request cookie. The manual checks now include a reload after switching language.

- source_spec: `docs/spec-foundation-lab-1.md`
  summary: Write the full README (CAP-10: project description, the 13 labs, a screenshot, the stack and the Bun commands) at the end of the project.
  evidence: The user asked on 2026-11-13 for the README to hold only the title until the project is finished. CAP-10 stays open until then. Screenshots get taken then too, into `docs/screenshots/` (the early one was removed as outdated).

- source_spec: `docs/spec-lab-3-halley-chebyshev.md`
  summary: Cover the lab page's wiring of a method's own error messages (`errorKeys`) to the results panel with a test, and consider building the run-error message in one shared helper.
  evidence: Removing `errorKeys={method.errorKeys}` in `src/components/lab/lab-page.tsx` passes every test, because lab page tests render only the first state and never reach a finished run. A Halley zero-denominator run would then show the secant wording. Needs DOM or interaction testing, which the project doesn't have yet.

- source_spec: `docs/spec-lab-5-newton-systems.md`
  summary: Give every "Derive from …" button an accessible name that says which field it fills (for example via `aria-describedby` to the field's label), so two buttons in one form don't read the same.
  evidence: Lab 5's ∂F/∂x and ∂F/∂y buttons are both "Derive from F" (and both G buttons "Derive from G"). Lab 1 already has the same pattern (f′ and dda both read "Derive from f"), so it predates this lab and needs a label id in `MethodForm`.
