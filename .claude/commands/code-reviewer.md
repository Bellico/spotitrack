Review recently modified source files for code quality and clean them up.

Steps:
1. Run `git diff HEAD --name-only -- 'src/**/*.ts' 'src/**/*.html' 'src/**/*.scss'` to identify changed files
2. Read each changed file and review for:
   - Unused imports or variables
   - Dead code or unreachable branches
   - Angular convention violations (per CLAUDE.md: `inject()`, signals, standalone, `takeUntilDestroyed`, `isPlatformBrowser`, `afterNextRender`, new control flow `@if`/`@for`)
   - Over-engineering or unnecessary complexity
   - Missing or wrong SSR guards (`isPlatformBrowser` for Firebase/localStorage)
3. Apply all cleanups directly to the files (no asking — just fix)
4. Report a concise list of what was changed and why
