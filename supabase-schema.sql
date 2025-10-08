-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (safe to run multiple times)
DO $$ BEGIN
    CREATE TYPE prompt_type AS ENUM ('text', 'image', 'code', 'agent', 'chain');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prompt_visibility AS ENUM ('public', 'private', 'unlisted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('free', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prompt_source AS ENUM ('original', 'pack', 'customized');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE affiliate_tier AS ENUM ('bronze', 'silver', 'gold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE affiliate_status AS ENUM ('pending', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('general', 'pro', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends Supabase auth.users)
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    website TEXT,
    github TEXT,
    twitter TEXT,
    subscription_plan subscription_plan DEFAULT 'free',
    role user_role DEFAULT 'general',
    subscription_status subscription_status DEFAULT 'active',
    invites_remaining INTEGER DEFAULT 0,
    is_affiliate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompts table
DROP TABLE IF EXISTS prompts CASCADE;
CREATE TABLE prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    type prompt_type NOT NULL,
    model_compatibility TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    visibility prompt_visibility DEFAULT 'public',
    category TEXT NOT NULL,
    language TEXT DEFAULT 'english',
    version TEXT DEFAULT '1.0.0',
    parent_id UUID REFERENCES prompts(id),
    view_count INTEGER DEFAULT 0,
    hearts INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt images table
DROP TABLE IF EXISTS prompt_images CASCADE;
CREATE TABLE prompt_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    caption TEXT, -- Optional caption for the image
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES comments(id),
    content TEXT NOT NULL,
    hearts INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hearts table
DROP TABLE IF EXISTS hearts CASCADE;
CREATE TABLE hearts (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, prompt_id)
);

-- Saves table
DROP TABLE IF EXISTS saves CASCADE;
CREATE TABLE saves (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    collection_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, prompt_id)
);

-- Follows table
DROP TABLE IF EXISTS follows CASCADE;
CREATE TABLE follows (
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Collections table
DROP TABLE IF EXISTS collections CASCADE;
CREATE TABLE collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    visibility prompt_visibility DEFAULT 'private',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios table
DROP TABLE IF EXISTS portfolios CASCADE;
CREATE TABLE portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    is_password_protected BOOLEAN DEFAULT FALSE,
    password TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    client_access_count INTEGER DEFAULT 0,
    show_pack_attribution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio prompts table
DROP TABLE IF EXISTS portfolio_prompts CASCADE;
CREATE TABLE portfolio_prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    source prompt_source NOT NULL,
    pack_id UUID,
    pack_name TEXT,
    customized BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt packs table
DROP TABLE IF EXISTS prompt_packs CASCADE;
CREATE TABLE prompt_packs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User pack library table
DROP TABLE IF EXISTS user_pack_library CASCADE;
CREATE TABLE user_pack_library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES prompt_packs(id) ON DELETE CASCADE NOT NULL,
    pack_name TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
DROP TABLE IF EXISTS subscriptions CASCADE;
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    plan subscription_plan DEFAULT 'free',
    status subscription_status DEFAULT 'active',
    stripe_subscription_id TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliates table
DROP TABLE IF EXISTS affiliates CASCADE;
CREATE TABLE affiliates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    total_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    pending_earnings DECIMAL(10,2) DEFAULT 0,
    tier affiliate_tier DEFAULT 'bronze',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_commission_at TIMESTAMPTZ,
    UNIQUE(user_id)
);

-- Affiliate referrals table
DROP TABLE IF EXISTS affiliate_referrals CASCADE;
CREATE TABLE affiliate_referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
    referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    commission DECIMAL(10,2) NOT NULL,
    status affiliate_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Create enum for invite status (before table creation)
DO $$ BEGIN
    CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked', 'waitlist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Invitees table for invite-only access
