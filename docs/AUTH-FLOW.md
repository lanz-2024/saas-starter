# Auth Flow

## Overview

Authentication is handled entirely by Supabase Auth with `@supabase/ssr` for cookie-based session management in Next.js.

## Email / password flow

```
1. User submits sign-up form (src/app/(auth)/sign-up/page.tsx)
2. supabase.auth.signUp({ email, password, options: { data: { full_name } } })
3. Supabase sends confirmation email (configurable — can skip in local dev)
4. On confirmation click -> /auth/callback?code=...
5. callback/route.ts calls supabase.auth.exchangeCodeForSession(code)
6. Session cookie set -> redirect to /dashboard
```

## OAuth flow (GitHub / Google)

```
1. User clicks GitHub / Google button (sign-in/page.tsx)
2. supabase.auth.signInWithOAuth({ provider, options: { redirectTo: /auth/callback } })
3. Browser redirected to provider consent screen
4. Provider redirects to /auth/callback?code=...
5. Same PKCE exchange as email flow -> session cookie -> /dashboard
```

## Session management in middleware

`src/middleware.ts` runs on every non-static request:

1. Creates a Supabase SSR client from request cookies
2. Calls `supabase.auth.getUser()` — this refreshes the session token if needed
3. Redirects unauthenticated requests to `/sign-in?redirectTo=<original path>`
4. Redirects authenticated users away from auth routes to `/dashboard`

The middleware **does not** read from `getSession()` — it always calls `getUser()` which validates the JWT with Supabase's Auth server, preventing stale-token attacks.

## Server component auth

Dashboard pages create a server-side Supabase client via `createServerClient` from `@supabase/ssr`, passing cookies from `next/headers`. This gives them a session-scoped client that respects RLS automatically.

## Sign out

`src/actions/auth.ts` exposes a `signOut()` Server Action. The dashboard layout renders it inside a `<form>` so it works without JavaScript.

## Token storage

Sessions are stored in HttpOnly cookies managed by `@supabase/ssr`. No tokens are stored in `localStorage`.

## Configuring OAuth providers

1. Go to Supabase dashboard -> Authentication -> Providers
2. Enable GitHub or Google, enter client ID and secret
3. Add `http://localhost:3000/auth/callback` to the OAuth app's allowed redirect URIs
4. For production, add your production domain callback URL
