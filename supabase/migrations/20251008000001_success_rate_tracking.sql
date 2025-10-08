-- Module 1: Success Rate Tracking System
-- Migration: Add success voting functionality

-- Create success_votes table
CREATE TABLE success_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    vote_value INTEGER NOT NULL CHECK (vote_value >= 1 AND vote_value <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prompt_id, user_id)
);

-- Add success rate columns to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS success_rate DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS success_votes_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX idx_success_votes_prompt_id ON success_votes(prompt_id);
CREATE INDEX idx_success_votes_user_id ON success_votes(user_id);
CREATE INDEX idx_prompts_success_rate ON prompts(success_rate DESC);

-- Enable RLS
ALTER TABLE success_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Success votes are viewable by everyone" ON success_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own success votes" ON success_votes FOR ALL USING (auth.uid() = user_id);

-- Function to update success rate when votes change
CREATE OR REPLACE FUNCTION update_prompt_success_rate(prompt_id_param UUID)
RETURNS void AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    vote_count INTEGER;
BEGIN
    -- Calculate average rating and count
    SELECT
        COALESCE(AVG(vote_value), 0)::DECIMAL(3,2),
        COUNT(*)
    INTO avg_rating, vote_count
    FROM success_votes
    WHERE prompt_id = prompt_id_param;

    -- Update the prompts table
    UPDATE prompts
    SET
        success_rate = avg_rating,
        success_votes_count = vote_count
    WHERE id = prompt_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically update success rate
CREATE OR REPLACE FUNCTION trigger_update_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    -- Update success rate for the affected prompt
    IF TG_OP = 'DELETE' THEN
        PERFORM update_prompt_success_rate(OLD.prompt_id);
        RETURN OLD;
    ELSE
        PERFORM update_prompt_success_rate(NEW.prompt_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER update_success_rate_on_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON success_votes
    FOR EACH ROW EXECUTE FUNCTION trigger_update_success_rate();