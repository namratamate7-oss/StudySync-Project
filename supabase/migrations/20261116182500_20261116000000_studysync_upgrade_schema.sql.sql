/*
# StudySync Upgrade — Schema Extension

## Overview
Extends the existing StudySync schema with additional profile fields, project
fields, a project_members table for team membership, a notifications table for
in-app notifications, and tightened RLS policies so that only project owners
can accept or reject join requests (enforced at the database level, not just
the frontend).

## Changes to existing tables (additive only — no data loss)

1. **profiles** — new columns:
   - `year` (text) — year of study, e.g. "2nd Year"
   - `github_url` (text) — GitHub profile link
   - `linkedin_url` (text) — LinkedIn profile link
   - `interests` (text[]) — areas of interest beyond technical skills

2. **projects** — new columns:
   - `duration` (text) — estimated project duration, e.g. "3 months"
   - `additional_requirements` (text) — extra requirements text
   - `current_team_size` (int) — cached count of accepted members (default 0)

3. **join_requests** — new column:
   - `why_join` (text) — why the applicant wants to join this project

## New tables

1. **project_members** — tracks accepted team members per project
   - `id` (uuid, PK)
   - `project_id` (uuid, FK to projects, ON DELETE CASCADE)
   - `user_id` (uuid, FK to auth.users, ON DELETE CASCADE)
   - `role` (text) — 'owner' or 'member'
   - `joined_at` (timestamptz)
   - UNIQUE(project_id, user_id) prevents duplicate membership

2. **notifications** — in-app notifications
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users, ON DELETE CASCADE) — recipient
   - `type` (text) — 'join_request', 'request_accepted', 'request_rejected', 'added_to_team'
   - `title` (text)
   - `body` (text)
   - `project_id` (uuid, nullable, FK to projects)
   - `actor_id` (uuid, nullable) — who triggered the notification
   - `read` (boolean, default false)
   - `created_at` (timestamptz)

## Security (RLS) changes

- **join_requests** UPDATE policy replaced: only the project owner can update
  the status of a request (accept/reject). The applicant can no longer change
  their own request status to 'accepted'. This is enforced via a subquery:
  `EXISTS (SELECT 1 FROM projects WHERE id = join_requests.project_id
  AND user_id = auth.uid())`.

- **project_members** — new RLS:
  - SELECT: authenticated users can see all members (needed for project pages)
  - INSERT: only the project owner can add members (enforced via subquery)
  - DELETE: only the project owner can remove members
  - No direct UPDATE needed (role set at insert)

- **notifications** — new RLS:
  - SELECT: users can only see their own notifications
  - UPDATE: users can only mark their own notifications as read
  - INSERT: any authenticated user can create a notification (for other users)
  - DELETE: users can delete their own notifications

- A SECURITY DEFINER function `accept_join_request` is created so the accept
  flow (update request status + insert project_member + create notification +
  update current_team_size) happens atomically with owner verification. Only
  authenticated users can call it.

- A SECURITY DEFINER function `reject_join_request` updates request status
  and creates a notification, with owner verification.

## Grants
- project_members: SELECT/INSERT/DELETE to authenticated
- notifications: SELECT/INSERT/UPDATE/DELETE to authenticated
- Functions: EXECUTE revoked from PUBLIC/anon, granted to authenticated

## Notes
1. All existing data is preserved. New columns have safe defaults.
2. The `handle_new_user` trigger continues to work — new columns default safely.
3. project_members rows for existing project owners are NOT auto-created;
   membership is managed through the accept flow going forward.
*/

-- ==================== PROFILES: add columns ====================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'year') THEN
    ALTER TABLE profiles ADD COLUMN year text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'github_url') THEN
    ALTER TABLE profiles ADD COLUMN github_url text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_url') THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'interests') THEN
    ALTER TABLE profiles ADD COLUMN interests text[] DEFAULT '{}';
  END IF;
END $$;

-- ==================== PROJECTS: add columns ====================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'duration') THEN
    ALTER TABLE projects ADD COLUMN duration text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'additional_requirements') THEN
    ALTER TABLE projects ADD COLUMN additional_requirements text DEFAULT '';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'current_team_size') THEN
    ALTER TABLE projects ADD COLUMN current_team_size integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ==================== JOIN_REQUESTS: add column ====================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'join_requests' AND column_name = 'why_join') THEN
    ALTER TABLE join_requests ADD COLUMN why_join text DEFAULT '';
  END IF;
