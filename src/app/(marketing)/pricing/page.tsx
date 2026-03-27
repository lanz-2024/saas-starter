'use client';

import { PricingCard } from '@/components/ui/PricingCard';
import { PLANS_LIST } from '@/lib/stripe/plans';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-full bg-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          SaaS Starter
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Start free. Upgrade when you need to. No hidden fees.
          </p>

          {/* Annual toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
            <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                annual ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={annual}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  annual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-400'}`}>
              Annual
              <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 font-semibold">
                20% off
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {PLANS_LIST.map((plan) => {
            const monthlyPrice =
              plan.priceInCents === 0
                ? '$0'
                : `$${Math.round((plan.priceInCents / 100) * (annual ? 0.8 : 1))}`;

            return (
              <PricingCard
                key={plan.id}
                name={plan.name}
                price={monthlyPrice}
                priceSubtext={
                  plan.priceInCents === 0 ? 'forever' : annual ? '/mo billed annually' : '/month'
                }
                features={plan.features}
                isRecommended={plan.highlighted}
                ctaText={plan.priceInCents === 0 ? 'Get started free' : `Start ${plan.name}`}
                ctaHref={plan.priceInCents === 0 ? '/sign-up' : '/sign-up'}
              />
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          All plans include a 14-day free trial. No credit card required.{' '}
          <Link href="/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
            Start now.
          </Link>
        </p>
      </div>
    </div>
  );
}
