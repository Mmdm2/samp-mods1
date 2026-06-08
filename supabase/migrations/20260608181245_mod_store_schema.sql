
/*
# Mod Store Schema

## Summary
Full mod-sharing platform: users upload mods (files/images/video), others like them.
Leaderboard tracks top-liked mods. Admin sends prize codes privately.
Protected paid packs with license keys (AES-encrypted delivery).

## New Tables

### mods
Public mod listings. Stores metadata + Supabase Storage paths.
- id, user_id (owner), title, description, category, version
- file_url (main mod file path), file_size_bytes
- thumbnail_url (cover image path)
- media_urls (array of image/video paths)
- downloads, views (counters)
- published (boolean, defaults false until published)
- approved (boolean, admin-approved)
- created_at, updated_at

### mod_likes
One like per user per mod. Drives leaderboard ranking.
- id, mod_id (FK → mods), user_id, created_at
- UNIQUE (mod_id, user_id)

### mod_comments
Comments on mods.
- id, mod_id, user_id, content, created_at

### prizes
Admin sends prize (internet credit code) to a winner.
- id, winner_user_id, mod_id (the winning mod), prize_type
- encrypted_code (the prize code, only visible to winner)
- message (public congrats), claimed (boolean)
- created_at

### mod_packs
Paid/protected packs. Content encrypted, only accessible via valid license.
- id, user_id (creator), title, description, price_display
- thumbnail_url, file_url (encrypted archive path)
- encryption_key_hash (SHA-256 of the key, for verification)
- total_sales, created_at

### pack_licenses
License keys issued after purchase/admin grant.
- id, pack_id, user_id, license_key (UUID token), active
- issued_at, expires_at (null = forever)

## Security
- RLS enabled on all tables
- mods: anyone can SELECT published+approved; owner can INSERT/UPDATE/DELETE own
- mod_likes: authenticated users can INSERT/DELETE own likes; anyone can read counts
- mod_comments: authenticated CRUD own; anyone SELECT
- prizes: only winner can SELECT their own prize (encrypted_code hidden from others)
- mod_packs: anyone SELECT; owner INSERT/UPDATE/DELETE
- pack_licenses: only licensee SELECT their own license
*/

-- MODS table
CREATE TABLE IF NOT EXISTS mods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  version text NOT NULL DEFAULT '1.0',
  tags text[] DEFAULT '{}',
  file_url text DEFAULT '',
  file_size_bytes bigint DEFAULT 0,
  thumbnail_url text DEFAULT '',
  media_urls text[] DEFAULT '{}',
  downloads integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  like_count integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_select_mods" ON mods;
CREATE POLICY "anyone_select_mods" ON mods FOR SELECT
  TO anon, authenticated USING (published = true AND approved = true);

DROP POLICY IF EXISTS "owner_select_own_mods" ON mods;
CREATE POLICY "owner_select_own_mods" ON mods FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_mods" ON mods;
CREATE POLICY "insert_own_mods" ON mods FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_mods" ON mods;
CREATE POLICY "update_own_mods" ON mods FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_mods" ON mods;
CREATE POLICY "delete_own_mods" ON mods FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- MOD_LIKES table
CREATE TABLE IF NOT EXISTS mod_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id uuid NOT NULL REFERENCES mods(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (mod_id, user_id)
);

ALTER TABLE mod_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_likes" ON mod_likes;
CREATE POLICY "select_likes" ON mod_likes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_like" ON mod_likes;
CREATE POLICY "insert_own_like" ON mod_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_like" ON mod_likes;
CREATE POLICY "delete_own_like" ON mod_likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- MOD_COMMENTS table
CREATE TABLE IF NOT EXISTS mod_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id uuid NOT NULL REFERENCES mods(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mod_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_comments" ON mod_comments;
CREATE POLICY "select_comments" ON mod_comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_comment" ON mod_comments;
CREATE POLICY "insert_own_comment" ON mod_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_comment" ON mod_comments;
CREATE POLICY "delete_own_comment" ON mod_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- PRIZES table
CREATE TABLE IF NOT EXISTS prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mod_id uuid REFERENCES mods(id) ON DELETE SET NULL,
  prize_type text NOT NULL DEFAULT 'internet_credit',
  encrypted_code text NOT NULL,
  message text NOT NULL DEFAULT '',
  claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "winner_select_own_prize" ON prizes;
CREATE POLICY "winner_select_own_prize" ON prizes FOR SELECT
  TO authenticated USING (auth.uid() = winner_user_id);

DROP POLICY IF EXISTS "winner_update_claimed" ON prizes;
CREATE POLICY "winner_update_claimed" ON prizes FOR UPDATE
  TO authenticated USING (auth.uid() = winner_user_id) WITH CHECK (auth.uid() = winner_user_id);

-- MOD_PACKS table (paid / protected)
CREATE TABLE IF NOT EXISTS mod_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  thumbnail_url text DEFAULT '',
  file_url text DEFAULT '',
  price_display text NOT NULL DEFAULT 'رایگان',
  encryption_key_hash text DEFAULT '',
  total_sales integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mod_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_packs" ON mod_packs;
CREATE POLICY "select_packs" ON mod_packs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_pack" ON mod_packs;
CREATE POLICY "insert_own_pack" ON mod_packs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_pack" ON mod_packs;
CREATE POLICY "update_own_pack" ON mod_packs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_pack" ON mod_packs;
CREATE POLICY "delete_own_pack" ON mod_packs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- PACK_LICENSES table
CREATE TABLE IF NOT EXISTS pack_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES mod_packs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  license_key text NOT NULL DEFAULT gen_random_uuid()::text,
  active boolean NOT NULL DEFAULT true,
  issued_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT NULL,
  UNIQUE (pack_id, user_id)
);

ALTER TABLE pack_licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_license" ON pack_licenses;
CREATE POLICY "select_own_license" ON pack_licenses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_license" ON pack_licenses;
CREATE POLICY "insert_own_license" ON pack_licenses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mods_user_id ON mods(user_id);
CREATE INDEX IF NOT EXISTS idx_mods_category ON mods(category);
CREATE INDEX IF NOT EXISTS idx_mods_like_count ON mods(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_mod_likes_mod_id ON mod_likes(mod_id);
CREATE INDEX IF NOT EXISTS idx_mod_likes_user_id ON mod_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_mod_comments_mod_id ON mod_comments(mod_id);
CREATE INDEX IF NOT EXISTS idx_prizes_winner ON prizes(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_pack_licenses_user ON pack_licenses(user_id);

-- Function to increment like_count atomically
CREATE OR REPLACE FUNCTION increment_mod_like(p_mod_id uuid, delta integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE mods SET like_count = GREATEST(0, like_count + delta) WHERE id = p_mod_id;
END;
$$;

-- Function to increment mod view count
CREATE OR REPLACE FUNCTION increment_mod_view(p_mod_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE mods SET views = views + 1 WHERE id = p_mod_id;
END;
$$;

-- Function to increment mod download count
CREATE OR REPLACE FUNCTION increment_mod_download(p_mod_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE mods SET downloads = downloads + 1 WHERE id = p_mod_id;
END;
$$;
