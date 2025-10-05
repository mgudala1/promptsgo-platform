-- Add test invites for development
-- Run this in Supabase SQL Editor

-- Insert test invites (skip if email already exists)
INSERT INTO invitees (email, invite_code, status, invited_at, expires_at)
SELECT 'test@example.com', 'TEST2024', 'pending', NOW(), NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE email = 'test@example.com');

INSERT INTO invitees (email, invite_code, status, invited_at, expires_at)
SELECT 'user@example.com', 'USER2024', 'pending', NOW(), NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE email = 'user@example.com');

INSERT INTO invitees (email, invite_code, status, invited_at, expires_at)
SELECT 'demo@example.com', 'DEMO2024', 'pending', NOW(), NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE email = 'demo@example.com');

-- Insert 20 Pro invite codes for testing (skip if code already exists)
INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'PRO2024A', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'PRO2024A');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'TECH2024B', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'TECH2024B');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'CODE2024C', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'CODE2024C');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'AI2024D', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'AI2024D');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'DEV2024E', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'DEV2024E');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'PRO2024F', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'PRO2024F');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'TECH2024G', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'TECH2024G');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'CODE2024H', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'CODE2024H');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'AI2024I', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'AI2024I');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'DEV2024J', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'DEV2024J');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'PRO2024K', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'PRO2024K');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'TECH2024L', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'TECH2024L');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'CODE2024M', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'CODE2024M');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'AI2024N', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'AI2024N');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'DEV2024O', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'DEV2024O');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'PRO2024P', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'PRO2024P');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'TECH2024Q', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'TECH2024Q');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'CODE2024R', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'CODE2024R');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'AI2024S', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'AI2024S');

INSERT INTO invitees (invite_code, status, invited_at, expires_at, invited_by)
SELECT 'DEV2024T', 'pending', NOW(), NOW() + INTERVAL '30 days', NULL
WHERE NOT EXISTS (SELECT 1 FROM invitees WHERE invite_code = 'DEV2024T');

-- Insert test waitlist entries
INSERT INTO invitees (email, status, invited_at)
VALUES
  ('waitlist1@example.com', 'waitlist', NOW()),
  ('waitlist2@example.com', 'waitlist', NOW())
ON CONFLICT (email) DO NOTHING;

-- Check invites
SELECT invite_code, status, expires_at FROM invitees WHERE invite_code IS NOT NULL ORDER BY invited_at DESC;