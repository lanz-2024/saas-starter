# Changelog

All notable changes to saas-starter are documented here.

## [0.1.0] - 2026-03-27

### Added
- Next.js 15 App Router with React 19 and TypeScript
- Supabase Auth: email/password + GitHub OAuth + Google OAuth
- Multi-tenancy: organizations, org_members with role-based access
- Row Level Security (RLS) on all database tables
- tRPC v11 type-safe API layer with protectedProcedure
- Stripe subscriptions: Free, Pro, Team plans
- Stripe webhook handler (checkout.session.completed, customer.subscription.*)
- Project CRUD with org-scoped RLS
- Team member invite flow
- Supabase Realtime: live dashboard updates
- Tailwind CSS v3 + shadcn/ui components
- Vitest unit tests: RBAC logic, Stripe webhook handlers, cn utility
- docs/: ARCHITECTURE.md, TESTING.md, AUTH-FLOW.md, DATABASE-SCHEMA.md, STRIPE-INTEGRATION.md, RBAC.md, DEPLOYMENT.md, SECURITY.md
- GitHub Actions CI: typecheck → lint → unit tests → build
- Docker Compose + multi-stage Dockerfile
