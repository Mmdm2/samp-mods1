/*
# SAMP Tool Platform - Full Schema

Creates all tables needed for the GTA SA / SAMP tool platform.
*/

-- Scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Script',
  script_type text NOT NULL DEFAULT 'lua',
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_scripts" ON scripts;
CREATE POLICY "select_own_scripts" ON scripts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_scripts" ON scripts;
CREATE POLICY "insert_own_scripts" ON scripts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_scripts" ON scripts;
CREATE POLICY "update_own_scripts" ON scripts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_scripts" ON scripts;
CREATE POLICY "delete_own_scripts" ON scripts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_chat" ON chat_messages;
CREATE POLICY "select_own_chat" ON chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chat" ON chat_messages;
CREATE POLICY "insert_own_chat" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chat" ON chat_messages;
CREATE POLICY "delete_own_chat" ON chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Voice rooms table
CREATE TABLE IF NOT EXISTS voice_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  participant_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE voice_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_voice_rooms" ON voice_rooms;
CREATE POLICY "select_voice_rooms" ON voice_rooms FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_voice_rooms" ON voice_rooms;
CREATE POLICY "insert_voice_rooms" ON voice_rooms FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_voice_rooms" ON voice_rooms;
CREATE POLICY "update_voice_rooms" ON voice_rooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_voice_rooms" ON voice_rooms;
CREATE POLICY "delete_voice_rooms" ON voice_rooms FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  project_type text NOT NULL DEFAULT 'pack',
  files jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Road textures cache
CREATE TABLE IF NOT EXISTS road_textures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'road',
  image_url text NOT NULL,
  download_url text DEFAULT '',
  fps_rating int DEFAULT 60,
  tags text[] DEFAULT '{}',
  fetched_at timestamptz DEFAULT now()
);
ALTER TABLE road_textures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_road_textures" ON road_textures;
CREATE POLICY "select_road_textures" ON road_textures FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_road_textures" ON road_textures;
CREATE POLICY "insert_road_textures" ON road_textures FOR INSERT TO authenticated WITH CHECK (true);
