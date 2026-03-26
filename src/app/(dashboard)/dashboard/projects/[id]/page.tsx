import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Project ${id.slice(0, 8)}` };
}

const mockActivityLog = [
  { id: 1, action: 'Project created', user: 'You', time: '3 days ago' },
  { id: 2, action: 'Description updated', user: 'You', time: '2 days ago' },
  { id: 3, action: 'Status set to active', user: 'You', time: '1 day ago' },
];

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs: { name: string; value: string; options: CookieOptions }[]) =>
          cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    notFound();
  }

  const statusColor =
    project.status === 'active'
      ? 'bg-green-100 text-green-700'
      : project.status === 'completed'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-600';

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className="mt-3 text-gray-600">{project.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <Clock className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(project.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <User className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Created by</p>
            <p className="text-sm font-medium text-gray-900 truncate">{project.created_by.slice(0, 8)}…</p>
          </div>
        </div>
      </div>

      {/* Activity log */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          {mockActivityLog.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-4">
              <p className="text-sm text-gray-900">{entry.action}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{entry.user}</span>
                <span>{entry.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
