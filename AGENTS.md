<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev           # Dev server (no Turbopack)
npm run build         # Production build
npm run start         # Production server
npm run lint          # ESLint
npm run test          # Vitest — watch mode
npm run test:run      # Vitest — run once
npm run test:coverage # Vitest — with coverage
npm run db:push       # Push Prisma schema to DB
npm run db:seed       # Seed initial data (password: password123)
npm run db:studio     # Open Prisma Studio
```

## Architecture

- **Next.js 16.2.4** (App Router) — non-standard version. Socket.IO removed; use polling.
- **PostgreSQL + Prisma 6** — 13 models. Schema: `prisma/schema.prisma`. Client: `src/lib/db.ts`.
- **NextAuth v5 (beta)** — config: `src/lib/auth.ts`. Server: `auth()`, Client: `useSession()`. Sessions expire after 30 min.
- **Tailwind CSS 4** — custom theme in `src/app/globals.css` via `@theme`. Primary: emerald-500, Accent: blue-500.
- **Vitest + Testing Library** — tests in `__tests__/` dirs, `*.test.ts` / `*.test.tsx`. Coverage targets `src/lib/` and `src/components/`.
- **Zod** — all input validation in `src/lib/validations.ts`. Use `safeParse()`.

## Auth & Routing

- **Middleware**: `src/proxy.ts` (NOT `middleware.ts`). Next.js 16 uses `proxy.ts` for route guards.
- 5 roles: `PATIENT`, `ADMIN`, `DOCTOR`, `OWNER`, `PHARMACY`.
- Auth pages: `src/app/(auth)/`
- Dashboards: `src/app/(dashboard)/{admin,doctor,owner,patient,pharmacy}/`
- Sidebar menu in `src/components/layout/Sidebar.tsx` adapts per role.
- Dashboard layout (`src/app/(dashboard)/layout.tsx`) redirects unauthenticated users to `/login`.

## Key Conventions

- All user-facing strings in **Indonesian**.
- Server Components by default; add `'use client'` only for interactivity.
- Path alias: `@/` → `./src/`.
- No comments unless explicitly requested.
- API routes in `src/app/api/` with rate limiting (`src/lib/rate-limit.ts`).
- Audit logging via `createAuditLog()` from `@/lib/audit` for critical actions.
- Output: `standalone` (Docker-ready via `docker-compose.yml`).
- CORS header hardcodes `192.168.1.12:3000` in `next.config.ts` — update if deploying elsewhere.

## Gotchas

- **Rate limiting is in-memory** — resets on server restart. Not Redis-backed.
- **Seed password**: all demo accounts use `password123`.
- **Doctor schedule** stored as JSON in schema — seed uses Mon-Fri time slots.
- **PaymentStatus** has 5 states: `PENDING`, `AWAITING_MEDICINE`, `READY_FOR_PAYMENT`, `PAID`, `CANCELLED`.

## Git

- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.

---

When in doubt, read existing code. Follow established patterns.
