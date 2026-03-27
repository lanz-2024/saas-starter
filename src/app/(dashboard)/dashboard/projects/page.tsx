'use client';

import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { trpc } from '@/lib/trpc/client';
import type { Project } from '@/types/database';
import { FolderKanban, Plus } from 'lucide-react';
import Link from 'next/link';

// Demo org ID — in production this comes from the user's active org context
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

function ProjectsGrid({ orgId }: { orgId: string }) {
  const { data: projectsData, isLoading, error } = trpc.projects.list.useQuery({ orgId });
  const projects = projectsData as Project[] | undefined;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
          <div key={id} className="h-48 rounded-lg border border-gray-200 bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load projects: {error.message}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 bg-white p-16 text-center">
        <FolderKanban className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-sm font-semibold text-gray-900">No projects</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your first project.</p>
        <Link
          href="/dashboard/projects/new"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>
      <ProjectsGrid orgId={DEMO_ORG_ID} />
    </div>
  );
}
