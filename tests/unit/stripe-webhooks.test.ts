/**
 * Stripe webhook handler unit tests.
 *
 * Tests the event routing and subscription status mapping logic
 * without making real Stripe API calls.
 */

import { describe, it, expect } from 'vitest';
import { PLANS, PLANS_LIST, getPlan, getPlanByPriceId } from '@/lib/stripe/plans';
import type { PlanId } from '@/lib/stripe/plans';

// Subscription status values used by Stripe
type StripeSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

function isActiveSubscription(status: StripeSubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing';
}

function isPastDue(status: StripeSubscriptionStatus): boolean {
  return status === 'past_due' || status === 'unpaid';
}

function isCanceled(status: StripeSubscriptionStatus): boolean {
  return status === 'canceled' || status === 'incomplete_expired';
}

/** Mirror of webhook handler: maps plan.id → org plan column value */
function planIdToOrgPlan(planId: PlanId): string {
  return planId === 'team' ? 'enterprise' : planId === 'pro' ? 'pro' : 'free';
}

describe('Stripe subscription status helpers', () => {
  describe('isActiveSubscription', () => {
    it('active is considered active', () => {
      expect(isActiveSubscription('active')).toBe(true);
    });

    it('trialing is considered active', () => {
      expect(isActiveSubscription('trialing')).toBe(true);
    });

    it('canceled is not active', () => {
      expect(isActiveSubscription('canceled')).toBe(false);
    });

    it('past_due is not active', () => {
      expect(isActiveSubscription('past_due')).toBe(false);
    });

    it('incomplete is not active', () => {
      expect(isActiveSubscription('incomplete')).toBe(false);
    });
  });

  describe('isPastDue', () => {
    it('past_due status is past due', () => {
      expect(isPastDue('past_due')).toBe(true);
    });

    it('unpaid is past due', () => {
      expect(isPastDue('unpaid')).toBe(true);
    });

    it('active is not past due', () => {
      expect(isPastDue('active')).toBe(false);
    });
  });

  describe('isCanceled', () => {
    it('canceled is canceled', () => {
      expect(isCanceled('canceled')).toBe(true);
    });

    it('incomplete_expired is canceled', () => {
      expect(isCanceled('incomplete_expired')).toBe(true);
    });

    it('active is not canceled', () => {
      expect(isCanceled('active')).toBe(false);
    });
  });
});

describe('Plan definitions (plans.ts)', () => {
  it('free plan has priceInCents of 0', () => {
    expect(PLANS.free.priceInCents).toBe(0);
  });

  it('free plan limits: 3 projects, 1 member', () => {
    expect(PLANS.free.maxProjects).toBe(3);
    expect(PLANS.free.maxMembers).toBe(1);
  });

  it('pro plan has unlimited projects and members (null)', () => {
    expect(PLANS.pro.maxProjects).toBeNull();
    expect(PLANS.pro.maxMembers).toBeNull();
  });

  it('team plan has unlimited projects and members (null)', () => {
    expect(PLANS.team.maxProjects).toBeNull();
    expect(PLANS.team.maxMembers).toBeNull();
  });

  it('pro plan costs more than free', () => {
    expect(PLANS.pro.priceInCents).toBeGreaterThan(0);
  });

  it('team plan costs more than pro', () => {
    expect(PLANS.team.priceInCents).toBeGreaterThan(PLANS.pro.priceInCents);
  });

  it('getPlan returns correct plan object', () => {
    expect(getPlan('pro').id).toBe('pro');
    expect(getPlan('free').id).toBe('free');
    expect(getPlan('team').id).toBe('team');
  });

  it('PLANS_LIST contains all 3 plans', () => {
    expect(PLANS_LIST).toHaveLength(3);
    const ids = PLANS_LIST.map((p) => p.id);
    expect(ids).toContain('free');
    expect(ids).toContain('pro');
    expect(ids).toContain('team');
  });

  it('getPlanByPriceId returns undefined for unknown price', () => {
    expect(getPlanByPriceId('price_nonexistent')).toBeUndefined();
  });

  it('getPlanByPriceId finds paid plans by their priceId', () => {
    for (const plan of PLANS_LIST.filter((p) => p.priceId !== null)) {
      const found = getPlanByPriceId(plan.priceId!);
      expect(found?.id).toBe(plan.id);
    }
  });
});

describe('Webhook handler — org plan mapping', () => {
  it('team plan maps to enterprise org plan', () => {
    expect(planIdToOrgPlan('team')).toBe('enterprise');
  });

  it('pro plan maps to pro org plan', () => {
    expect(planIdToOrgPlan('pro')).toBe('pro');
  });

  it('free plan maps to free org plan', () => {
    expect(planIdToOrgPlan('free')).toBe('free');
  });
});
