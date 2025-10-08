-- Migration: Implement three-tier role system
-- This migration adds user roles and subscription status to profiles table
-- and migrates existing subscription data safely

BEGIN;

-- Step 1: Create the new user_role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('general', 'pro', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add role column to profiles table with default 'general'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'general';

-- Step 3: Add subscription_status column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'active';

-- Step 4: Migrate existing subscription_plan data to the new role field
-- Map 'free' -> 'general', 'pro' -> 'pro'
-- Note: Admin role will need to be set manually or through other means
UPDATE profiles
SET role = CASE
    WHEN subscription_plan = 'free' THEN 'general'::user_role
    WHEN subscription_plan = 'pro' THEN 'pro'::user_role
    ELSE 'general'::user_role  -- Default fallback
END;

-- Step 5: Update subscription status from subscriptions table
-- Get the most recent subscription status for each user
UPDATE profiles
SET subscription_status = sub.status
FROM (
    SELECT DISTINCT ON (user_id)
        user_id,
        status
    FROM subscriptions
    ORDER BY user_id, created_at DESC
) sub
WHERE profiles.id = sub.user_id;

-- For users without subscriptions, set status to 'active' (already default)
-- But ensure free users are marked appropriately if no subscription exists
UPDATE profiles
SET subscription_status = 'active'
WHERE subscription_status IS NULL;

-- Optional: Create an index on the new role column for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Optional: Create an index on subscription_status
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

COMMIT;

-- Verification queries (run these after migration to verify)
-- SELECT role, subscription_status, subscription_plan, COUNT(*) FROM profiles GROUP BY role, subscription_status, subscription_plan ORDER BY role, subscription_status;
-- SELECT COUNT(*) as total_profiles FROM profiles;
-- SELECT role, COUNT(*) FROM profiles GROUP BY role;