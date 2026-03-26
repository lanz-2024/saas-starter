import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createProject } from '@/actions/projects';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'New Project' };

export default function NewProjectPage() {
  return (
    <div className="max-w-xl">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Create a new project</h1>

        <form action={createProject} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              placeholder="My awesome project"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={500}
              placeholder="What is this project about?"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Create project
            </button>
            <Link
              href="/dashboard/projects"
              className="rounded-md px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
