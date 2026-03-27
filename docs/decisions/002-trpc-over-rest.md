# ADR-002: tRPC over REST for Internal API

**Status:** Accepted
**Date:** 2026-03-27

## Context

Dashboard pages need to fetch and mutate data. Options: REST routes, GraphQL, tRPC, Server Actions only.

## Decision

Use tRPC for data fetching (queries) and Server Actions for mutations. tRPC provides end-to-end
type safety without a schema definition step; Server Actions handle form submissions with built-in
CSRF protection.

## Consequences

**Positive:**
- Zero runtime type errors between client and server
- No manual API schema maintenance
- Automatic TypeScript inference for all query results
- React Query integration for caching, optimistic updates, background refetch

**Negative:**
- tRPC-specific mental model — not transferable to REST consumers
- Slightly larger bundle than raw fetch (React Query overhead)
- Not suitable for public API exposure (use REST or GraphQL for that)

## Implementation

See `src/lib/trpc/router.ts` for the root router and `src/lib/trpc/routers/` for sub-routers.
