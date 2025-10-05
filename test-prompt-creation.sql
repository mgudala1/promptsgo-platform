-- Test prompt creation and image saving
-- Run these queries in your Supabase SQL Editor

-- 1. Check if you can create a test prompt manually
INSERT INTO prompts (
    user_id,
    title,
    slug,
    description,
    content,
    type,
    category,
    visibility
) VALUES (
    'test-user-id', -- Replace with a real user ID from your profiles table
    'Test Prompt with Image',
    'test-prompt-with-image',
    'Testing image saving functionality',
    'This is a test prompt content.',
    'text',
    'writing',
    'public'
) RETURNING id;

-- 2. Check if you can insert an image for that prompt
-- (Replace 'prompt-id-here' with the ID returned from step 1)
INSERT INTO prompt_images (
    prompt_id,
    url,
    alt_text,
    is_primary,
    size,
    mime_type,
    width,
    height,
    caption
) VALUES (
    'prompt-id-here', -- Replace with actual prompt ID
    'https://example.com/test-image.jpg',
    'Test image',
    true,
    1024000,
    'image/jpeg',
    800,
    600,
    'This is a test caption'
);

-- 3. Check RLS policies for prompts table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'prompts';

-- 4. Check RLS policies for prompt_images table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'prompt_images';

-- 5. Test if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('prompts', 'prompt_images');