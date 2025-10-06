-- Advanced Organization and Collaboration Features Schema

-- Add folder_id to saves table to link prompts to user folders
ALTER TABLE saves ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES collections(id);

-- Create prompt_versions table for version history
DROP TABLE IF EXISTS prompt_versions CASCADE;
CREATE TABLE prompt_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    type prompt_type NOT NULL,
    model_compatibility TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    category TEXT NOT NULL,
    language TEXT DEFAULT 'english',
    template TEXT,
    changed_by UUID REFERENCES profiles(id) NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prompt_shares table for granular sharing permissions
DROP TABLE IF EXISTS prompt_shares CASCADE;
CREATE TABLE prompt_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    permission_level TEXT CHECK (permission_level IN ('view', 'comment', 'edit')) NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prompt_id, shared_with)
);

-- Create prompt_audit_log table for compliance tracking
DROP TABLE IF EXISTS prompt_audit_log CASCADE;
CREATE TABLE prompt_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT CHECK (action IN ('created', 'updated', 'deleted', 'shared', 'viewed', 'commented', 'hearted', 'saved', 'forked')) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_favorites table (distinct from saves)
DROP TABLE IF EXISTS user_favorites CASCADE;
CREATE TABLE user_favorites (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, prompt_id)
);

-- Create user_recents table for tracking recently accessed prompts
DROP TABLE IF EXISTS user_recents CASCADE;
CREATE TABLE user_recents (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, prompt_id)
);

-- Create collaborative_sessions table for real-time editing
DROP TABLE IF EXISTS collaborative_sessions CASCADE;
CREATE TABLE collaborative_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    permissions TEXT CHECK (permissions IN ('view', 'comment', 'edit')) NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prompt_comments table (enhanced from basic comments)
DROP TABLE IF EXISTS prompt_comments CASCADE;
CREATE TABLE prompt_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES prompt_comments(id),
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    hearts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prompt_comment_replies table for threaded discussions
DROP TABLE IF EXISTS prompt_comment_replies CASCADE;
CREATE TABLE prompt_comment_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES prompt_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    hearts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prompt_sample_outputs table for preview functionality
DROP TABLE IF EXISTS prompt_sample_outputs CASCADE;
CREATE TABLE prompt_sample_outputs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    model_used TEXT NOT NULL,
    input_parameters JSONB DEFAULT '{}',
    output_content TEXT NOT NULL,
    generation_time INTEGER, -- in milliseconds
    tokens_used INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_version_number ON prompt_versions(prompt_id, version_number);
CREATE INDEX idx_prompt_shares_prompt_id ON prompt_shares(prompt_id);
CREATE INDEX idx_prompt_shares_shared_with ON prompt_shares(shared_with);
CREATE INDEX idx_prompt_audit_log_prompt_id ON prompt_audit_log(prompt_id);
CREATE INDEX idx_prompt_audit_log_user_id ON prompt_audit_log(user_id);
CREATE INDEX idx_prompt_audit_log_created_at ON prompt_audit_log(created_at DESC);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_recents_user_id ON user_recents(user_id);
CREATE INDEX idx_user_recents_last_accessed ON user_recents(last_accessed DESC);
CREATE INDEX idx_collaborative_sessions_prompt_id ON collaborative_sessions(prompt_id);
CREATE INDEX idx_collaborative_sessions_token ON collaborative_sessions(session_token);
CREATE INDEX idx_prompt_comments_prompt_id ON prompt_comments(prompt_id);
CREATE INDEX idx_prompt_comments_parent_id ON prompt_comments(parent_id);
CREATE INDEX idx_prompt_comment_replies_comment_id ON prompt_comment_replies(comment_id);
CREATE INDEX idx_prompt_sample_outputs_prompt_id ON prompt_sample_outputs(prompt_id);

