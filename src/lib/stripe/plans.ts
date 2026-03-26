export type PlanId = 'free' | 'pro' | 'team';

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in USD cents (0 for free) */
  priceInCents: number;
  /** Display price string */
  price: string;
  /** Stripe Price ID — replace with real IDs from your Stripe dashboard */
  priceId: string | null;
  /** Max projects (null = unlimited) */
  maxProjects: number | null;
  /** Max team members (null = unlimited) */
  maxMembers: number | null;
  features: string[];
  highlighted: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceInCents: 0,
    price: '$0',
    priceId: null,
    maxProjects: 3,
    maxMembers: 1,
    features: [
      'Up to 3 projects',
      'Solo workspace',
      'Community support',
      'Basic analytics',
    ],
    highlighted: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceInCents: 2900,
    price: '$29',
    priceId: process.env['STRIPE_PRO_PRICE_ID'] ?? 'price_pro_placeholder',
    maxProjects: null,
    maxMembers: null,
    features: [
      'Unlimited projects',
      'Unlimited team members',
      'Priority support',
      'Advanced analytics',
      'Custom domains',
      'API access',
    ],
    highlighted: true,
  },
  team: {
    id: 'team',
    name: 'Team',
    priceInCents: 7900,
    price: '$79',
    priceId: process.env['STRIPE_TEAM_PRICE_ID'] ?? 'price_team_placeholder',
    maxProjects: null,
    maxMembers: null,
    features: [
      'Everything in Pro',
      'SSO / SAML',
      'Audit logs',
      'Dedicated support',
      'SLA guarantee',
      'Advanced RBAC',
    ],
    highlighted: false,
  },
};

export const PLANS_LIST: Plan[] = Object.values(PLANS);

export function getPlan(id: PlanId): Plan {
  const plan = PLANS[id];
  return plan;
}

/** Map from Stripe Price ID → Plan ID */
export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS_LIST.find((p) => p.priceId === priceId);
}
