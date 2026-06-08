/*
# Room Messages + Explore Content

1. New Tables
  - `room_messages` — text chat messages inside voice rooms
    - id, room_id, user_id, username, content, created_at
  - `explore_items` — GTA SA/SAMP content items for explore page
    - id, title, description, category, author, image_url, downloads, likes, tags, created_at

2. Security
  - RLS enabled on both
  - room_messages: authenticated can read/insert
  - explore_items: anon + authenticated can read, authenticated can insert
*/

-- Room text chat messages
CREATE TABLE IF NOT EXISTS room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id uuid DEFAULT auth.uid(),
  username text NOT NULL DEFAULT 'ناشناس',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_room_messages" ON room_messages;
CREATE POLICY "select_room_messages" ON room_messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_room_messages" ON room_messages;
CREATE POLICY "insert_room_messages" ON room_messages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_messages" ON room_messages;
CREATE POLICY "delete_own_messages" ON room_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Explore content items
CREATE TABLE IF NOT EXISTS explore_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'script',
  author text DEFAULT 'Unknown',
  image_url text DEFAULT '',
  downloads int DEFAULT 0,
  likes int DEFAULT 0,
  tags text[] DEFAULT '{}',
  external_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE explore_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_explore" ON explore_items;
CREATE POLICY "select_explore" ON explore_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_explore" ON explore_items;
CREATE POLICY "insert_explore" ON explore_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_explore_items_category ON explore_items(category);
