@AGENTS.md

# KlinikCare Development Guidelines

## Project Overview
KlinikCare adalah sistem manajemen klinik modern berbasis Next.js 16 dengan App Router.

## Tech Stack
- **Framework**: Next.js 16 (App Router) - **READ node_modules/next/dist/docs/ BEFORE coding**
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 dengan custom theme (primary-50 s/d primary-900, accent colors)
- **Database**: PostgreSQL + Prisma 6 ORM
- **Authentication**: NextAuth v5 (beta)
- **Validation**: Zod schemas di `src/lib/validations.ts`
- **Testing**: Vitest + Testing Library

## Development Rules

### 1. Next.js Version Notice
**IMPORTANT**: This is NOT standard Next.js! Version 16.2.4 has breaking changes.
- Always read `node_modules/next/dist/docs/` before writing code
- Heed deprecation notices
- Socket functionality has been removed - using polling approach instead

### 2. Code Style
- No comments unless explicitly requested
- Use `'use client'` directive for client components
- Use path aliases: `@/` maps to `./src/`
- All user-facing strings in Indonesian

### 3. Database & ORM
- All database operations use Prisma Client from `src/lib/db.ts`
- Schema defined in `prisma/schema.prisma` (13 models)
- Run `npm run db:push` for quick schema updates
- Run `npx prisma generate` after schema changes

### 4. Authentication & Authorization
- NextAuth v5 configuration in `src/lib/auth.ts`
- 5 user roles: PATIENT, ADMIN, DOCTOR, OWNER, PHARMACY
- Use `auth()` from `@/lib/auth` for server components
- Use `useSession()` from `next-auth/react` for client components
- Check role-based access in server actions and API routes

### 5. Validation
- All user inputs validated with Zod schemas in `src/lib/validations.ts`
- Available schemas: createPatientSchema, updatePatientSchema, createAppointmentSchema, etc.
- Use `safeParse()` not `parse()` for better error handling

### 6. API Routes
- Located in `src/app/api/`
- Rate limiting applied: authRateLimit (5/15min), apiRateLimit (100/min), bookingRateLimit (3/min)
- Return Indonesian error messages
- Use `rateLimit()` from `@/lib/rate-limit`

### 7. Components
- **Server Components** (default): For data fetching, no interactivity
- **Client Components**: Add `'use client'` - for interactivity (Sidebar, Header)
- Layout components in `src/components/layout/`
- Use Lucide React for icons
- Follow existing patterns in Sidebar.tsx and Header.tsx

### 8. Styling
- Tailwind CSS 4 with PostCSS
- Custom theme colors in `src/app/globals.css` (@theme directive)
- Primary: emerald-500 (#10b981)
- Accent: blue-500 (#3b82f6)
- Use existing utility classes: `glass`, `gradient-primary`, `gradient-hero`

### 9. Testing
- **Framework**: Vitest with jsdom environment
- **Test files**: `__tests__/` folder next to source files
- **Naming**: `*.test.ts` for utilities, `*.test.tsx` for components
- **Run tests**: `npm run test:run`
- **Coverage**: `npm run test:coverage`
- Mock Next.js modules when testing components

### 10. Error Handling
- Error pages: `error.tsx`, `not-found.tsx`, `loading.tsx`
- API errors return `{ error: "message" }` with appropriate HTTP status
- Use try-catch in server actions
- Log errors with `console.error()` (consider using audit.ts for critical operations)

### 11. Audit Logging
- Use `createAuditLog()` from `@/lib/audit` for critical actions
- Log admin actions, patient data changes, billing operations
- AuditLog model in Prisma schema

### 12. Common Functions (src/lib/utils.ts)
- `cn()` - Merge class names (uses clsx)
- `formatDate()`, `formatDateTime()` - Indonesian locale formatting
- `formatCurrency()` - Rupiah format (Rp X.XXX.XXX)
- `generateMedicalRecordNumber()`, `generateInvoiceNumber()`, `generateCertificateNumber()`
- `getQueueDisplay()` - Pad queue numbers (001, 002, etc.)
- `getStatusColor()`, `getStatusLabel()` - Status badges in Indonesian

## Project Structure Quick Reference
```
src/
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (dashboard)/     # Role-based dashboards
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout with fonts
│   ├── globals.css      # Global styles + Tailwind theme
│   ├── error.tsx        # Global error boundary
│   └── not-found.tsx   # 404 page
├── components/
│   ├── layout/          # Header.tsx, Sidebar.tsx
│   ├── providers.tsx    # SessionProvider wrapper
│   └── socket-provider.tsx  # Disabled (using polling)
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── audit.ts         # Audit logging
│   ├── db.ts            # Prisma client
│   ├── rate-limit.ts    # API rate limiting
│   ├── utils.ts         # Helper functions
│   └── validations.ts   # Zod schemas
└── types/
    └── next-auth.d.ts   # NextAuth type extensions
```

## Common Commands
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage  # Run tests with coverage
npm run db:push     # Push schema to database
npm run db:seed     # Seed initial data
npm run db:studio   # Open Prisma Studio
```

## Important Notes
- **No Socket.IO**: Real-time features use polling with cache-control headers
- **Single Clinic**: System designed for single clinic operation (no multi-tenant)
- **Indonesian Language**: All user-facing text in Indonesian
- **Role-Based UI**: Sidebar menu adapts to user role automatically
- **Rate Limiting**: Applied to prevent abuse (especially auth endpoints)

## Git Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Example: `feat: add patient queue display`
- Example: `test: add utils unit tests`

---

When in doubt, read existing code. Follow established patterns.