DROP TABLE IF EXISTS invitees CASCADE;
CREATE TABLE invitees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE,  -- Made nullable for reusable invite codes
    invite_code TEXT UNIQUE,
    invited_by UUID REFERENCES profiles(id),
    status invite_status DEFAULT 'pending',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_type ON prompts(type);
CREATE INDEX idx_prompts_visibility ON prompts(visibility);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_slug ON prompts(slug);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);

CREATE INDEX idx_comments_prompt_id ON comments(prompt_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

CREATE INDEX idx_prompt_images_prompt_id ON prompt_images(prompt_id);

CREATE INDEX idx_hearts_prompt_id ON hearts(prompt_id);
CREATE INDEX idx_saves_prompt_id ON saves(prompt_id);
CREATE INDEX idx_saves_collection_id ON saves(collection_id);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

CREATE INDEX idx_collections_user_id ON collections(user_id);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_subdomain ON portfolios(subdomain);

CREATE INDEX idx_portfolio_prompts_portfolio_id ON portfolio_prompts(portfolio_id);
CREATE INDEX idx_portfolio_prompts_prompt_id ON portfolio_prompts(prompt_id);

CREATE INDEX idx_prompt_packs_category ON prompt_packs(category);
CREATE INDEX idx_prompt_packs_created_by ON prompt_packs(created_by);

CREATE INDEX idx_user_pack_library_user_id ON user_pack_library(user_id);
CREATE INDEX idx_user_pack_library_pack_id ON user_pack_library(pack_id);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON affiliates(referral_code);

CREATE INDEX idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);

CREATE INDEX idx_invitees_email ON invitees(email);
CREATE INDEX idx_invitees_invite_code ON invitees(invite_code);
CREATE INDEX idx_invitees_status ON invitees(status);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompt_packs_updated_at BEFORE UPDATE ON prompt_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment prompt view count
CREATE OR REPLACE FUNCTION increment_prompt_view(prompt_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prompts SET view_count = view_count + 1 WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Functions for heart/save counters
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

-- Function to handle user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup (safe to run multiple times)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pack_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (safe to run multiple times)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Trigger can create profiles" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Allow the trigger to create profiles (SECURITY DEFINER bypasses this, but being explicit)
CREATE POLICY "Trigger can create profiles" ON profiles FOR INSERT WITH CHECK (true);

-- RLS Policies for prompts (safe to run multiple times)
DROP POLICY IF EXISTS "Public prompts are viewable by everyone" ON prompts;
DROP POLICY IF EXISTS "Users can view their own private prompts" ON prompts;
DROP POLICY IF EXISTS "Users can insert their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON prompts;

CREATE POLICY "Public prompts are viewable by everyone" ON prompts FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view their own private prompts" ON prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prompts" ON prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prompts" ON prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prompts" ON prompts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for prompt_images (safe to run multiple times)
DROP POLICY IF EXISTS "Prompt images are viewable with their prompts" ON prompt_images;
DROP POLICY IF EXISTS "Users can manage images for their prompts" ON prompt_images;

CREATE POLICY "Prompt images are viewable with their prompts" ON prompt_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (visibility = 'public' OR user_id = auth.uid()))
);
CREATE POLICY "Users can manage images for their prompts" ON prompt_images FOR ALL USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
);

-- RLS Policies for comments (safe to run multiple times)
DROP POLICY IF EXISTS "Comments are viewable with their prompts" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

CREATE POLICY "Comments are viewable with their prompts" ON comments FOR SELECT USING (
    NOT is_deleted AND EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (visibility = 'public' OR user_id = auth.uid()))
);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for hearts (safe to run multiple times)
DROP POLICY IF EXISTS "Hearts are viewable by everyone" ON hearts;
DROP POLICY IF EXISTS "Users can manage their own hearts" ON hearts;

CREATE POLICY "Hearts are viewable by everyone" ON hearts FOR SELECT USING (true);
CREATE POLICY "Users can manage their own hearts" ON hearts FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for saves (safe to run multiple times)
DROP POLICY IF EXISTS "Saves are viewable by the user" ON saves;
DROP POLICY IF EXISTS "Users can manage their own saves" ON saves;

