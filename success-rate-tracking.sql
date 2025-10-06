-- Create success_votes table
CREATE TABLE IF NOT EXISTS public.success_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('success', 'failure')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure one vote per user per prompt
    UNIQUE(user_id, prompt_id)
);

-- Add RLS policies
ALTER TABLE public.success_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all success votes" ON public.success_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON public.success_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.success_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.success_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_success_votes_prompt_id ON public.success_votes(prompt_id);
CREATE INDEX idx_success_votes_user_id ON public.success_votes(user_id);
CREATE INDEX idx_success_votes_vote_type ON public.success_votes(vote_type);

-- Add success stats to prompts table
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS success_votes_count INTEGER DEFAULT 0;
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS failure_votes_count INTEGER DEFAULT 0;
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0;

-- Function to update success stats
CREATE OR REPLACE FUNCTION update_prompt_success_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.prompts
    SET
        success_votes_count = (
            SELECT COUNT(*) FROM public.success_votes
            WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
            AND vote_type = 'success'
        ),
        failure_votes_count = (
            SELECT COUNT(*) FROM public.success_votes
            WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
            AND vote_type = 'failure'
        )
    WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);

    -- Update success rate
    UPDATE public.prompts
    SET success_rate = CASE
        WHEN (success_votes_count + failure_votes_count) > 0
        THEN ROUND((success_votes_count::decimal / (success_votes_count + failure_votes_count)) * 100, 2)
        ELSE 0
    END
    WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_success_stats ON public.success_votes;
CREATE TRIGGER trigger_update_success_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.success_votes
    FOR EACH ROW EXECUTE FUNCTION update_prompt_success_stats();