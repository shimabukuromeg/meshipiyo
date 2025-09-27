# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by `pnpm` and `turbo`.
- Apps: `apps/frontend` (Next.js 15), `apps/backend` (Fastify + GraphQL Yoga + Prisma).
- Shared/other: `components/**`, `docs/**`, `.github/workflows/**` (CI), `compose.yml` (services).
- Test roots: backend unit tests live under `apps/backend/src/**/*.test.ts`; frontend E2E under `apps/frontend/e2e/**`.

## Build, Test, and Development Commands
- Install: `pnpm install`
- Start services (DB + Firebase Emulator): `make up` • Full dev: `make dev`
- Run all apps (turbo): `pnpm dev` • Build all: `pnpm build`
- Backend only: `pnpm --filter backend dev | build | start`
- DB migrations: `pnpm --filter backend db:migrate:dev`
- Tests:
  - Backend (Vitest): `pnpm --filter backend test`
  - Frontend E2E (Playwright): `pnpm --filter frontend exec playwright install && pnpm --filter frontend exec playwright test`

## Coding Style & Naming Conventions
- Language: TypeScript across apps.
- Formatter/Linter: Biome at root (`pnpm lint`, `pnpm format`); frontend additionally uses ESLint Next config.
- Formatting (Biome): 2-space indent, line width 80, single quotes, semicolons as needed.
- File naming: prefer kebab-case for files/dirs; React component names are PascalCase; tests end with `.test.ts`.

## Testing Guidelines
- Backend: Vitest for unit tests; place tests near source (e.g., `src/services/foo.test.ts`).
- Frontend: Playwright for E2E in `apps/frontend/e2e`; configure `BASE_URL` when needed.
- Aim to cover core business logic and error paths. Keep tests deterministic; use Docker emulators where applicable.

## Commit & Pull Request Guidelines
- Commit style: use concise prefixes seen in history (`feat:`, `fix:`, `chore:`, `refactor:`, `debug:`). One change per commit when practical.
- PRs: include clear description, linked issues (e.g., `Closes #123`), and screenshots for UI changes.
- Pre-PR checklist: `pnpm format`, `pnpm lint`, backend tests pass, Playwright checks relevant flows.

## Security & Configuration Tips
- Never commit secrets. Copy env files and edit locally:
  - Frontend: `cp apps/frontend/.env.local.example apps/frontend/.env.local`
  - Backend: `cp apps/backend/.env.example apps/backend/.env`
- Local endpoints: FE `http://localhost:33000`, BE `http://localhost:44000`, Emulator UI `http://localhost:4000`.

