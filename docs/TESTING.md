# Testing

## Prerequisites

- Node.js 22+, pnpm 9+
- No external services required for unit tests — mock adapters cover everything
- For integration tests: `supabase start` (Docker Desktop required)
- For E2E tests: `pnpm dev` running + Playwright installed

```bash
cp .env.example .env.local  # defaults work for mock mode
pnpm install
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all unit + integration tests (no watch) |
| `pnpm test:unit` | Unit tests only (RBAC, Stripe webhooks) |
| `pnpm test:integration` | Integration tests only (tRPC router) |
| `pnpm test:e2e` | E2E tests (requires `pnpm dev` running) |
| `pnpm test:e2e:ui` | Playwright UI mode for visual debugging |
| `pnpm test:coverage` | Generate HTML coverage report in `coverage/` |
| `pnpm test:ci` | CI mode: headless, no watch, JUnit XML to `test-results/` |
| `pnpm test:watch` | Watch mode for TDD workflow |
| `pnpm lint` | Biome lint + format check |
| `pnpm typecheck` | TypeScript strict check (tsc --noEmit) |

## Test Structure

```
tests/
├── unit/
│   ├── rbac.test.ts            # Role-based access control logic
│   └── stripe-webhooks.test.ts # Stripe webhook event handlers
└── integration/
    └── trpc-projects.test.ts   # tRPC project router (local Supabase)
```

## Coverage Targets

| Area | Target |
|------|--------|
| src/lib/stripe/ | 85%+ |
| src/lib/trpc/ | 80%+ |
| src/actions/ | 75%+ |
| Overall | 75%+ |

## Running Locally (Zero Config)

Unit tests run fully offline — no Supabase, no Stripe required:

```bash
git clone https://github.com/lanz-2024/saas-starter
cd saas-starter
cp .env.example .env.local
pnpm install
pnpm test:unit   # passes with no external deps
```

## Running with Local Supabase (Integration Tests)

```bash
# Install Supabase CLI: https://supabase.com/docs/guides/cli
supabase start        # starts local Supabase (Docker required)
pnpm test:integration
supabase stop
```

## Running in CI (GitHub Actions)

See `.github/workflows/ci.yml`. CI runs only unit tests (no Supabase or Stripe in CI).

- Lint: Biome check
- Typecheck: `tsc --noEmit`
- Unit tests: Vitest with coverage
- Build: `next build`

## Debugging Failed Tests

- **Mock not called**: Vitest hoists `vi.mock()` calls — place them before imports
- **Stripe webhook failures**: Check `STRIPE_WEBHOOK_SECRET` in `.env.local` (can be any string for tests)
- **tRPC auth errors**: Integration tests use a real Supabase local instance — run `supabase start` first
- **Coverage gaps**: `pnpm test:coverage` → open `coverage/index.html`
