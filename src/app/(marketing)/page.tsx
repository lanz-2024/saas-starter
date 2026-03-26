import Link from 'next/link';
import { Shield, Users, CreditCard, ArrowRight, Quote } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SaaS Starter — Ship faster',
  description: 'Production-ready SaaS starter with Supabase Auth, multi-tenancy, Stripe billing, and tRPC.',
};

const features = [
  {
    icon: Shield,
    title: 'Auth out of the box',
    description:
      'Email/password and GitHub/Google OAuth via Supabase. Session management, middleware guards, and Row-Level Security on every table.',
  },
  {
    icon: Users,
    title: 'Multi-tenant teams',
    description:
      'Organizations with owner, admin, member, and viewer roles. Invite flows and per-org RLS policies enforce data isolation automatically.',
  },
  {
    icon: CreditCard,
    title: 'Stripe billing built in',
    description:
      'Free, Pro, and Team plans wired to Stripe subscriptions. Webhook handlers sync plan changes back to Supabase in real time.',
  },
];

const testimonials = [
  {
    quote:
      'We went from zero to a paying customer in two weeks. The auth and billing were just there — we focused entirely on our product.',
    name: 'Sarah K.',
    role: 'CTO at Fluxio',
  },
  {
    quote:
      'The tRPC setup is the cleanest I have seen in a Next.js starter. End-to-end types caught three bugs before we even shipped.',
    name: 'Marcus T.',
    role: 'Fullstack engineer at Roam',
  },
  {
    quote:
      'RLS + multi-tenancy is notoriously hard to get right. This starter saved us weeks of architecture work.',
    name: 'Priya N.',
    role: 'Solo founder',
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-full bg-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-indigo-600">SaaS Starter</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Start for free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Build your SaaS.{' '}
          <span className="text-indigo-600">Not the plumbing.</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          Auth, multi-tenancy, Stripe billing, and a type-safe tRPC API — all wired together and
          production-ready. Clone, configure, ship.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Everything you need to launch
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 mb-4">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Trusted by builders
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map(({ quote, name, role }) => (
              <div key={name} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <Quote className="h-6 w-6 text-indigo-200 mb-3" />
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{quote}</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span className="font-semibold text-indigo-600">SaaS Starter</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-900">Sign in</Link>
            <Link href="/sign-up" className="hover:text-gray-900">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
