-- Create 20 Reusable Invite Codes for PromptsGo
-- Run this in Supabase SQL Editor
-- These codes can be used multiple times and don't expire

-- Clear existing generic codes (optional - comment out if you want to keep old codes)
-- DELETE FROM invitees WHERE email IS NULL AND invite_code LIKE '%2024%';

-- Insert 20 reusable invite codes
INSERT INTO invitees (invite_code, status, invited_at, expires_at, email, invited_by)
VALUES
  ('WELCOME2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('PROMPTGO2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('AIPOWER2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('CREATOR2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('INNOVATE2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('BUILDER2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('LAUNCH2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('STARTUP2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('GROWTH2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('SUCCESS2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('PIONEER2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('VISIONARY2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('TECHIE2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('CODER2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('DESIGNER2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('PRODUCT2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('MANAGER2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('LEADER2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('EXPERT2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL),
  ('MASTER2024', 'pending', NOW(), NOW() + INTERVAL '1 year', NULL, NULL)
ON CONFLICT (invite_code) DO NOTHING;

-- Verify the codes were created
SELECT 
  invite_code, 
  status, 
  expires_at,
  CASE 
    WHEN expires_at > NOW() THEN 'Active'
    ELSE 'Expired'
  END as validity
FROM invitees 
WHERE email IS NULL 
  AND invite_code IS NOT NULL
ORDER BY invited_at DESC;

-- Show usage instructions
SELECT 
  '🎉 20 Reusable Invite Codes Created! 🎉' as message,
  'Users can sign up with any of these codes multiple times' as note,
  'Codes expire in 1 year' as expiration;