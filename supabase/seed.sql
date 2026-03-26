-- Demo seed data for local development
-- Run after migrations with: supabase db reset

-- Note: In a real dev flow, users are created via Supabase Auth.
-- This seed inserts demo organizations and projects linked to a
-- test user UUID that matches your local auth seed.

-- To use: create a user via the Supabase Studio UI or supabase CLI,
-- then replace the UUID below with the real user ID.

-- Demo organization (manually created, bypassing trigger for seed)
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
  demo_org_id UUID;
BEGIN
  -- Only insert if the demo user exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN
    -- Create org
    INSERT INTO organizations (id, name, slug, plan)
    VALUES (
      '00000000-0000-0000-0000-000000000010',
      'Acme Corp',
      'acme-corp-demo',
      'pro'
    )
    ON CONFLICT (id) DO NOTHING;

    demo_org_id := '00000000-0000-0000-0000-000000000010';

    -- Add owner
    INSERT INTO org_members (org_id, user_id, role)
    VALUES (demo_org_id, demo_user_id, 'owner')
    ON CONFLICT (org_id, user_id) DO NOTHING;

    -- Demo projects
    INSERT INTO projects (org_id, name, description, status, created_by) VALUES
      (demo_org_id, 'Website Redesign', 'Complete overhaul of the marketing site', 'active', demo_user_id),
      (demo_org_id, 'Mobile App v2', 'iOS and Android companion app', 'active', demo_user_id),
      (demo_org_id, 'API Integration', 'Third-party service integrations', 'completed', demo_user_id)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Demo seed data inserted for user %', demo_user_id;
  ELSE
    RAISE NOTICE 'Demo user % not found, skipping seed', demo_user_id;
  END IF;
END $$;
