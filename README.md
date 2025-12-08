## med_bot (my-v0-project)

A developer-focused guide for the med_bot Next.js application. This README explains how the project is organized, how to set it up and run it locally on Windows (PowerShell), common scripts, conventions, and who to contact for questions.

## Quick summary

- Project: med_bot (package.json name: `my-v0-project`)
- Framework: Next.js (v15)
- Language: TypeScript + React (React 19)
- Styling: Tailwind CSS

This repository implements a Next.js application using the new app router (app/). It contains UI components, feature modules (nurse/admin), shared hooks, and API clients.

## Requirements

- Node.js (LTS recommended) — prefer Node 18+ or the project's CI Node version
- pnpm (this repo uses pnpm-style lockfile `pnpm-lock.yaml`)
- PowerShell or any POSIX shell (commands below include PowerShell examples)

## Setup (Windows / PowerShell)

Open PowerShell at the repository root (`e:/IHUB_Robotics/medibot`) and run:

```powershell
# install dependencies
pnpm install

# run development server
pnpm dev

# build for production
pnpm build

# start production server (after build)
pnpm start

# run linter
pnpm lint
```

Notes:

- The project uses `pnpm` and has a `pnpm-lock.yaml`. If you prefer `npm` or `yarn`, you can adapt the commands but `pnpm` is recommended for consistency.

## package.json scripts

This project exposes the following scripts (from `package.json`):

- `dev` — run Next.js in development mode (`next dev`)
- `build` — produce a production build (`next build`)
- `start` — start the production server (`next start`)
- `lint` — run Next.js/ESLint linting (`next lint`)

Use `pnpm <script>` or `pnpm run <script>`.

## Environment variables

There are no explicit env files committed. Typical Next.js apps use `.env.local` for local secrets. Create a `.env.local` at repository root for local-only values.

Recommended placeholders (create and adjust to your backend):

```
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# Add any other secrets required by your APIs or services
```

If your backend requires authentication keys or connection strings, do not commit them. Add instructions here for exact variable names when the backend/infra is known.

## Project layout (important folders)

Top-level folders and their purpose (high level):

- `app/` — Next.js app router pages and layouts (primary entrypoint)
- `components/` — shared React components used across features (UI primitives and composed parts)
- `features/` — feature modules organized by domain (e.g., `admin`, `nurse`) containing pages, hooks, api clients, and components
- `lib/` — shared utilities and API clients (for example `lib/api` and `lib/utils.ts`)
- `hooks/` — custom React hooks used across the app
- `public/` — static assets (images, icons)
- `styles/` — global and feature-specific stylesheets (e.g., Tailwind overrides)
- `types/` — TypeScript types and shared interfaces

Files of special interest:

- `package.json` — scripts and dependencies
- `next.config.mjs` — Next.js configuration
- `tailwind.config.ts` and `postcss.config.mjs` — styling setup

## Conventions and patterns

- UI primitives live in `components/ui/*` and are reusable across features.
- Feature-specific code (pages, hooks, components, API clients) lives under `features/<feature-name>`.
- Use TypeScript types from `types/` for cross-cutting interfaces.
- Prefer `lib/api/apiClient.ts` for centralized HTTP client setup (axios or fetch wrapper).
- Use React Query (`@tanstack/react-query`) for server state and caching.

Branching & commits

- Branch naming: `feature/<short-description>`, `fix/<issue>`, `chore/<task>`.
- Commit messages: short imperative summary. Example: `feat(nurse): add patient assignment modal`.
- Open a PR to `main` and request at least one code review for non-trivial changes.

Code style and linting

- Linting is available via `pnpm lint` (configured with Next.js ESLint). Add Prettier if desired — keep formatting consistent.
- TypeScript is enforced; run `pnpm build` occasionally to catch type-only errors.

Testing

This repository does not include tests by default. Recommended additions:

- Unit tests: Vitest or Jest for React component tests.
- Integration: Playwright or Cypress for end-to-end flows.

Add a `tests/` folder and CI job when adopting tests.

Developer workflow

1. Pull latest `main`.
2. Create a branch using the naming convention.
3. Implement changes, add tests (if present), run `pnpm lint` and `pnpm build` locally.
4. Push the branch and open a pull request.

Onboarding notes for new developers

- Start the dev server: `pnpm dev` and open `http://localhost:3000`.
- Inspect `app/layout.tsx` and `app/page.tsx` for global layout and routing patterns.
- Look into `features/nurse` and `features/admin` to see how feature modules are structured.

Troubleshooting

- If the dev server fails to start, run `pnpm install` again and check your Node version.
- For TypeScript errors, run `pnpm build` which surfaces compile errors.

Contact and maintainers

- Repository owner/maintainer: add a real name and contact email/GitHub handle here.

Contributing

If you want to contribute, open an issue or a pull request. Add a short description of the change and link to any related task or ticket.

License

- Add a license file (e.g., `LICENSE`) if the project is open source. If internal, indicate internal use only.




