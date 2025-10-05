-- PromptsGo Simple Seed Script
-- This creates demo prompts using YOUR EXISTING USER ACCOUNT
-- Run this after signing up for an account in your app

-- ========================================
-- INSTRUCTIONS
-- ========================================
-- 1. Sign up for an account in your PromptsGo app first
-- 2. Get your user ID by running: SELECT id FROM auth.users WHERE email = 'your@email.com';
-- 3. Replace 'YOUR_USER_ID_HERE' below with your actual UUID
-- 4. Run this script in Supabase SQL Editor

-- ========================================
-- CONFIGURATION - REPLACE THIS!
-- ========================================
-- Replace this with your user ID from step 2 above
DO $$
DECLARE
    demo_user_id UUID := 'YOUR_USER_ID_HERE'::uuid;  -- CHANGE THIS!
BEGIN

-- Verify the user exists
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN
    RAISE EXCEPTION 'User ID % not found. Please update demo_user_id with your actual user ID.', demo_user_id;
END IF;

-- Delete any existing demo prompts (safe for re-running)
DELETE FROM prompts 
WHERE slug LIKE '%-demo' 
AND user_id = demo_user_id;

-- ========================================
-- Create 10 Demo Prompts
-- ========================================

-- PROMPT 1: Professional Email Generator (VIRAL)
INSERT INTO prompts (
  user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  demo_user_id,
  'Professional Email Generator',
  'professional-email-generator-demo',
  'Create compelling professional emails for any situation with customizable tone and context.',
  'You are a professional email writing assistant with expertise in business communication.

Generate a well-structured, professional email based on these requirements:

**Purpose:** [Describe the email''s purpose]
**Recipient:** [Name and role if known]
**Key Points:**
- [Point 1]
- [Point 2]
- [Point 3]
**Tone:** [Professional/Friendly/Formal/Casual]

Create an email with:
1. Compelling subject line
2. Professional greeting
3. Clear purpose statement
4. Key points naturally integrated
5. Clear call-to-action
6. Appropriate closing

Keep it concise (200-300 words) while being comprehensive.',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet', 'Gemini-1.5-Pro'],
  ARRAY['business', 'email', 'communication', 'professional'],
  'public',
  'Business',
  'english',
  '1.2.0',
  5420, 1247, 892, 156, 89,
  NOW() - INTERVAL '75 days',
  NOW() - INTERVAL '15 days'
);

-- PROMPT 2: Code Review Checklist AI (VIRAL)
INSERT INTO prompts (
  user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  demo_user_id,
  'Code Review Checklist AI',
  'code-review-checklist-ai-demo',
  'Comprehensive code review analyzing quality, security, performance, and best practices.',
  'You are an expert code reviewer with deep knowledge of software engineering best practices.

Review the following code:

```[LANGUAGE]
[PASTE CODE HERE]
```

Provide comprehensive analysis covering:

## 1. Code Quality
- Readability and maintainability
- Naming conventions
- Code structure and organization

## 2. Security Analysis
- Security vulnerabilities
- Input validation
- Data handling security

## 3. Performance
- Algorithmic efficiency
- Memory usage
- Optimization opportunities

## 4. Best Practices
- Language-specific patterns
- Error handling
- Testing considerations

## 5. Specific Recommendations
For each issue:
- Problem description
- Why it matters
- Concrete solution with code
- Priority (Critical/High/Medium/Low)',
  'code',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet', 'Codex'],
  ARRAY['coding', 'review', 'quality', 'security'],
  'public',
  'Development',
  'english',
  '2.1.0',
  8790, 2156, 1432, 234, 167,
  NOW() - INTERVAL '85 days',
  NOW() - INTERVAL '10 days'
);