-- Create updated_at triggers
CREATE TRIGGER update_prompt_comments_updated_at BEFORE UPDATE ON prompt_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompt_comment_replies_updated_at BEFORE UPDATE ON prompt_comment_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recents ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_sample_outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view prompt versions for accessible prompts" ON prompt_versions FOR SELECT USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (visibility = 'public' OR user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM prompt_shares WHERE prompt_id = prompts.id AND shared_with = auth.uid())))
);

CREATE POLICY "Users can manage versions for their prompts" ON prompt_versions FOR ALL USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view shares for prompts they can access" ON prompt_shares FOR SELECT USING (
    shared_by = auth.uid() OR shared_with = auth.uid() OR
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage shares for their prompts" ON prompt_shares FOR ALL USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view audit logs for their prompts" ON prompt_audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recents" ON user_recents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view collaborative sessions for accessible prompts" ON collaborative_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (visibility = 'public' OR user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM prompt_shares WHERE prompt_id = prompts.id AND shared_with = auth.uid())))
);

CREATE POLICY "Users can manage sessions for their prompts" ON collaborative_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view comments on accessible prompts" ON prompt_comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (visibility = 'public' OR user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM prompt_shares WHERE prompt_id = prompts.id AND shared_with = auth.uid())))
);

CREATE POLICY "Users can manage their own comments" ON prompt_comments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view replies on accessible comments" ON prompt_comment_replies FOR SELECT USING (
    EXISTS (SELECT 1 FROM prompt_comments pc JOIN prompts p ON pc.prompt_id = p.id
        WHERE pc.id = comment_id AND (p.visibility = 'public' OR p.user_id = auth.uid() OR
            EXISTS (SELECT 1 FROM prompt_shares WHERE prompt_id = p.id AND shared_with = auth.uid())))
);

CREATE POLICY "Users can manage their own replies" ON prompt_comment_replies FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view sample outputs for accessible prompts" ON prompt_sample_outputs FOR SELECT USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND (visibility = 'public' OR user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM prompt_shares WHERE prompt_id = prompts.id AND shared_with = auth.uid())))
);

CREATE POLICY "Users can manage sample outputs for their prompts" ON prompt_sample_outputs FOR ALL USING (
    EXISTS (SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid())
);

-- Functions for advanced features
CREATE OR REPLACE FUNCTION create_prompt_version(
    prompt_id_param UUID,
    changed_by_param UUID,
    change_summary_param TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
    current_version INTEGER;
    prompt_record RECORD;
BEGIN
    -- Get current version number
    SELECT COALESCE(MAX(version_number), 0) INTO current_version
    FROM prompt_versions WHERE prompt_id = prompt_id_param;

    -- Get current prompt data
    SELECT * INTO prompt_record FROM prompts WHERE id = prompt_id_param;

    -- Insert new version
    INSERT INTO prompt_versions (
        prompt_id, version_number, title, description, content, type,
        model_compatibility, tags, category, language, template, changed_by, change_summary
    ) VALUES (
        prompt_id_param, current_version + 1, prompt_record.title, prompt_record.description,
        prompt_record.content, prompt_record.type, prompt_record.model_compatibility,
        prompt_record.tags, prompt_record.category, prompt_record.language,
        prompt_record.template, changed_by_param, change_summary_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION log_prompt_action(
    prompt_id_param UUID,
    user_id_param UUID,
    action_param TEXT,
    details_param JSONB DEFAULT '{}',
    ip_address_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO prompt_audit_log (
        prompt_id, user_id, action, details, ip_address, user_agent
    ) VALUES (
        prompt_id_param, user_id_param, action_param, details_param, ip_address_param, user_agent_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_user_recents(
    user_id_param UUID,
    prompt_id_param UUID
) RETURNS void AS $$
BEGIN
    INSERT INTO user_recents (user_id, prompt_id, last_accessed, access_count)
    VALUES (user_id_param, prompt_id_param, NOW(), 1)
    ON CONFLICT (user_id, prompt_id)
    DO UPDATE SET
        last_accessed = NOW(),
        access_count = user_recents.access_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
