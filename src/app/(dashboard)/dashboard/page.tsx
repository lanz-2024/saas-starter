import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { CreditCard, FolderKanban, Plus, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs: { name: string; value: string; options: CookieOptions }[]) => {
          for (const { name, value, options } of cs) cookieStore.set(name, value, options);
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  // Fetch first org membership
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(id, name, plan)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  const org = membership?.organizations as unknown as {
    id: string;
    name: string;
    plan: string;
  } | null;

  const { count: projectCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', org?.id ?? '');

  const { count: memberCount } = await supabase
    .from('org_members')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', org?.id ?? '');

  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, name, description, status, updated_at')
    .eq('org_id', org?.id ?? '')
    .order('updated_at', { ascending: false })
    .limit(5);

  const stats = [
    {
      label: 'Projects',
      value: projectCount ?? 0,
      icon: FolderKanban,
      href: '/dashboard/projects' as import('next').Route,
    },
    {
      label: 'Team members',
      value: memberCount ?? 0,
      icon: Users,
      href: '/dashboard/team' as import('next').Route,
    },
    {
      label: 'Current plan',
      value: org?.plan ?? 'free',
      icon: CreditCard,
      href: '/dashboard/settings' as import('next').Route,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {org && <p className="text-sm text-gray-500 mt-1">{org.name}</p>}
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <Icon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent projects */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent projects</h2>
        {recentProjects && recentProjects.length > 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{project.name}</p>
                  {project.description && (
                    <p className="text-sm text-gray-500 truncate max-w-md">{project.description}</p>
                  )}
                </div>
                <span
                  className={`ml-4 shrink-0 text-xs font-medium rounded-full px-2.5 py-0.5 ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {project.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-white p-10 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">No projects yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Get started by creating your first project.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
