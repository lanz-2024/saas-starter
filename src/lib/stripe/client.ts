import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Returns a singleton Stripe SDK instance using the secret key.
 * Only call this from server-side code.
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
        'Get your test mode key from https://dashboard.stripe.com/test/apikeys',
    );
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  });

  return stripeInstance;
}
