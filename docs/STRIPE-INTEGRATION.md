# Stripe Integration

## Plans

Defined in `src/lib/stripe/plans.ts`:

| Plan | Price | Stripe Price ID env var |
|------|-------|------------------------|
| Free | $0 | — (no Stripe checkout) |
| Pro | $29/mo | `STRIPE_PRO_PRICE_ID` |
| Team | $79/mo | `STRIPE_TEAM_PRICE_ID` |

## Checkout flow

1. User clicks "Upgrade" -> create a Stripe Checkout Session server-side
2. Include `metadata: { org_id }` on the session — this links the payment to the org
3. `success_url` points back to `/dashboard/settings`
4. On success, Stripe fires `checkout.session.completed` webhook

## Webhook flow

```
Stripe -> POST /api/webhooks/stripe
  -> Verify signature (STRIPE_WEBHOOK_SECRET)
  -> Route by event.type:
      checkout.session.completed   -> handleCheckoutSessionCompleted
      customer.subscription.updated -> handleSubscriptionUpdated
      customer.subscription.deleted -> handleSubscriptionDeleted
  -> Upsert subscriptions table
  -> Update organizations.plan
```

All handlers are in `src/lib/stripe/webhooks.ts`. They use the Supabase admin client (service role key) to bypass RLS.

## Local webhook testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret printed by the CLI
# Add it to .env.local as STRIPE_WEBHOOK_SECRET
```

## Test cards

| Scenario | Card number |
|----------|-------------|
| Success | 4242 4242 4242 4242 |
| Requires authentication | 4000 0025 0000 3155 |
| Decline | 4000 0000 0000 9995 |

Use any future expiry date, any 3-digit CVV, any billing ZIP.

## Stripe dashboard setup

1. Create Products matching the plan names (Pro, Team)
2. Add monthly recurring Prices
3. Copy the Price IDs to `STRIPE_PRO_PRICE_ID` and `STRIPE_TEAM_PRICE_ID` in `.env.local`
4. Add your webhook endpoint URL in Stripe dashboard -> Developers -> Webhooks
5. Enable these events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Security

- Webhook signature is verified with `stripe.webhooks.constructEvent` before any processing
- The route reads the raw body as text — do not apply `bodyParser` or any JSON middleware
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-only and never exposed to the browser
