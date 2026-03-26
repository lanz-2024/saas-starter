import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const createProjectSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

const updateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  status: z.enum(['active', 'archived', 'completed']).optional(),
});

const projectIdSchema = z.object({ id: z.string().uuid() });

const listProjectsSchema = z.object({ orgId: z.string().uuid() });

async function assertOrgMembership(
  supabase: Parameters<typeof protectedProcedure._def.resolver>[0]['ctx']['supabase'],
  userId: string,
  orgId: string,
) {
  const { data, error } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this organization.',
    });
  }

  return data.role;
}

export const projectsRouter = router({
  list: protectedProcedure.input(listProjectsSchema).query(async ({ ctx, input }) => {
    await assertOrgMembership(ctx.supabase, ctx.user.id, input.orgId);

    const { data, error } = await ctx.supabase
      .from('projects')
      .select('*')
      .eq('org_id', input.orgId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return data ?? [];
  }),

  getById: protectedProcedure.input(projectIdSchema).query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('projects')
      .select('*')
      .eq('id', input.id)
      .single();

    if (error || !data) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found.' });
    }

    // RLS already enforces membership — this confirms it
    await assertOrgMembership(ctx.supabase, ctx.user.id, data.org_id);

    return data;
  }),

  create: protectedProcedure.input(createProjectSchema).mutation(async ({ ctx, input }) => {
    await assertOrgMembership(ctx.supabase, ctx.user.id, input.orgId);

    // Check plan project limit via DB function
    const { data: withinLimit, error: limitError } = await ctx.supabase.rpc(
      'check_project_limit',
      { p_org_id: input.orgId },
    );

    if (limitError) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: limitError.message });
    }

    if (!withinLimit) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Project limit reached for your current plan. Upgrade to create more projects.',
      });
    }

    const { data, error } = await ctx.supabase
      .from('projects')
      .insert({
        org_id: input.orgId,
        name: input.name,
        description: input.description ?? null,
        status: 'active',
        created_by: ctx.user.id,
      })
      .select()
      .single();

    if (error || !data) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error?.message ?? 'Failed to create project' });
    }

    return data;
  }),

  update: protectedProcedure.input(updateProjectSchema).mutation(async ({ ctx, input }) => {
    const { id, ...updates } = input;

    // Fetch project first to verify membership
    const { data: existing, error: fetchError } = await ctx.supabase
      .from('projects')
      .select('org_id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found.' });
    }

    const role = await assertOrgMembership(ctx.supabase, ctx.user.id, existing.org_id);

    // Only creator or admin/owner can update
    const canUpdate =
      existing.created_by === ctx.user.id ||
      role === 'owner' ||
      role === 'admin';

    if (!canUpdate) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the project creator or an admin can update this project.' });
    }

    const { data, error } = await ctx.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error?.message ?? 'Failed to update project' });
    }

    return data;
  }),

  delete: protectedProcedure.input(projectIdSchema).mutation(async ({ ctx, input }) => {
    const { data: existing, error: fetchError } = await ctx.supabase
      .from('projects')
      .select('org_id, created_by')
      .eq('id', input.id)
      .single();

    if (fetchError || !existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found.' });
    }

    const role = await assertOrgMembership(ctx.supabase, ctx.user.id, existing.org_id);

    const canDelete =
      existing.created_by === ctx.user.id ||
      role === 'owner' ||
      role === 'admin';

    if (!canDelete) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the project creator or an admin can delete this project.' });
    }

    const { error } = await ctx.supabase.from('projects').delete().eq('id', input.id);

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return { success: true };
  }),
});
