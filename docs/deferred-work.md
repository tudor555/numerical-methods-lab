# Deferred work

- source_spec: `docs/spec-foundation-lab-1.md`
  summary: Unit-test the language cookie round trip (the string `setLang` writes, with `path=/`, is one the server's `isLang` accepts) and add "reload after switching language" to the manual checks.
  evidence: No test covers the cookie the client writes against the one the server reads. Dropping `path=/` would break persistence across pages unnoticed. Not verified by a test (medium if it regresses); the browser check during implementation passed.
  status: resolved 2026-11-13. `languageCookie()` in `src/i18n/config.ts` builds the cookie and is unit-tested (path=/, one-year max-age, value accepted by `isLang`). `getRequestLang` is tested with a mocked request cookie. The manual checks now include a reload after switching language.

- source_spec: `docs/spec-foundation-lab-1.md`
  summary: Write the full README (CAP-10: project description, the 13 labs, a screenshot, the stack and the Bun commands) at the end of the project.
  evidence: The user asked on 2026-11-13 for the README to hold only the title until the project is finished. CAP-10 stays open until then. Screenshots get taken then too, into `docs/screenshots/` (the early one was removed as outdated).
