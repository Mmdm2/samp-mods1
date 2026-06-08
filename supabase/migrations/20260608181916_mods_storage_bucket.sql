
/*
# Supabase Storage: mods bucket + policies

Creates the 'mods' storage bucket (if it doesn't already exist via the dashboard)
and applies public read + authenticated write policies so:
- Anyone can read/download uploaded files (public bucket)
- Authenticated users can upload their own files
- Users can only delete their own files (path starts with their user_id)

Note: Supabase Storage policies use a special syntax with storage.foldername() etc.
*/

-- Insert the bucket record if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mods',
  'mods',
  true,
  1073741824, -- 1 GB
  NULL -- allow all mime types
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 1073741824;

-- Public read
DROP POLICY IF EXISTS "public_read_mods" ON storage.objects;
CREATE POLICY "public_read_mods" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'mods');

-- Authenticated upload
DROP POLICY IF EXISTS "auth_upload_mods" ON storage.objects;
CREATE POLICY "auth_upload_mods" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'mods');

-- Authenticated update own files
DROP POLICY IF EXISTS "auth_update_mods" ON storage.objects;
CREATE POLICY "auth_update_mods" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'mods' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Authenticated delete own files
DROP POLICY IF EXISTS "auth_delete_mods" ON storage.objects;
CREATE POLICY "auth_delete_mods" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'mods' AND (storage.foldername(name))[1] = auth.uid()::text);
