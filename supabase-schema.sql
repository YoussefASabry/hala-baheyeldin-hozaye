-- ============================================================
-- Hala Baheyeldin Hozayen — Supabase Schema Setup
-- Run this in your Supabase project's SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Artist Profile (single-artist site)
CREATE TABLE IF NOT EXISTS artist_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT '',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  tiktok_url TEXT DEFAULT '',
  group_url TEXT DEFAULT '', -- link for the "نون للفنون" group credit in the About Me section
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Artworks (flat list, no collections)
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  year TEXT DEFAULT '',
  medium TEXT DEFAULT '',
  length_in NUMERIC,
  width_in NUMERIC,
  description TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Artwork Images (one-to-many with artworks)
CREATE TABLE IF NOT EXISTS artwork_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Q&A (bilingual EN/AR question & answer pairs)
CREATE TABLE IF NOT EXISTS qna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_en TEXT NOT NULL DEFAULT '',
  question_ar TEXT NOT NULL DEFAULT '',
  answer_en TEXT NOT NULL DEFAULT '',
  answer_ar TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Disable RLS (no public-facing auth needed — admin uses Supabase Auth + service role)
-- ============================================================
ALTER TABLE artist_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE qna DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_artworks_deleted_at ON artworks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_artworks_published ON artworks(is_published) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_qna_sort_order ON qna(sort_order);

-- ============================================================
-- Storage bucket for artwork images
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read artworks bucket" ON storage.objects;
CREATE POLICY "Public read artworks bucket" ON storage.objects FOR SELECT USING (bucket_id = 'artworks');

DROP POLICY IF EXISTS "Anyone can upload to artworks" ON storage.objects;
CREATE POLICY "Anyone can upload to artworks" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'artworks');

-- ============================================================
-- Seed: one artist_profile row (edit the rest via /admin afterwards)
-- ============================================================
INSERT INTO artist_profile (name, contact_phone, whatsapp_number)
SELECT 'Hala Baheyeldin Hozayen', '01006632331', '201006632331'
WHERE NOT EXISTS (SELECT 1 FROM artist_profile);
