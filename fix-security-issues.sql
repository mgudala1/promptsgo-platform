-- Fix Supabase Security Issues
-- Run these commands individually in Supabase SQL Editor

-- 1. Enable RLS on prompt_images table
ALTER TABLE prompt_images ENABLE ROW LEVEL SECURITY;

-- 2. Fix function security by adding SET search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Fix increment_prompt_view function
CREATE OR REPLACE FUNCTION increment_prompt_view(prompt_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prompts SET view_count = view_count + 1 WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Add missing counter functions with security
CREATE OR REPLACE FUNCTION increment_hearts(prompt_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prompts SET hearts = hearts + 1 WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION decrement_hearts(prompt_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prompts SET hearts = GREATEST(0, hearts - 1) WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION increment_saves(prompt_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prompts SET save_count = save_count + 1 WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION decrement_saves(prompt_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prompts SET save_count = GREATEST(0, save_count - 1) WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;