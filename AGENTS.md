# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Expo Router screens (`index.tsx`, `settings.tsx`) and route layout (`_layout.tsx`). Keep route-level UI and navigation wiring here.
- `src/features/` contains domain modules (`auth`, `todos`), including feature types, logic, and Jotai atoms under `_atoms/`.
- `src/lib/` contains shared infrastructure (storage adapters, Jotai helpers, providers).
- `components/`, `hooks/`, and `constants/` are for reusable UI and app-wide utilities.
- `assets/` stores static images/icons; avoid mixing generated files into source folders.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run start` — start Expo dev server.
- `npm run ios` / `npm run android` / `npm run web` — launch platform-specific targets.
- `npm run lint` — run ESLint on `app/**/*.ts(x)` and `src/**/*.ts(x)`.
- `npm run reset-project` — reset starter app scaffold (use only when intentionally reinitializing).

## Coding Style & Naming Conventions
- TypeScript is strict (`tsconfig.json`), so prefer explicit types at feature boundaries.
- Use 2-space indentation, semicolons, double quotes, and trailing commas for multiline structures.
- Use Expo/React Native functional components and hooks; keep components small and composable.
- Naming: `PascalCase` for components/types, `camelCase` for variables/functions, `SCREAMING_SNAKE_CASE` for constants.
- Import shared code via `@/*` alias (example: `@/features/auth/session`).

## Testing Guidelines
- No test runner is configured yet. When adding tests, prefer colocated `*.test.ts` / `*.test.tsx` files near the target module.
- Prioritize unit tests for pure logic in `src/features/**` and `src/lib/**` (e.g., session validity, storage wrappers).
- At minimum, run `npm run lint` before opening a PR.

## Commit & Pull Request Guidelines
- Current history is minimal (`init`, `Construct the codebase skeleton`); use clear, imperative commit messages (e.g., `feat(auth): add session expiry check`).
- Keep commits focused and atomic; avoid mixing refactors with behavior changes.
- PRs should include: purpose, key changes, manual verification steps, and screenshots/GIFs for UI updates.
- Link related assignment/task context in the PR description when applicable.

## Security & Configuration Tips
- Store sensitive values in Secure Store wrappers (`src/features/auth/secureAuthStorage.ts`), not AsyncStorage.
- Do not commit secrets, local env files, or platform credentials.
