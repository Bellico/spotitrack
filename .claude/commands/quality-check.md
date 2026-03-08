Run the full quality workflow on recently modified code. Execute all three phases in order — do not skip any.

## Phase 1 — code-reviewer
- Run `git diff HEAD --name-only -- 'src/**/*.ts' 'src/**/*.html' 'src/**/*.scss'`
- Review each changed file for: unused imports, dead code, Angular convention violations (per CLAUDE.md), over-engineering, missing SSR guards
- Apply all cleanups directly (no prompting)

## Phase 2 — fix-lint
- Run `npm run lint -- --fix`
- Fix manually any errors ESLint could not auto-fix
- Re-run `npm run lint` to confirm zero errors

## Phase 3 — run-tests
- Run `ng test --watch=false --browsers=ChromeHeadless`
- Fix any failing tests (source or test file, whichever is wrong)
- Re-run to confirm all pass

## Completion
Report a final summary: what was cleaned, lint status, test status.
