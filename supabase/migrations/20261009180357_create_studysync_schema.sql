/*
# StudySync — Full Database Schema

## Overview
Creates the complete schema for StudySync, a platform where college students find
project teammates and study groups using AI skill matching. This is a multi-user
app with authentication — every user sees all projects but can only manage their own.

## New Tables

1. **profiles** — Extends Supabase auth.users with public profile data
   - `id` (uuid, PK, references auth.users)
   - `full_name` (text, display name)
   - `university` (text, school name)
   - `major` (text, field of study)
   - `bio` (text, short bio)
   - `skills` (text[], array of skill tags like 'Python', 'React', 'UI/UX')
   - `avatar_color` (text, used for generated avatars)
   - `created_at` (timestamptz)

2. **projects** — Project postings seeking teammates
   - `id` (uuid, PK)
   - `title` (text, project name)
   - `description` (text, detailed project description)
   - `category` (text, e.g. 'Web Dev', 'AI/ML', 'Design', 'Mobile', 'Data Science')
   - `skills_needed` (text[], skills the project requires)
   - `team_size` (int, desired team size)
   - `status` (text, 'open' or 'closed')
   - `user_id` (uuid, owner, defaults to auth.uid())
   - `created_at` (timestamptz)

3. **join_requests** — Requests to join a project
   - `id` (uuid, PK)
   - `project_id` (uuid, FK to projects)
   - `user_id` (uuid, requester, defaults to auth.uid())
   - `message` (text, optional message to project owner)
   - `status` (text, 'pending', 'accepted', 'declined')
   - `created_at` (timestamptz)

## Security (RLS)

All tables have Row Level Security enabled.

- **profiles**: Authenticated users can read all profiles (needed to see who posted
  projects). Users can only insert/update their own profile.
- **projects**: All authenticated users can read all projects (it's an explore feed).
  Users can only insert/update/delete their own projects.
- **join_requests**: All authenticated users can read all join requests (project owners
  need to see who wants to join, requesters need to see their own requests). Users can
  only insert their own requests, and can only update/delete their own requests.

## Indexes
- Indexes on foreign keys and commonly queried columns for performance.

## Notes
1. The `handle_new_user` trigger automatically creates a profile row when a new user
   signs up via Supabase Auth, using metadata from the signup form.
2. Owner columns default to `auth.uid()` so client-side inserts work without explicitly
   passing the user ID.
*/

-- ==================== PROFILES ====================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  university text DEFAULT '',
  major text DEFAULT '',
  bio text DEFAULT '',
  skills text[] DEFAULT '{}',
  avatar_color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==================== PROJECTS ====================

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Web Dev',
  skills_needed text[] DEFAULT '{}',
  team_size integer NOT NULL DEFAULT 3,
  status text NOT NULL DEFAULT 'open',
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select_all" ON projects;
CREATE POLICY "projects_select_all"
  ON projects FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "projects_insert_own" ON projects;
CREATE POLICY "projects_insert_own"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_update_own" ON projects;
CREATE POLICY "projects_update_own"
  ON projects FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_delete_own" ON projects;
CREATE POLICY "projects_delete_own"
  ON projects FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ==================== JOIN REQUESTS ====================

CREATE TABLE IF NOT EXISTS join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "join_requests_select_all" ON join_requests;
CREATE POLICY "join_requests_select_all"
  ON join_requests FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "join_requests_insert_own" ON join_requests;
CREATE POLICY "join_requests_insert_own"
  ON join_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "join_requests_update_own" ON join_requests;
CREATE POLICY "join_requests_update_own"
  ON join_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "join_requests_delete_own" ON join_requests;
CREATE POLICY "join_requests_delete_own"
  ON join_requests FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_join_requests_project_id ON join_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_user_id ON join_requests(user_id);

-- ==================== AUTO-PROFILE TRIGGER ====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#3b82f6')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
