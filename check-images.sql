-- Check if images are being saved to the database
-- Run these queries in your Supabase SQL Editor

-- 1. Check if the caption column exists in prompt_images table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'prompt_images'
ORDER BY ordinal_position;

-- 2. Check how many images are currently in the database
SELECT COUNT(*) as total_images FROM prompt_images;

-- 3. Check recent images with all their data
SELECT
    pi.id,
    pi.prompt_id,
    pi.url,
    pi.alt_text,
    pi.is_primary,
    pi.size,
    pi.mime_type,
    pi.width,
    pi.height,
    pi.caption,
    pi.created_at,
    p.title as prompt_title
FROM prompt_images pi
LEFT JOIN prompts p ON pi.prompt_id = p.id
ORDER BY pi.created_at DESC
LIMIT 10;

-- 4. Check if any prompts have images (via the relationship)
SELECT
    p.id,
    p.title,
    COUNT(pi.id) as image_count
FROM prompts p
LEFT JOIN prompt_images pi ON p.id = pi.prompt_id
GROUP BY p.id, p.title
HAVING COUNT(pi.id) > 0
ORDER BY image_count DESC;

-- 5. Check the most recent prompt creation/update to see if images were saved
SELECT
    id,
    title,
    created_at,
    updated_at
FROM prompts
ORDER BY updated_at DESC
LIMIT 5;