END $$;

-- ==================== PROJECT_MEMBERS table ====================

CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON project_members TO authenticated;

DROP POLICY IF EXISTS "project_members_select_all" ON project_members;
CREATE POLICY "project_members_select_all"
  ON project_members FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "project_members_insert_owner" ON project_members;
CREATE POLICY "project_members_insert_owner"
  ON project_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "project_members_delete_owner" ON project_members;
CREATE POLICY "project_members_delete_owner"
  ON project_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- ==================== NOTIFICATIONS table ====================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  actor_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_any" ON notifications;
CREATE POLICY "notifications_insert_any"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ==================== JOIN_REQUESTS: tighten UPDATE policy ====================
-- Only the project owner can update a request's status (accept/reject).
-- The applicant can no longer change their own request status.

DROP POLICY IF EXISTS "join_requests_update_own" ON join_requests;
CREATE POLICY "join_requests_update_owner_only"
  ON join_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = join_requests.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = join_requests.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ==================== accept_join_request function ====================

CREATE OR REPLACE FUNCTION public.accept_join_request(req_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req join_requests%ROWTYPE;
  proj projects%ROWTYPE;
  member_count integer;
BEGIN
  SELECT * INTO req FROM join_requests WHERE id = req_id;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Request not found');
  END IF;

  SELECT * INTO proj FROM projects WHERE id = req.project_id;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Project not found');
  END IF;

  -- Only the project owner can accept
  IF proj.user_id != auth.uid() THEN
    RETURN json_build_object('error', 'Only the project owner can accept requests');
  END IF;

  -- Only pending requests can be accepted
  IF req.status != 'pending' THEN
    RETURN json_build_object('error', 'Request is no longer pending');
  END IF;

  -- Count current accepted members
  SELECT count(*) INTO member_count FROM project_members WHERE project_id = proj.id;
  IF member_count >= proj.team_size THEN
    RETURN json_build_object('error', 'Team is already full');
  END IF;

  -- Check not already a member
  IF EXISTS (SELECT 1 FROM project_members WHERE project_id = proj.id AND user_id = req.user_id) THEN
    RETURN json_build_object('error', 'Student is already a team member');
  END IF;

  -- Accept the request
  UPDATE join_requests SET status = 'accepted' WHERE id = req_id;

  -- Add to project members
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (proj.id, req.user_id, 'member')
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- Update current team size
  UPDATE projects SET current_team_size = (
    SELECT count(*) FROM project_members WHERE project_id = proj.id
  ) WHERE id = proj.id;

  -- Notify the applicant
  INSERT INTO notifications (user_id, type, title, body, project_id, actor_id)
  VALUES (
    req.user_id,
    'request_accepted',
    'Request Accepted',
    'Your request to join "' || proj.title || '" has been accepted.',
    proj.id,
    auth.uid()
  );

  RETURN json_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_join_request(uuid) TO authenticated;

-- ==================== reject_join_request function ====================

CREATE OR REPLACE FUNCTION public.reject_join_request(req_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req join_requests%ROWTYPE;
  proj projects%ROWTYPE;
BEGIN
  SELECT * INTO req FROM join_requests WHERE id = req_id;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Request not found');
  END IF;

  SELECT * INTO proj FROM projects WHERE id = req.project_id;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Project not found');
  END IF;

  -- Only the project owner can reject
  IF proj.user_id != auth.uid() THEN
    RETURN json_build_object('error', 'Only the project owner can reject requests');
  END IF;

  -- Only pending requests can be rejected
  IF req.status != 'pending' THEN
    RETURN json_build_object('error', 'Request is no longer pending');
  END IF;

  -- Reject the request
  UPDATE join_requests SET status = 'rejected' WHERE id = req_id;

  -- Notify the applicant
  INSERT INTO notifications (user_id, type, title, body, project_id, actor_id)
  VALUES (
    req.user_id,
    'request_rejected',
    'Request Rejected',
    'Your request to join "' || proj.title || '" has been declined.',
    proj.id,
    auth.uid()
  );

  RETURN json_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reject_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reject_join_request(uuid) TO authenticated;
