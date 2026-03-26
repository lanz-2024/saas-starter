# Security

## Authentication (Supabase Auth)

- Sessions managed by Supabase Auth (JWT-based)
- Tokens refreshed via `middleware.ts` on every request
- OAuth providers: GitHub and Google (configurable in Supabase dashboard)
- Magic link / password reset emails sent by Supabase

## Authorization (Row Level Security)

All database tables have RLS policies enforced at the PostgreSQL level:

| Table | Policy | Rule |
|-------|--------|------|
| `organizations` | Members can read own org | `auth.uid() IN (SELECT user_id FROM org_members WHERE org_id = id)` |
| `projects` | Org members can CRUD | Org membership check via `org_members` |
| `org_members` | Admins can manage | Role = `owner` or `admin` |

Even if application-level auth is bypassed, RLS ensures users cannot access other organizations' data.

## API Security

- tRPC procedures use `protectedProcedure` which verifies Supabase session before any query
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (never exposed to client)
- Stripe webhooks verified with HMAC signature (`STRIPE_WEBHOOK_SECRET`)

## Input Validation

- All user input validated with Zod schemas before processing
- tRPC input schemas validated at procedure level
- Server Actions use Zod for form data validation

## Secrets Management

- No secrets in client-side code or `NEXT_PUBLIC_` variables (except Supabase anon key, which is designed to be public)
- `.env.local` is gitignored
- Production secrets managed in Vercel environment variables

## OWASP Top 10 Coverage

| Risk | Mitigation |
|------|-----------|
| A01 Broken Access Control | RLS on all tables, protectedProcedure on all tRPC routes |
| A02 Cryptographic Failures | Supabase handles JWT signing, HTTPS enforced by Vercel |
| A03 Injection | Supabase parameterized queries, Zod input validation |
| A05 Security Misconfiguration | Service role key server-only, no debug endpoints in prod |
| A07 Authentication Failures | JWT expiry + refresh, Supabase handles brute force protection |
| A09 Logging & Monitoring | Supabase logs all auth events, Vercel logs API requests |
