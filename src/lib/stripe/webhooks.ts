import type Stripe from 'stripe';
import { createAdminClient as _createAdminClient } from '@/lib/supabase/admin';
import { getPlanByPriceId } from './plans';

// Cast to untyped client — Supabase 2.100 type inference for upsert/update
// requires generated types from CLI; this module uses raw supabase-js for stripe webhooks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createAdminClient = () => _createAdminClient() as unknown as ReturnType<typeof import('@supabase/supabase-js').createClient<any>>;

type WebhookHandlerResult = { success: true } | { success: false; error: string };

/**
 * Handle checkout.session.completed
 * Creates or updates the org subscription record after successful payment.
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<WebhookHandlerResult> {
  const orgId = session.metadata?.['org_id'];
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!orgId || !subscriptionId) {
    return { success: false, error: 'Missing org_id metadata or subscription id' };
  }

  const supabase = createAdminClient();

  // Retrieve full subscription to get price info
  const { getStripe } = await import('./client');
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? getPlanByPriceId(priceId) : undefined;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  // Upsert subscription record
  const { error: subError } = await supabase.from('subscriptions').upsert(
    {
      org_id: orgId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId ?? null,
      status: 'active',
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: false,
    },
    { onConflict: 'org_id' },
  );

  if (subError) {
    return { success: false, error: subError.message };
  }

  // Update org plan
  if (plan) {
    const orgPlan = plan.id === 'team' ? 'enterprise' : plan.id === 'pro' ? 'pro' : 'free';
    const { error: orgError } = await supabase
      .from('organizations')
      .update({ plan: orgPlan })
      .eq('id', orgId);

    if (orgError) {
      return { success: false, error: orgError.message };
    }
  }

  // Store Stripe customer ID
  if (typeof session.customer === 'string') {
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: session.customer })
      .eq('id', orgId);
  }

  return { success: true };
}

/**
 * Handle customer.subscription.updated
 * Syncs plan changes, period end, and cancellation status.
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<WebhookHandlerResult> {
  const supabase = createAdminClient();

  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? getPlanByPriceId(priceId) : undefined;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  // Find the subscription record by stripe_subscription_id
  const { data: existing, error: fetchError } = await supabase
    .from('subscriptions')
    .select('org_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: 'Subscription record not found' };
  }

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      stripe_price_id: priceId ?? null,
      status: subscription.status as 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' | 'unpaid',
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Update org plan
  if (plan) {
    const orgPlan = plan.id === 'team' ? 'enterprise' : plan.id === 'pro' ? 'pro' : 'free';
    await supabase
      .from('organizations')
      .update({ plan: orgPlan })
      .eq('id', existing.org_id);
  }

  return { success: true };
}

/**
 * Handle customer.subscription.deleted
 * Downgrades the org to the free plan.
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<WebhookHandlerResult> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from('subscriptions')
    .select('org_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: 'Subscription record not found' };
  }

  // Mark subscription as canceled
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled', cancel_at_period_end: false })
    .eq('stripe_subscription_id', subscription.id);

  if (subError) {
    return { success: false, error: subError.message };
  }

  // Downgrade org to free
  const { error: orgError } = await supabase
    .from('organizations')
    .update({ plan: 'free' })
    .eq('id', existing.org_id);

  if (orgError) {
    return { success: false, error: orgError.message };
  }

  return { success: true };
}
