import type { Project } from '@/types/database';
import { Calendar, Users } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  memberCount?: number;
}

function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return `${Math.floor(diffMonths / 12)} year${Math.floor(diffMonths / 12) > 1 ? 's' : ''} ago`;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
  completed: 'bg-blue-100 text-blue-700',
};

export function ProjectCard({ project, memberCount = 1 }: ProjectCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
        <span
          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[project.status] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {project.status}
        </span>
      </div>

      {project.description && (
        <p className="mb-4 text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}

      <div className="mt-auto flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {relativeTime(project.updated_at)}
        </span>
      </div>

      <Link
        href={`/dashboard/projects/${project.id}`}
        className="mt-4 block w-full rounded-md bg-indigo-50 px-3 py-2 text-center text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        View project
      </Link>
    </div>
  );
}
