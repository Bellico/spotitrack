Run ESLint with auto-fix and resolve any remaining errors manually.

Steps:
1. Run `npm run lint -- --fix` from the project root
2. Read the output carefully
3. For any errors that ESLint could not auto-fix, open the affected files and fix them manually
4. Re-run `npm run lint` to confirm zero errors
5. Report the final status (clean / errors fixed / errors remaining)
