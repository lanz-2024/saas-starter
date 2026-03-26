-- ============================================================
-- Auto-create org on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
  slug_base TEXT;
  counter INT := 0;
  final_slug TEXT;
BEGIN
  -- Generate slug from email username
  slug_base := LOWER(SPLIT_PART(NEW.email, '@', 1));
  slug_base := REGEXP_REPLACE(slug_base, '[^a-z0-9]', '-', 'g');
  slug_base := slug_base || '-' || SUBSTR(REPLACE(NEW.id::TEXT, '-', ''), 1, 8);
  final_slug := slug_base;

  -- Ensure slug uniqueness (loop as safety net)
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := slug_base || '-' || counter;
  END LOOP;

  -- Create organization
  INSERT INTO organizations (name, slug)
  VALUES (
    COALESCE(
      NEW.raw_user_meta_data->>'org_name',
      SPLIT_PART(NEW.email, '@', 1) || '''s Workspace'
    ),
    final_slug
  )
  RETURNING id INTO new_org_id;

  -- Add user as owner
  INSERT INTO org_members (org_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Audit log trigger for project changes
-- ============================================================
CREATE OR REPLACE FUNCTION log_project_changes()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, metadata)
    VALUES (
      NEW.org_id,
      auth.uid(),
      'create',
      'project',
      NEW.id,
      jsonb_build_object('name', NEW.name, 'status', NEW.status)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, metadata)
    VALUES (
      NEW.org_id,
      auth.uid(),
      'update',
      'project',
      NEW.id,
      jsonb_build_object(
        'old_name', OLD.name,
        'new_name', NEW.name,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, metadata)
    VALUES (
      OLD.org_id,
      auth.uid(),
      'delete',
      'project',
      OLD.id,
      jsonb_build_object('name', OLD.name)
    );
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER project_audit_log
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_project_changes();

-- ============================================================
-- Helper: get user's primary org
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_org_id(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT org_id INTO v_org_id
  FROM org_members
  WHERE user_id = p_user_id AND role = 'owner'
  ORDER BY joined_at ASC
  LIMIT 1;

  RETURN v_org_id;
END;
$$;

-- ============================================================
-- Helper: check org plan limit
-- ============================================================
CREATE OR REPLACE FUNCTION check_project_limit(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_count INT;
  v_limit INT;
BEGIN
  SELECT plan INTO v_plan FROM organizations WHERE id = p_org_id;
  SELECT COUNT(*) INTO v_count FROM projects WHERE org_id = p_org_id AND status != 'archived';

  v_limit := CASE v_plan
    WHEN 'free' THEN 3
    WHEN 'pro' THEN 50
    ELSE 2147483647 -- enterprise: effectively unlimited
  END;

  RETURN v_count < v_limit;
END;
$$;
