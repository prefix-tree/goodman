# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

Voice agent and automation app built as a pnpm monorepo.

## Monorepo Structure

- `apps/web` — Next.js 16 frontend (React 19, shadcn/ui, Tailwind CSS v4)
- `apps/api` — Hono backend on Node.js
- `packages/` — shared packages (not yet created)

## Commands

```bash
pnpm dev          # start both web (port 3000) and api (port 3001) in parallel
pnpm dev:web      # start only frontend
pnpm dev:api      # start only backend
pnpm build        # build all packages
pnpm lint         # lint all packages
pnpm typecheck    # typecheck all packages
```

## Validation

After making changes, always run these to catch errors before reporting done:

```bash
pnpm typecheck                    # full monorepo typecheck
pnpm --filter web typecheck       # typecheck only web
pnpm --filter api typecheck       # typecheck only api
pnpm --filter web lint            # eslint for web (next lint)
pnpm --filter api lint            # typecheck for api (tsc --noEmit)
pnpm build                        # verify production build passes
```

**Run `pnpm typecheck` after every code change.** Fix all type errors before moving on. Do not use `@ts-ignore` or `any` to suppress errors — find the correct type.

## Architecture

### Web (`apps/web`)

- **Framework:** Next.js 16 with App Router, Turbopack enabled
- **Styling:** Tailwind CSS v4 via `@tailwindcss/postcss`, shadcn/ui components, `tw-animate-css`
- **Import alias:** `@/` maps to `./src/`
- **UI components:** shadcn/ui in `src/components/ui/`, app components in `src/components/`
- **State:** Zustand stores in `src/stores/`
- **API proxy:** Next.js rewrites `/api/*` requests to the Hono backend (`API_URL` env var, defaults to `http://localhost:3001`)

### API (`apps/api`)

- **Framework:** Hono with `@hono/node-server`
- **Entry:** `src/index.ts` (server) imports `src/app.ts` (Hono app)
- **Dev:** `tsx watch` for hot reload
- **Build:** `tsup` to ESM
- **CORS:** enabled globally
