# Role-Based Access Control (RBAC)

## Role Hierarchy

```
owner > admin > member > viewer
```

| Role | Weight | Can Manage Members | Can Edit Projects | Can View |
|------|--------|-------------------|-------------------|---------|
| owner | 40 | Yes | Yes | Yes |
| admin | 30 | Yes | Yes | Yes |
| member | 20 | No | Yes | Yes |
| viewer | 10 | No | No | Yes |

## Database Schema

```sql
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);
```

## RLS Policies

Permission checks happen at the database level via PostgreSQL RLS:

```sql
-- Members can read their org's projects
CREATE POLICY "org_members_read_projects"
ON projects FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  )
);

-- Only admins/owners can delete projects
CREATE POLICY "admin_delete_projects"
ON projects FOR DELETE
USING (
  org_id IN (
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);
```

## Application Layer

tRPC procedures use `protectedProcedure` for authentication and add role checks inline:

```typescript
// Example: admin-only procedure
const deleteProject = protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Check org membership and role
    const member = await ctx.supabase
      .from('org_members')
      .select('role')
      .eq('user_id', ctx.user.id)
      .single();

    if (!member || !['owner', 'admin'].includes(member.data?.role)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    // ... proceed with deletion
  });
```

## Inviting Members

Team invites are sent via email (Supabase Auth magic links) with a pending `org_members` record created upon acceptance.
