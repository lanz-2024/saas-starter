import { signOut } from '@/actions/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  if (!user) {
    redirect('/sign-in');
  }

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="min-h-full">
      <Sidebar />

      {/* Top bar */}
      <div className="fixed top-0 right-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6 lg:left-64">
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-700 sm:block">{displayName}</span>
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              avatarInitial
            )}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-16 lg:pl-64">
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