CREATE POLICY "Saves are viewable by the user" ON saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own saves" ON saves FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for follows (safe to run multiple times)
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Users can manage their own follows" ON follows;

CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON follows FOR ALL USING (auth.uid() = follower_id);

-- RLS Policies for collections (safe to run multiple times)
DROP POLICY IF EXISTS "Collections are viewable by owner or public" ON collections;
DROP POLICY IF EXISTS "Users can manage their own collections" ON collections;

CREATE POLICY "Collections are viewable by owner or public" ON collections FOR SELECT USING (
    user_id = auth.uid() OR (visibility = 'public' AND user_id != auth.uid())
);
CREATE POLICY "Users can manage their own collections" ON collections FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for portfolios (safe to run multiple times)
DROP POLICY IF EXISTS "Published portfolios are viewable by everyone" ON portfolios;
DROP POLICY IF EXISTS "Users can view their own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can manage their own portfolios" ON portfolios;

CREATE POLICY "Published portfolios are viewable by everyone" ON portfolios FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view their own portfolios" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own portfolios" ON portfolios FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for portfolio_prompts (safe to run multiple times)
DROP POLICY IF EXISTS "Portfolio prompts are viewable with portfolio" ON portfolio_prompts;
DROP POLICY IF EXISTS "Users can manage prompts in their portfolios" ON portfolio_prompts;

CREATE POLICY "Portfolio prompts are viewable with portfolio" ON portfolio_prompts FOR SELECT USING (
    EXISTS (SELECT 1 FROM portfolios WHERE id = portfolio_id AND (is_published = true OR user_id = auth.uid()))
);
CREATE POLICY "Users can manage prompts in their portfolios" ON portfolio_prompts FOR ALL USING (
    EXISTS (SELECT 1 FROM portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);

-- RLS Policies for prompt_packs (safe to run multiple times)
DROP POLICY IF EXISTS "Prompt packs are viewable by everyone" ON prompt_packs;
DROP POLICY IF EXISTS "Only admins can manage official packs" ON prompt_packs;

CREATE POLICY "Prompt packs are viewable by everyone" ON prompt_packs FOR SELECT USING (true);
CREATE POLICY "Only admins can manage official packs" ON prompt_packs FOR ALL USING (is_official = false OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for user_pack_library (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view their own pack library" ON user_pack_library;
DROP POLICY IF EXISTS "Users can manage their own pack library" ON user_pack_library;

CREATE POLICY "Users can view their own pack library" ON user_pack_library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own pack library" ON user_pack_library FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for subscriptions (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for affiliates (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
DROP POLICY IF EXISTS "Users can manage their own affiliate data" ON affiliates;

CREATE POLICY "Users can view their own affiliate data" ON affiliates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own affiliate data" ON affiliates FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for affiliate_referrals (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view their own referral data" ON affiliate_referrals;
DROP POLICY IF EXISTS "Affiliates can view their referral data" ON affiliate_referrals;

CREATE POLICY "Users can view their own referral data" ON affiliate_referrals FOR SELECT USING (
    auth.uid() = referred_user_id OR
    EXISTS (SELECT 1 FROM affiliates WHERE id = affiliate_id AND user_id = auth.uid())
);
CREATE POLICY "Affiliates can manage their referral data" ON affiliate_referrals FOR ALL USING (
    EXISTS (SELECT 1 FROM affiliates WHERE id = affiliate_id AND user_id = auth.uid())
);

-- Prompt templates table
DROP TABLE IF EXISTS prompt_templates CASCADE;
CREATE TABLE prompt_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for prompt templates
CREATE INDEX idx_prompt_templates_prompt_id ON prompt_templates(prompt_id);

-- Create trigger for updated_at
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for prompt templates
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_templates (safe to run multiple times)
DROP POLICY IF EXISTS "Prompt templates are viewable with their prompts" ON prompt_templates;
DROP POLICY IF EXISTS "Users can manage templates for their prompts" ON prompt_templates;

CREATE POLICY "Prompt templates are viewable with their prompts" ON prompt_templates FOR SELECT USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (visibility = 'public' OR user_id = auth.uid()))
);
CREATE POLICY "Users can manage templates for their prompts" ON prompt_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
);

