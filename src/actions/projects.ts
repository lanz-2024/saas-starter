'use server';

import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

// Demo org — replace with real org resolution from user's active org
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function createProject(formData: FormData) {
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

  const parsed = createProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  });

  if (!parsed.success) {
    // In production surface these errors via useActionState
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      org_id: DEMO_ORG_ID,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      status: 'active',
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create project');
  }

  redirect(`/dashboard/projects/${data.id}`);
}

export async function deleteProject(id: string) {
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

  const { error } = await supabase.from('projects').delete().eq('id', id).eq('created_by', user.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect('/dashboard/projects');
}
