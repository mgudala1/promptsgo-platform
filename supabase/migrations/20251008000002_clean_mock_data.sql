-- Clean up all mock data from the database
-- This removes all the seeded demo prompts and profiles

-- Delete all prompts created by demo users
DELETE FROM prompts
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid, -- Sarah Chen
  '22222222-2222-2222-2222-222222222222'::uuid, -- Marcus Rivera
  '33333333-3333-3333-3333-333333333333'::uuid, -- Emily Watson
  '44444444-4444-4444-4444-444444444444'::uuid, -- David Park
  '55555555-5555-5555-5555-555555555555'::uuid  -- Alex Thompson
);

-- Delete all demo profiles
DELETE FROM profiles
WHERE email LIKE '%demo@promptsgo.com%';

-- Delete any orphaned prompt images (if they exist)
DELETE FROM prompt_images
WHERE prompt_id NOT IN (
  SELECT id FROM prompts
);

-- Delete any orphaned comments
DELETE FROM comments
WHERE prompt_id NOT IN (
  SELECT id FROM prompts
);

-- Delete any orphaned hearts
DELETE FROM hearts
WHERE prompt_id NOT IN (
  SELECT id FROM prompts
);

-- Delete any orphaned saves
DELETE FROM saves
WHERE prompt_id NOT IN (
  SELECT id FROM prompts
);

-- Delete any orphaned success votes
DELETE FROM success_votes
WHERE prompt_id NOT IN (
  SELECT id FROM prompts
);

-- Reset any sequences if needed (optional)
-- ALTER SEQUENCE IF EXISTS prompts_id_seq RESTART WITH 1;

-- Verification query
SELECT
  'Cleanup completed' as status,
  (SELECT COUNT(*) FROM prompts) as remaining_prompts,
  (SELECT COUNT(*) FROM profiles) as remaining_profiles,
  (SELECT COUNT(*) FROM prompt_images) as remaining_images,
  (SELECT COUNT(*) FROM comments) as remaining_comments,
  (SELECT COUNT(*) FROM hearts) as remaining_hearts,
  (SELECT COUNT(*) FROM saves) as remaining_saves,
  (SELECT COUNT(*) FROM success_votes) as remaining_votes;