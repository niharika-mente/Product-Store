# AGENTS.md

## Project Structure

MERN stack (MongoDB, Express, React, Node) product management app. Not a monorepo workspace — root `package.json` orchestrates `BACKEND/` and `FRONTEND/` as separate npm projects.

- `BACKEND/` — Express API (ESM modules, Mongoose, Passport, Stripe, Cloudinary, Elasticsearch)
- `FRONTEND/` — React 19 SPA (Vite, Chakra UI, Zustand, i18next, React Router)
- `e2e/` — Playwright E2E tests

## Setup

```bash
npm install
cd FRONTEND && npm install && cd ..
cp .env.example .env
cp BACKEND/.env.example BACKEND/.env
```

`BACKEND/.env.example` has all backend-specific vars (JWT_SECRET, Stripe, Cloudinary, OAuth, Elasticsearch). Required vars are validated at startup.

## Commands

| Task | Command |
|------|---------|
| Dev (backend) | `npm run dev` |
| Dev (frontend) | `cd FRONTEND && npm run dev` |
| Build (both) | `npm run build` |
| Production start | `npm run start` |
| E2E tests | `npm run test:e2e` |
| Frontend lint | `cd FRONTEND && npm run lint` |
| Frontend unit tests | `cd FRONTEND && npm run test` (Vitest) |
| Backend tests | `cd BACKEND && npm run test` (Jest) |
| Docker full stack | `docker-compose up --build` |

## CI (GitHub Actions)

Two jobs on PR to `main`:
1. **Build & Lint** — install root + frontend, `npm run build` + `npm run lint` in `FRONTEND/`
2. **Playwright E2E** — installs all 3 packages, builds frontend, runs `npx playwright test`. Requires MongoDB service on port 27017.

## Pre-commit

Husky + lint-staged runs `eslint --fix` and `prettier --write` on `*.{js,jsx}` files.

## Key Quirks

- **ESM everywhere** — all packages use `"type": "module"`. Use `import`/`export`, not `require`.
- **Env loading** — Backend `loadEnv.js` loads `.env` in dev, `.env.test` in test mode. `validateEnv()` blocks startup if required vars are missing (skipped in test mode).
- **Vite proxy** — Frontend proxies `/api` to `http://localhost:5000` in dev. No CORS issues locally.
- **Playwright auto-starts servers** — `playwright.config.js` launches backend (port 5000) and frontend (port 5173) automatically. Don't manually start them before running E2E tests.
- **Root dependency link** — `FRONTEND/package.json` has `"mern": "file:.."` pointing to root. This is intentional.
- **Swagger docs** — available at `http://localhost:5000/api/docs` when backend is running.
- **E2E test env** — Playwright config sets `NODE_ENV=test` and uses `JWT_SECRET=testsecret12345678901234567890123`.

## Testing

- Backend: Jest with `mongodb-memory-server` (in-memory MongoDB). Run with `--experimental-vm-modules`.
- Frontend: Vitest with jsdom environment. Setup file: `FRONTEND/src/setupTests.js`.
- E2E: Playwright. Tests in `e2e/`. Global setup: `e2e/global-setup.js`. Test data: `e2e/fixtures/test-data.json`.

## Skills (`.agents/skills/`)

| Skill | What it does in this repo |
|-------|--------------------------|
| `conventional-commit` | Generates conventional commit messages by reading `git diff`, then runs `git commit` automatically |
| `docker-patterns` | Guides Docker Compose setup, Dockerfile security/size review, and multi-service networking for the full MERN stack |
| `mongodb-query-optimizer` | Analyzes slow Mongoose queries, suggests indexes, and explains query performance — invoke when a query is slow |
| `nodejs-best-practices` | Advises on async patterns, security, and architecture for the Express backend in `BACKEND/` |
| `react-patterns` | Provides React 19 patterns (hooks, state, concurrent features) for components in `FRONTEND/src/` |
| `wcag-audit-patterns` | Audits `FRONTEND/` components for WCAG 2.2 accessibility violations and provides fixes |

## Deployment

Vercel serverless (see `vercel.json`). Backend uses `serverless-http` to wrap Express. Frontend builds to `FRONTEND/dist/` and is served as static files in production by the backend.
