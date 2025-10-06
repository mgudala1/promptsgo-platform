-- Create prompt_versions table for version history
CREATE TABLE IF NOT EXISTS public.prompt_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type TEXT,
    category TEXT,
    tags TEXT[],
    model_compatibility TEXT[],
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure version numbers are unique per prompt
    UNIQUE(prompt_id, version_number)
);

-- Create prompt_forks table for forking functionality
CREATE TABLE IF NOT EXISTS public.prompt_forks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    forked_prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    forked_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fork_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure one fork per user per original prompt
    UNIQUE(original_prompt_id, forked_by)
);

-- Add RLS policies for prompt_versions
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of public prompts" ON public.prompt_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_versions.prompt_id
            AND prompts.visibility = 'public'
        )
    );

CREATE POLICY "Users can create versions of their own prompts" ON public.prompt_versions
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Add RLS policies for prompt_forks
ALTER TABLE public.prompt_forks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all forks" ON public.prompt_forks
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own forks" ON public.prompt_forks
    FOR INSERT WITH CHECK (auth.uid() = forked_by);

-- Add indexes for performance
CREATE INDEX idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_created_by ON public.prompt_versions(created_by);
CREATE INDEX idx_prompt_forks_original_prompt_id ON public.prompt_forks(original_prompt_id);
CREATE INDEX idx_prompt_forks_forked_by ON public.prompt_forks(forked_by);

-- Function to create a new version when prompt is updated
CREATE OR REPLACE FUNCTION create_prompt_version()
RETURNS TRIGGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    -- Only create version if content actually changed
    IF OLD.content != NEW.content OR OLD.title != NEW.title OR OLD.description != NEW.description THEN
        -- Get next version number
        SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
        FROM public.prompt_versions
        WHERE prompt_id = NEW.id;

        -- Insert new version
        INSERT INTO public.prompt_versions (
            prompt_id,
            version_number,
            title,
            description,
            content,
            type,
            category,
            tags,
            model_compatibility,
            created_by
        ) VALUES (
            NEW.id,
            next_version,
            OLD.title,
            OLD.description,
            OLD.content,
            OLD.type,
            OLD.category,
            OLD.tags,
            OLD.model_compatibility,
            NEW.user_id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic versioning
DROP TRIGGER IF EXISTS trigger_create_prompt_version ON public.prompts;
CREATE TRIGGER trigger_create_prompt_version
    AFTER UPDATE ON public.prompts
    FOR EACH ROW EXECUTE FUNCTION create_prompt_version();

-- Function to handle forking
CREATE OR REPLACE FUNCTION fork_prompt(
    original_prompt_id UUID,
    new_title TEXT,
    new_description TEXT,
    forked_by UUID
) RETURNS UUID AS $$
DECLARE
    new_prompt_id UUID;
    original_prompt RECORD;
BEGIN
    -- Get original prompt data
    SELECT * INTO original_prompt
    FROM public.prompts
    WHERE id = original_prompt_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Original prompt not found';
    END IF;

    -- Create new prompt (fork)
    INSERT INTO public.prompts (
        title,
        description,
        content,
        type,
        category,
        tags,
        model_compatibility,
        user_id,
        visibility,
        parent_prompt_id
    ) VALUES (
        new_title,
        new_description,
        original_prompt.content,
        original_prompt.type,
        original_prompt.category,
        original_prompt.tags,
        original_prompt.model_compatibility,
        forked_by,
        'public',
        original_prompt_id
    ) RETURNING id INTO new_prompt_id;

    -- Record the fork relationship
    INSERT INTO public.prompt_forks (
        original_prompt_id,
        forked_prompt_id,
        forked_by
    ) VALUES (
        original_prompt_id,
        new_prompt_id,
        forked_by
    );

    -- Increment fork count on original prompt
    UPDATE public.prompts
    SET fork_count = fork_count + 1
    WHERE id = original_prompt_id;

    RETURN new_prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;