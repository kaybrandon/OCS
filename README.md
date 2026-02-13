# Operational Control System (OCS) - Phase 1

Internal-only operations platform for post-acquisition operating cadence.

## Stack
- Next.js (frontend)
- NestJS + Prisma + Postgres (backend)

## Quick start
1. `cp .env.example .env`
2. `docker compose up -d`
3. `npm install`
4. `npm run prisma:generate -w apps/api`
5. `npm run prisma:migrate -w apps/api`
6. `npm run db:seed`
7. `npm run dev`

Default login:
- Email: `founder@ocs.local`
- Password: `founder123`

## Phase 1 implemented
- JWT auth + seeded Founder
- Portfolio dashboard (company tiles + totals + unacked alerts)
- Company detail (overview charts + workflow table)
- CRUD endpoints for companies, workflows/steps, EOS data, financials, culture, founder activity, alerts
- SOP text deterministic workflow generation
- GM score computation and storage
- Daily alert cron evaluation
- Unit tests for GM scoring and alert rules
