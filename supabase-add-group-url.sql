-- ============================================================
-- Add group_url to artist_profile (for the "نون للفنون" credit link
-- in the About Me section). Safe to run on the already-live project —
-- run this in your Supabase project's SQL Editor.
-- ============================================================

ALTER TABLE artist_profile ADD COLUMN IF NOT EXISTS group_url TEXT DEFAULT '';
