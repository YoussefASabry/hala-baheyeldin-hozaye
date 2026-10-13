-- =====================================================================
-- RLS lockdown — run once in the Supabase SQL Editor (project ajsnohspthxlyizhpzuj)
-- =====================================================================
-- Before this file, RLS was OFF on every content table, so anyone holding
-- the public anon key (it ships in the browser bundle) could edit or wipe
-- paintings, profile and Q&A, and upload any file to the bucket.
--
-- After this file:
--   * public (anon)          -> read only
--   * logged-in /admin user  -> full access (old admin keeps working)
--   * /studio link           -> server routes use the service role, which
--                               bypasses RLS, so it keeps working too
--   * public site pages      -> read via service role / anon select, unchanged
--
-- Safe to re-run.
-- ALSO DO: Supabase dashboard -> Authentication -> Sign In / Providers ->
-- turn OFF "Allow new users to sign up". Otherwise anyone could sign up
-- with the anon key and get the "authenticated" access granted below.
-- =====================================================================

-- ---------- content tables ----------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['artist_profile', 'artworks', 'artwork_images', 'qna'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS "public read" ON %I', t);
    EXECUTE format('CREATE POLICY "public read" ON %I FOR SELECT TO anon, authenticated USING (true)', t);

    EXECUTE format('DROP POLICY IF EXISTS "admin write" ON %I', t);
    EXECUTE format('CREATE POLICY "admin write" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ---------- storage bucket "artworks" ----------
-- Public read stays. Writes: logged-in admin only. The studio uploads through
-- signed upload URLs minted by the server (service role), so it is unaffected.
DROP POLICY IF EXISTS "Anyone can upload to artworks" ON storage.objects;

DROP POLICY IF EXISTS "Admin upload to artworks" ON storage.objects;
CREATE POLICY "Admin upload to artworks" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artworks');

DROP POLICY IF EXISTS "Admin update artworks" ON storage.objects;
CREATE POLICY "Admin update artworks" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'artworks');

DROP POLICY IF EXISTS "Admin delete artworks" ON storage.objects;
CREATE POLICY "Admin delete artworks" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'artworks');

-- ---------- NOT covered here: admin_invites ----------
-- Still open to anon (policy "admin invites open access"), because
-- /admin/setup validates the invite token from the browser with the anon key.
-- That means anyone with the anon key can list or insert invite tokens and
-- then create an admin account through /api/admin-signup.
-- Fix needs a small code change (validate the token via a server route),
-- then: ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY; and drop that policy.
