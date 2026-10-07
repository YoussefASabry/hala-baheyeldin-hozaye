-- ============================================================
-- Add about_quote to artist_profile (the artist statement shown
-- in the About Me section). Pre-filled with the current live text
-- so nothing changes on the site until you edit it in admin.
-- Run this in your Supabase project's SQL Editor.
-- ============================================================

ALTER TABLE artist_profile ADD COLUMN IF NOT EXISTS about_quote TEXT DEFAULT 'أجد في الفن ملاذاً روحياً للتعبير عما يدور بداخلي والتحرر من أعباء الحياة. تتشكل لوحاتي كمرآة صادقة لشخصيتي ومزاجي لحظة الإبداع، إيماناً مني بأن الصدق الشعوري هو جوهر النجاح الفني. وبفضل هذا الارتباط التلقائي بين مشاعري والفرشاة، اكتسبت أعمالي أسلوباً وبصمة خاصة تجعلها واضحة ومميزة لكل من يشاهدها.';
