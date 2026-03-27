# ADR-001: Supabase over PlanetScale for Database + Auth

**Status:** Accepted
**Date:** 2026-03-27

## Context

The SaaS starter needs a hosted Postgres database, authentication, and real-time subscriptions.
Options evaluated: Supabase, PlanetScale + Auth.js, Neon + Clerk, self-hosted Postgres + NextAuth.

## Decision

Use Supabase for all three: PostgreSQL database, Auth (email + OAuth), and Realtime subscriptions.
Single vendor reduces integration surface area and provides Row Level Security (RLS) as a
first-class feature.

## Consequences

**Positive:**
- RLS enforces multi-tenancy at the database level — not application level
- Single SDK (`@supabase/supabase-js`) handles auth, DB, realtime, and storage
- Free tier sufficient for portfolio demo (500MB DB, 50MB file storage, 2GB bandwidth)
- `supabase start` provides a complete local stack via Docker

**Negative:**
- Vendor lock-in — migrating away requires rewriting auth + RLS policies
- RLS policies add complexity vs. application-level filtering
- Supabase Realtime scales to ~200 concurrent connections on free tier

## Implementation

See `src/lib/supabase/` for client setup and `supabase/migrations/` for RLS policies.
