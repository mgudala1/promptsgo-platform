-- Migration: Add caption column to prompt_images table
-- Run this in your Supabase SQL editor

ALTER TABLE prompt_images ADD COLUMN IF NOT EXISTS caption TEXT;

-- Add comment for documentation
COMMENT ON COLUMN prompt_images.caption IS 'Optional caption or description for the image';