import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { CreditCard, User } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Settings' };

const planLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
  pro: { label: 'Pro', color: 'bg-indigo-100 text-indigo-700' },
  enterprise: { label: 'Team', color: 'bg-purple-100 text-purple-700' },
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs: { name: string; value: string; options: CookieOptions }[]) => {
          for (const { name, value, options } of cs) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const { data: membership } = await supabase
    .from('org_members')
    .select('organizations(plan, name)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  const org = membership?.organizations as unknown as { plan: string; name: string } | null;
  const plan = planLabels[org?.plan ?? 'free'] ??
    planLabels.free ?? { label: 'Free', color: 'bg-gray-100 text-gray-700' };
  const displayName = user.user_metadata?.full_name as string | undefined;

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Account */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <User className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        </div>
        <form className="space-y-4">
          <div>
            <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              defaultValue={displayName ?? ''}
              placeholder="Your name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <p
              id="email-address"
              className="mt-1 text-sm text-gray-500 bg-gray-50 rounded-md border border-gray-200 px-3 py-2"
            >
              {user.email}
            </p>
            <p className="mt-1 text-xs text-gray-400">Email cannot be changed from this page.</p>
          </div>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Save changes
          </button>
        </form>
      </section>

      {/* Billing */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Billing</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Current plan</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${plan.color}`}
              >
                {plan.label}
              </span>
            </div>
          </div>
          {(org?.plan ?? 'free') === 'free' && (
            <Link
              href="/pricing"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Upgrade plan
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
