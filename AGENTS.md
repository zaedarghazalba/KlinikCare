<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev           # Dev server (plain `next dev`, no Turbopack)
npm run build         # Production build (output: standalone)
npm run lint          # ESLint flat config (eslint.config.mjs)
npm run test          # Vitest watch
npm run test:run      # Vitest single run (CI-equivalent)
npm run test:coverage # Vitest + v8 coverage
npm run db:push       # Push prisma/schema.prisma to DB (no migration)
npm run db:seed       # Run prisma/seed.ts (demo password: password123)
npm run db:studio     # Prisma Studio
```

`postinstall` runs `prisma generate`. After editing `prisma/schema.prisma` without reinstalling, re-run `npx prisma generate` manually.

Single test: `npx vitest run src/lib/__tests__/utils.test.ts`.

## Architecture

- **Next.js 16.2.4** App Router. Socket.IO is removed; live UI uses polling. `src/components/socket-provider.tsx` is a no-op stub — do not re-enable.
- **Route guard**: `src/proxy.ts` (Next 16's replacement for `middleware.ts`). `src/middleware.ts.bak` is the orphaned old file, ignore it. Public routes: `/`, `/login`, `/register`. API and `_next` bypass the guard; per-role dashboard prefixes are mapped at `src/proxy.ts:5`.
- **Auth**: NextAuth v5 beta in `src/lib/auth.ts`. JWT strategy, 30-minute idle expiry enforced manually in the `jwt` callback (returns empty token when stale; `session` callback returns empty session when `token.id` is missing). Server: `auth()` from `@/lib/auth`. Client: `useSession()`.
- **DB**: PostgreSQL + Prisma 6. 11 models in `prisma/schema.prisma`. Singleton client `prisma` exported from `src/lib/db.ts`.
- **Validation**: Zod schemas in `src/lib/validations.ts`. Use `safeParse()`, not `parse()`.
- **Rate limiting**: in-memory, resets on server restart. Helpers in `src/lib/rate-limit.ts` return `NextResponse | null`; pattern in route handlers is `const blocked = await apiRateLimit(req); if (blocked) return blocked;`. Variants: `authRateLimit` (5/15min), `apiRateLimit` (100/min), `bookingRateLimit` (3/min).
- **Audit log**: `createAuditLog()` from `@/lib/audit` — fire-and-forget, swallows errors. Use for admin, billing, and patient-data writes.
- **Tests**: Vitest + Testing Library + jsdom. Setup: `vitest.setup.ts`. Files live in `__tests__/` folders next to source; pattern `src/**/*.{test,spec}.{ts,tsx}`. Coverage targets `src/lib/**` and `src/components/**`.
- **Tailwind 4**: theme tokens declared in `src/app/globals.css` via `@theme` (no `tailwind.config.*`). PostCSS plugin: `@tailwindcss/postcss`.

## Two parallel UIs

- **Public landing** (`src/app/(public)/`) loads legacy Bootstrap, AOS, GLightbox, and Swiper from `public/template/` via `src/components/TemplateScripts.tsx` and `TemplateStyles.tsx`. Reference HTML lives in the top-level `Template/` directory and is not bundled.
- **Dashboards** (`src/app/(dashboard)/{admin,doctor,owner,patient,pharmacy}/`) are Tailwind-based. Do not import Bootstrap classes here.

`src/components/layout/Sidebar.tsx` adapts the menu by role. Dashboard layout redirects unauthenticated users to `/login`.

## Conventions

- All user-facing strings in **Indonesian**.
- Server Components by default; add `'use client'` only for interactivity.
- Path alias `@/` → `./src/`.
- **No comments unless explicitly requested.**
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
- API routes return `{ error: "<pesan Indonesia>" }` with appropriate HTTP status.

## Env & deployment quirks

- `.env.example` uses NextAuth v5 names (`AUTH_SECRET`, `AUTH_URL`). `docker-compose.yml` instead injects legacy `NEXTAUTH_SECRET`/`NEXTAUTH_URL` and hardcodes `192.168.1.12` in `DATABASE_URL` / `NEXTAUTH_URL`. Pick one set per environment and align both files when deploying.
- `next.config.ts` hardcodes `Access-Control-Allow-Origin: http://192.168.1.12:3000`. Update if the deploy origin differs.
- Build output is `standalone` — the Dockerfile copies `.next/standalone` + `.next/static`.

## Gotchas

- Demo seed accounts (all roles) share password `password123`.
- `Doctor.schedule` is a JSON column; seed populates Mon–Fri slots.
- `PaymentStatus` has 5 states: `PENDING`, `AWAITING_MEDICINE`, `READY_FOR_PAYMENT`, `PAID`, `CANCELLED`. `PrescriptionStatus` has only `PENDING` / `DISPENSED`. `AppointmentStatus` has 5: `WAITING`, `CHECKED_IN`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`.
- `seed_medicines.js` and `seed_pharmacy.js` at the repo root are ad-hoc CommonJS one-offs and are NOT wired into npm scripts. The canonical seeder is `prisma/seed.ts` (`npm run db:seed`).
- "Logged in but session looks empty" usually means the 30-minute idle expiry triggered, not a bug.