-- Add template column to prompts table (safe to run multiple times)
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS template TEXT;

-- Create storage bucket for prompt images (safe to run multiple times)
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-images', 'prompt-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (safe to run multiple times)
DROP POLICY IF EXISTS "Prompt images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload prompt images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their prompt images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their prompt images" ON storage.objects;

CREATE POLICY "Prompt images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'prompt-images');
CREATE POLICY "Users can upload prompt images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'prompt-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update their prompt images" ON storage.objects FOR UPDATE USING (
    bucket_id = 'prompt-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can delete their prompt images" ON storage.objects FOR DELETE USING (
    bucket_id = 'prompt-images' AND auth.role() = 'authenticated'
);

-- Enable RLS for invitees
ALTER TABLE invitees ENABLE ROW LEVEL SECURITY;
-- Create a function to validate invite codes (bypasses RLS)
CREATE OR REPLACE FUNCTION validate_invite_code(invite_code_param TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
    invite_record RECORD;
BEGIN
    -- Check format first
    IF invite_code_param IS NULL OR length(invite_code_param) != 8 OR NOT (invite_code_param ~ '^[A-Z0-9]+$') THEN
        RETURN json_build_object('valid', false, 'error', 'Invalid format');
    END IF;

    -- Find the invite
    SELECT * INTO invite_record
    FROM invitees
    WHERE invite_code = invite_code_param
    AND status IN ('pending', 'accepted')
    AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'error', 'Invite not found or expired');
    END IF;

    -- Return success
    RETURN json_build_object(
        'valid', true,
        'userId', invite_record.invited_by,
        'email', invite_record.email,
        'isReusable', (invite_record.email IS NULL)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a function to check if email has valid invite for login (bypasses RLS)
CREATE OR REPLACE FUNCTION check_email_invite(email_param TEXT)
RETURNS JSON AS $$
DECLARE
    invite_record RECORD;
BEGIN
    -- Find valid invite for this email
    SELECT * INTO invite_record
    FROM invitees
    WHERE email = email_param
    AND status IN ('pending', 'accepted')
    AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'error', 'No valid invite found for this email');
    END IF;

    -- Return success
    RETURN json_build_object(
        'valid', true,
        'invite_id', invite_record.id,
        'status', invite_record.status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS Policies for invitees (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view their own invites" ON invitees;
DROP POLICY IF EXISTS "Admins can manage all invites" ON invitees;
DROP POLICY IF EXISTS "Anyone can join waitlist" ON invitees;
DROP POLICY IF EXISTS "Users can update their own invites" ON invitees;

-- Allow authenticated users to view their own invites
CREATE POLICY "Users can view their own invites" ON invitees FOR SELECT USING (
    auth.uid() = invited_by OR (email IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Allow anyone to join waitlist
CREATE POLICY "Anyone can join waitlist" ON invitees FOR INSERT WITH CHECK (
    status = 'waitlist'
);

-- Allow users to update their own invites
CREATE POLICY "Users can update their own invites" ON invitees FOR UPDATE USING (
    auth.uid() = invited_by OR (email IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

CREATE POLICY "Users can view their own invites" ON invitees FOR SELECT USING (
    auth.uid() = invited_by OR (email IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);
CREATE POLICY "Admins can manage all invites" ON invitees FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can join waitlist" ON invitees FOR INSERT WITH CHECK (
    status = 'waitlist'
);
CREATE POLICY "Users can update their own invites" ON invitees FOR UPDATE USING (
    auth.uid() = invited_by OR (email IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);