-- Fix authentication and RLS issues
-- Run this in your Supabase SQL Editor

-- 1. Update RLS policies for profiles to allow trigger-based profile creation
DROP POLICY IF EXISTS "Trigger can create profiles" ON profiles;
CREATE POLICY "Trigger can create profiles" ON profiles FOR INSERT WITH CHECK (true);

-- 2. Ensure the trigger is working (recreate if needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, name, subscription_plan, invites_remaining)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'free',
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Check if there are any orphaned auth users without profiles
-- (Optional: Run this to see if there are users who signed up but don't have profiles)
-- SELECT au.id, au.email, p.id as profile_id
-- FROM auth.users au
-- LEFT JOIN profiles p ON au.id = p.id
-- WHERE p.id IS NULL;