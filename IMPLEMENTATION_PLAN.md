# OCS Implementation Plan

## Phase 0 — Monorepo & Dev Infrastructure
- `package.json` (workspace orchestration, root dev scripts)
- `docker-compose.yml` (Postgres)
- `.env.example` (API/Web/alerts config)
- `README.md` (local runbook)

## Phase 1A — Backend foundation (NestJS + Prisma)
- `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/jest.config.js`
- `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
- `apps/api/prisma/schema.prisma` (core entities + enums)
- `apps/api/prisma/seed.ts` (Founder + sample company/KPIs/snapshots)
- Auth: `apps/api/src/auth/*`
- REST resources: `apps/api/src/ocs.controller.ts`, `apps/api/src/services/ocs.service.ts`

## Phase 1B — Business logic & jobs
- `apps/api/src/services/scoring.service.ts` (GM score algorithm)
- `apps/api/src/services/alert-engine.service.ts` (rule evaluation)
- `apps/api/src/services/jobs.service.ts` (daily cron)

## Phase 1C — Frontend (Next.js)
- `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.js`
- Auth/login UI: `apps/web/app/page.tsx`
- Founder dashboard: `apps/web/app/dashboard/page.tsx`
- Company detail tabs + charts + workflow table: `apps/web/app/company/[id]/page.tsx`
- Layout: `apps/web/app/layout.tsx`

## Phase 1D — Quality
- Unit tests:
  - `apps/api/test/scoring.service.spec.ts`
  - `apps/api/test/alert-engine.service.spec.ts`
- (Optional next) Playwright smoke for login + dashboard once package install is available.
