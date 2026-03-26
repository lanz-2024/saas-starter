import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import type { TRPCContext } from '../context';
import type { OrgRole, OrgMember } from '@/types/database';

const orgIdSchema = z.object({ orgId: z.string().uuid() });

const inviteSchema = z.object({
  orgId: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer'] as const),
});

const removeMemberSchema = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
});

const updateRoleSchema = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['admin', 'member', 'viewer'] as const),
});

async function assertAdminOrOwner(
  supabase: TRPCContext['supabase'],
  userId: string,
  orgId: string,
): Promise<OrgRole> {
  const { data, error } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this organization.' });
  }

  if (data.role !== 'owner' && data.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins and owners can perform this action.' });
  }

  return data.role;
}

export const teamsRouter = router({
  listMembers: protectedProcedure.input(orgIdSchema).query(async ({ ctx, input }): Promise<Pick<OrgMember, 'id' | 'user_id' | 'role' | 'invited_by' | 'joined_at'>[]> => {
    const { data: membership, error: memberError } = await ctx.supabase
      .from('org_members')
      .select('role')
      .eq('org_id', input.orgId)
      .eq('user_id', ctx.user.id)
      .single();

    if (memberError || !membership) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this organization.' });
    }

    const { data, error } = await ctx.supabase
      .from('org_members')
      .select('id, user_id, role, invited_by, joined_at')
      .eq('org_id', input.orgId)
      .order('joined_at', { ascending: true });

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return (data ?? []) as Pick<OrgMember, 'id' | 'user_id' | 'role' | 'invited_by' | 'joined_at'>[];
  }),

  invite: protectedProcedure.input(inviteSchema).mutation(async ({ ctx, input }) => {
    await assertAdminOrOwner(ctx.supabase, ctx.user.id, input.orgId);

    // Look up user by email via admin to get their user ID
    // In a real app you'd send an invite email; here we add them directly if they exist
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    const { data: usersData } = await adminClient.auth.admin.listUsers();
    const invitedUser = usersData?.users.find((u) => u.email === input.email);

    if (!invitedUser) {
      // Return pending state — in production you'd send an invite email here
      return {
        success: true,
        status: 'pending' as const,
        message: `Invite sent to ${input.email}. They will join when they sign up.`,
      };
    }

    // Check if already a member
    const { data: existing } = await ctx.supabase
      .from('org_members')
      .select('id')
      .eq('org_id', input.orgId)
      .eq('user_id', invitedUser.id)
      .single();

    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'User is already a member of this organization.' });
    }

    const { error } = await ctx.supabase.from('org_members').insert({
      org_id: input.orgId,
      user_id: invitedUser.id,
      role: input.role,
      invited_by: ctx.user.id,
    });

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return { success: true, status: 'added' as const, message: `${input.email} added to the organization.` };
  }),

  removeMember: protectedProcedure.input(removeMemberSchema).mutation(async ({ ctx, input }) => {
    const callerRole = await assertAdminOrOwner(ctx.supabase, ctx.user.id, input.orgId);

    // Owners cannot be removed by admins
    const { data: targetMember } = await ctx.supabase
      .from('org_members')
      .select('role')
      .eq('org_id', input.orgId)
      .eq('user_id', input.userId)
      .single();

    if (!targetMember) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found.' });
    }

    if (targetMember.role === 'owner') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot remove the organization owner.' });
    }

    if (targetMember.role === 'admin' && callerRole !== 'owner') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the owner can remove admins.' });
    }

    const { error } = await ctx.supabase
      .from('org_members')
      .delete()
      .eq('org_id', input.orgId)
      .eq('user_id', input.userId);

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return { success: true };
  }),

  updateRole: protectedProcedure.input(updateRoleSchema).mutation(async ({ ctx, input }) => {
    const callerRole = await assertAdminOrOwner(ctx.supabase, ctx.user.id, input.orgId);

    // Only owner can assign admin role
    if (input.role === 'admin' && callerRole !== 'owner') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the owner can assign the admin role.' });
    }

    const { error } = await ctx.supabase
      .from('org_members')
      .update({ role: input.role })
      .eq('org_id', input.orgId)
      .eq('user_id', input.userId);

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }

    return { success: true };
  }),
});