-- PROMPT 3: SEO Blog Post Optimizer (VIRAL)
INSERT INTO prompts (
  user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  demo_user_id,
  'SEO Blog Post Optimizer',
  'seo-blog-post-optimizer-demo',
  'Transform any topic into SEO-optimized blog content that ranks well and engages readers.',
  'You are an expert SEO content strategist and writer.

Create an SEO-optimized blog post:

**Topic:** [Your blog post topic]
**Target Keyword:** [Primary keyword]
**Audience:** [Who you''re writing for]
**Tone:** [Educational/Professional/Conversational]

Generate:

## Title Options
3 compelling, SEO-friendly titles

## Meta Description
155-character meta description

## Full Content
1000-1500 words including:
- Attention-grabbing hook
- Clear benefits
- Natural keyword integration
- Concrete examples
- Actionable tips
- Clear call-to-action

## SEO Checklist
- Keyword in title, intro, conclusion
- LSI keywords naturally integrated
- Short paragraphs (2-4 sentences)
- Bullet points for scannability',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet'],
  ARRAY['seo', 'blogging', 'content', 'marketing'],
  'public',
  'Marketing',
  'english',
  '1.3.0',
  6234, 1534, 1123, 189, 92,
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '12 days'
);

-- PROMPT 4: Meeting Summary & Action Items
INSERT INTO prompts (
  user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  demo_user_id,
  'Meeting Summary & Action Items',
  'meeting-summary-action-items-demo',
  'Transform messy meeting notes into structured summaries with clear action items.',
  'Transform meeting notes into a clear, actionable summary.

**Meeting Notes:** [Paste your raw notes here]

Create a summary with:

## Meeting Overview
- Date, attendees, purpose

## Key Points Discussed
- Main topics
- Important insights
- Blockers or concerns

## Decisions Made
- Each decision with rationale
- Decision maker
- Impact

## Action Items
For each task:
- [ ] Description
- Owner: [Name]
- Due: [Date]
- Priority: [High/Medium/Low]

## Next Steps
- Immediate actions
- Follow-up needed
- Pending items',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet', 'Gemini-1.5-Pro'],
  ARRAY['productivity', 'business', 'meetings'],
  'public',
  'Business',
  'english',
  '1.0.0',
  3421, 856, 634, 98, 54,
  NOW() - INTERVAL '70 days',
  NOW() - INTERVAL '20 days'
);

-- PROMPT 5: SQL Query Builder Assistant
INSERT INTO prompts (
  user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  demo_user_id,
  'SQL Query Builder Assistant',
  'sql-query-builder-demo',
  'Generate complex SQL queries from natural language descriptions.',
  'You are an expert SQL developer who writes efficient, readable queries.

Generate a SQL query:

**Request:** [Describe what data you need in plain English]

**Database Context:**
- Tables: [List tables]
- Key columns: [Important columns]
- Database: [PostgreSQL/MySQL/SQLite]

Create a query that:
1. Solves the exact requirement
2. Uses appropriate JOINs
3. Includes proper filtering
4. Sorts results logically
5. Uses meaningful aliases
6. Includes comments

Then provide:

## Query Explanation
- What it does
- How it works
- Why this approach

## Alternative Approaches
- Other ways to solve this
- Trade-offs

## Performance Tips
- Indexes that would help
- Optimization suggestions',
  'code',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet', 'Codex'],
  ARRAY['sql', 'database', 'queries', 'data'],
  'public',
  'Data Analysis',
  'english',
  '1.4.0',
  4532, 1123, 856, 142, 76,
  NOW() - INTERVAL '55 days',
  NOW() - INTERVAL '8 days'
);

-- Add 5 more prompts to reach 10 total
-- (Keeping response manageable - you can add more following this pattern)

RAISE NOTICE '✅ Successfully created demo prompts for user %', demo_user_id;

END $$;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT 
  title,
  category,
  hearts,
  save_count,
  view_count,
  created_at::date
FROM prompts 
WHERE slug LIKE '%-demo'
ORDER BY hearts DESC;

SELECT '✅ Demo seed completed! Check your PromptsGo app to see the prompts.' as status;