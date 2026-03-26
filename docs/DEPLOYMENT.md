# Deployment

## Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lanz-2024/saas-starter)

### Prerequisites

- Vercel account
- Supabase project (supabase.com)
- Stripe account (test mode for development)

### Environment Variables

Set these in Vercel project settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployment URL (e.g., `https://your-app.vercel.app`) |

### Steps

1. Fork or clone the repository
2. Create Supabase project → run `supabase/schema.sql` in SQL editor
3. Create Stripe products matching `src/lib/stripe/plans.ts` price IDs
4. Add Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
5. Deploy to Vercel: `vercel --prod`

## Docker

See `docker-compose.yml` for a containerized deployment.

```bash
# Start the database
docker compose up -d db

# Build and start the full stack
docker compose --profile full up -d

# Forward Stripe webhooks
docker compose --profile webhooks up stripe-cli
```

## Health Checks

- App: `GET /` — returns 200 on successful load
- DB: PostgreSQL `pg_isready` probe (configured in docker-compose.yml)

## Rollback

Vercel deployments are immutable — roll back via Vercel dashboard → Deployments → Promote previous deployment.

For database migrations, Supabase supports rollback via the SQL editor or `supabase db reset` (dev only).
