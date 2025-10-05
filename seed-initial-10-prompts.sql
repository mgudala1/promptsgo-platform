-- PromptsGo Initial Content Seeding - 10 Best Prompts
-- Run this in Supabase SQL Editor after your main schema is set up
-- This creates 5 user personas and 10 high-quality, diverse prompts

-- ========================================
-- PART 1: Create 5 User Personas
-- ========================================

-- 1. Sarah Chen - Business Consultant (Pro User)
INSERT INTO profiles (id, username, email, name, bio, subscription_plan, invites_remaining)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'sarahc',
  'sarah.chen.demo@promptsgo.com',
  'Sarah Chen',
  'Management consultant helping businesses scale. 15+ years advising Fortune 500 companies.',
  'pro',
  8
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio;

-- 2. Marcus Rivera - Senior Developer (Pro User)
INSERT INTO profiles (id, username, email, name, bio, github, subscription_plan, invites_remaining)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'marcusdev',
  'marcus.dev.demo@promptsgo.com',
  'Marcus Rivera',
  'Senior engineer passionate about clean code and mentoring. Building better dev tools.',
  'marcusrivera',
  'pro',
  7
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio;

-- 3. Emily Watson - Content Marketer (Pro User)
INSERT INTO profiles (id, username, email, name, bio, twitter, subscription_plan, invites_remaining)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'emilymarketing',
  'emily.w.demo@promptsgo.com',
  'Emily Watson',
  'Building brands through strategic content. SEO specialist. Storyteller who converts.',
  'emily_marketing',
  'pro',
  5
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio;

-- 4. David Park - Data Scientist (Free User)
INSERT INTO profiles (id, username, email, name, bio, subscription_plan, invites_remaining)
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  'datawithdavid',
  'david.park.demo@promptsgo.com',
  'David Park',
  'Turning data into decisions. Leading data science at fintech startup.',
  'free',
  5
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio;

-- 5. Alex Thompson - Creative Writer (Free User)
INSERT INTO profiles (id, username, email, name, bio, website, subscription_plan, invites_remaining)
VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  'alexwrites',
  'alex.writes.demo@promptsgo.com',
  'Alex Thompson',
  'Novelist and screenwriter. Using AI to explore new narrative possibilities.',
  'https://alexwrites.com',
  'free',
  5
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio;

-- ========================================
-- PART 2: Create 10 High-Quality Prompts
-- ========================================

-- PROMPT 1: Professional Email Generator (VIRAL - Sarah Chen)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Professional Email Generator',
  'professional-email-generator',
  'Create compelling professional emails for any situation with customizable tone and context. Perfect for business communication, outreach, and customer service.',
  'You are a professional email writing assistant with expertise in business communication.

Generate a well-structured, professional email based on these requirements:

**Purpose:** [Describe the email''s purpose - e.g., "Follow up after meeting", "Introduce our services"]

**Recipient:** [Name and role if known]

**Key Points:**
- [Point 1]
- [Point 2]
- [Point 3]

**Tone:** [Professional/Friendly/Formal/Casual]

Please create an email with:
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
  5420,
  1247,
  892,
  156,
  89,
  NOW() - INTERVAL '75 days',
  NOW() - INTERVAL '15 days'
);

-- PROMPT 2: Code Review Checklist AI (VIRAL - Marcus Rivera)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Code Review Checklist AI',
  'code-review-checklist-ai',
  'Comprehensive code review analyzing quality, security, performance, and best practices with specific improvement suggestions.',
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
- Documentation quality

## 2. Security Analysis
- Security vulnerabilities
- Input validation
- Authentication/authorization concerns
- Data handling security

## 3. Performance
- Algorithmic efficiency
- Memory usage
- Potential bottlenecks
- Optimization opportunities

## 4. Best Practices
- Language-specific best practices
- Design patterns
- Error handling
- Testing considerations

## 5. Specific Recommendations
For each issue:
- Problem description
- Why it matters
- Concrete solution with code example
- Priority (Critical/High/Medium/Low)

Focus on the most critical issues first.',
  'code',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet', 'Codex'],
  ARRAY['coding', 'review', 'quality', 'security', 'best-practices'],
  'public',
  'Development',
  'english',
  '2.1.0',
  8790,
  2156,
  1432,
  234,
  167,
  NOW() - INTERVAL '85 days',
  NOW() - INTERVAL '10 days'
);

-- PROMPT 3: SEO Blog Post Optimizer (VIRAL - Emily Watson)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333'::uuid,
  'SEO Blog Post Optimizer',
  'seo-blog-post-optimizer',
  'Transform any topic into SEO-optimized blog content that ranks well and engages readers. Perfect for content marketers.',
  'You are an expert SEO content strategist and writer.

Create an SEO-optimized blog post with this information:

**Topic:** [Your blog post topic]
**Target Keyword:** [Primary keyword to rank for]
**Audience:** [Who you''re writing for]
**Tone:** [Educational/Professional/Conversational]

Generate a complete blog post with:

## Title Options
Provide 3 compelling, SEO-friendly titles

## Meta Description
Write a 155-character meta description

## Outline
Create a comprehensive outline with H2 and H3 headers

## Full Content
Write engaging, SEO-optimized content (1000-1500 words) that includes:

- **Hook:** Attention-grabbing introduction
- **Value:** Clear benefits for the reader
- **Structure:** Logical flow with subheadings
- **Keywords:** Natural keyword integration (aim for 1-2% density)
- **Examples:** Concrete examples and case studies
- **Data:** Statistics or research when relevant
- **Actionable Tips:** Practical takeaways
- **Internal Links:** Suggest 3-4 related topics to link
- **CTA:** Clear call-to-action at the end

## SEO Optimization Checklist
- Primary keyword in title, first paragraph, and conclusion
- LSI keywords naturally integrated
- Readability score target: 60-70
- Paragraph length: 2-4 sentences
- Use of lists and bullet points for scannability',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet'],
  ARRAY['seo', 'blogging', 'content', 'marketing'],
  'public',
  'Marketing',
  'english',
  '1.3.0',
  6234,
  1534,
  1123,
  189,
  92,
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '12 days'
);

-- PROMPT 4: Meeting Summary & Action Items (Sarah Chen)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Meeting Summary & Action Items',
  'meeting-summary-action-items',
  'Transform messy meeting notes into structured summaries with clear action items and next steps.',
  'Transform meeting notes into a clear, actionable summary.

**Meeting Notes:**
[Paste your raw notes here]

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
- Pending items

Keep it clear and immediately actionable.',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet', 'Gemini-1.5-Pro'],
  ARRAY['productivity', 'business', 'meetings', 'project-management'],
  'public',
  'Business',
  'english',
  '1.0.0',
  3421,
  856,
  634,
  98,
  54,
  NOW() - INTERVAL '70 days',
  NOW() - INTERVAL '20 days'
);

-- PROMPT 5: SQL Query Generator (David Park)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444'::uuid,
  'SQL Query Builder Assistant',
  'sql-query-builder-assistant',
  'Generate complex SQL queries from natural language descriptions. Supports JOINs, subqueries, CTEs, and advanced operations.',
  'You are an expert SQL developer who writes efficient, readable queries.

Generate a SQL query based on this request:

**Request:** [Describe what data you need in plain English]

**Database Context:**
- Tables available: [List tables]
- Key columns: [Important columns]
- Database: [PostgreSQL/MySQL/SQLite/etc.]

Create a SQL query that:

1. **Solves the exact requirement**
2. **Uses appropriate JOINs** if multiple tables needed
3. **Includes proper filtering** (WHERE clauses)
4. **Sorts results** logically
5. **Limits output** if needed
6. **Uses meaningful aliases**
7. **Includes comments** explaining complex parts

Then provide:

## Query Explanation
- What the query does
- How it works step-by-step
- Why this approach is optimal

## Alternative Approaches
- Other ways to solve this
- Trade-offs of each approach

## Performance Tips
- Indexes that would help
- Optimization suggestions

Make it production-ready and well-documented.',
  'code',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet', 'Codex'],
  ARRAY['sql', 'database', 'queries', 'data'],
  'public',
  'Data Analysis',
  'english',
  '1.4.0',
  4532,
  1123,
  856,
  142,
  76,
  NOW() - INTERVAL '55 days',
  NOW() - INTERVAL '8 days'
);

-- PROMPT 6: LinkedIn Post Engagement Booster (Emily Watson)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333'::uuid,
  'LinkedIn Post Engagement Booster',
  'linkedin-post-engagement-booster',
  'Create high-engagement LinkedIn posts that get likes, comments, and shares. Perfect for thought leaders and professionals.',
  'You are a LinkedIn content strategist who creates posts that drive engagement.

Create a LinkedIn post about:

**Topic:** [Your topic or message]
**Goal:** [What do you want to achieve - awareness/leads/engagement/thought leadership]
**Your Expertise:** [Your background or credibility on this topic]
**Target Audience:** [Who you''re speaking to]

Create a post that:

## Hook (First Line)
Start with something that stops the scroll:
- Surprising statistic
- Provocative question
- Bold statement
- Personal story opening

## Body (Value Content)
- Share actionable insights
- Tell a relevant story
- Provide specific examples
- Use short paragraphs (1-2 sentences)
- Include line breaks for readability

## Engagement Elements
- Ask a question to prompt comments
- Use relevant emojis sparingly
- Include 3-5 relevant hashtags
- Tag relevant people/companies if appropriate

## Call-to-Action
- Comment prompt
- Share request
- Link to resource (if appropriate)

**Post Length:** 150-250 words optimal for LinkedIn

Format for mobile-first reading with short paragraphs and strategic line breaks.',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet'],
  ARRAY['linkedin', 'professional', 'engagement', 'social-media'],
  'public',
  'Marketing',
  'english',
  '1.1.0',
  3876,
  1089,
  789,
  124,
  67,
  NOW() - INTERVAL '50 days',
  NOW() - INTERVAL '14 days'
);

-- PROMPT 7: Technical Documentation Writer (Marcus Rivera)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Technical Documentation Writer',
  'technical-documentation-writer',
  'Generate clear, comprehensive technical documentation including README files, API docs, and user guides.',
  'You are a technical writer who creates clear documentation for developers and users.

Create documentation for:

**Project/Feature:** [Name]
**Audience:** [Developers/End-users/Both]
**Type:** [README/API Docs/User Guide/Tutorial]

Generate documentation that includes:

## Overview
- What it does (one-sentence summary)
- Key features and capabilities
- Who it''s for

## Getting Started
- Prerequisites
- Installation steps
- Quick start example
- First successful use case

## Core Concepts
- Key terminology
- Architecture overview (if applicable)
- How it works at high level

## Usage Examples
- Common use cases with code
- Real-world scenarios
- Best practices
- Common pitfalls to avoid

## API Reference (if applicable)
- Methods/Endpoints with parameters
- Request/Response examples
- Error codes and handling

## Configuration
- Available options
- Configuration examples
- Environment variables

## Troubleshooting
- Common issues and solutions
- Debug tips
- Where to get help

## Contributing (if open source)
- How to contribute
- Development setup
- Code standards

Make it beginner-friendly while being comprehensive for advanced users.',
  'code',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet'],
  ARRAY['documentation', 'technical', 'api', 'readme'],
  'public',
  'Development',
  'english',
  '1.0.0',
  2987,
  723,
  534,
  89,
  43,
  NOW() - INTERVAL '65 days',
  NOW() - INTERVAL '18 days'
);

-- PROMPT 8: Data Analysis Assistant (David Park)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Data Analysis Assistant',
  'data-analysis-assistant',
  'Analyze datasets and extract meaningful insights. Perfect for business intelligence and data-driven decision making.',
  'You are a data analyst expert who transforms raw data into actionable insights.

Analyze this data and provide insights:

**Dataset:** [Describe your data or paste sample]
**Business Context:** [What area/problem are you analyzing]
**Goals:** [What decisions need to be made]

Provide analysis with:

## Data Overview
- Dataset summary (rows, columns, time period)
- Data quality assessment
- Missing values or anomalies

## Key Findings
- Top 5 most important insights
- Surprising discoveries
- Trends and patterns
- Statistical significance

## Visualizations Recommended
For each insight, suggest:
- Best chart type
- Axes and dimensions
- Filters or segments
- Why this visualization works

## Business Implications
- What these findings mean
- Impact on business/project
- Opportunities identified
- Risks highlighted

## Recommendations
- Specific actions to take
- Priority order
- Expected impact
- Next steps for deeper analysis

## Additional Questions to Explore
- What else should we analyze
- Data gaps to fill
- Follow-up investigations

Present findings in executive-friendly language with technical details available.',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet'],
  ARRAY['data', 'analysis', 'insights', 'business-intelligence'],
  'public',
  'Data Analysis',
  'english',
  '1.2.0',
  2654,
  867,
  623,
  103,
  58,
  NOW() - INTERVAL '52 days',
  NOW() - INTERVAL '9 days'
);

-- PROMPT 9: Customer Support Response Generator (Sarah Chen)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Customer Support Response Generator',
  'customer-support-response-generator',
  'Generate empathetic, helpful customer support responses that resolve issues and maintain positive relationships.',
  'You are an expert customer support specialist who writes helpful, empathetic responses.

Create a customer support response for:

**Customer Issue:** [Describe the problem or question]
**Tone Needed:** [Empathetic/Professional/Friendly/Apologetic]
**Resolution Available:** [Can you fully solve it/Partial solution/Need more info]
**Company Voice:** [Formal/Casual/Technical]

Generate a response that:

## Opening
- Acknowledge their concern immediately
- Show empathy and understanding
- Thank them for reaching out

## Address the Issue
- Directly address their specific concern
- Explain what happened (if applicable)
- Take responsibility if it''s your company''s fault

## Provide Solution
- Clear steps to resolve
- Timeline for resolution
- What you''re doing to help
- Alternative options if applicable

## Prevent Future Issues
- What they can do differently
- What you''ll do to prevent recurrence
- Resources for future reference

## Closing
- Confirm their satisfaction is important
- Invite follow-up questions
- Professional sign-off

**Tone Guidelines:**
- Be genuinely helpful, never defensive
- Use "we" and "our" to show company ownership
- Avoid jargon unless customer used it
- Be specific, not vague
- End positively

Keep response professional but warm (150-250 words).',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet', 'Gemini-1.5-Pro'],
  ARRAY['customer-service', 'support', 'communication', 'business'],
  'public',
  'Business',
  'english',
  '1.0.0',
  2134,
  645,
  478,
  76,
  41,
  NOW() - INTERVAL '48 days',
  NOW() - INTERVAL '16 days'
);

-- PROMPT 10: Creative Story Generator (Alex Thompson)
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555'::uuid,
  'Creative Story Generator',
  'creative-story-generator',
  'Generate engaging stories with rich characters, unexpected plot twists, and immersive world-building. Perfect for writers seeking inspiration.',
  'You are a master storyteller with expertise in crafting compelling narratives.

Create an engaging story with:

**Genre:** [Fantasy/Sci-Fi/Mystery/Romance/Horror/etc.]
**Length:** [Short story/Chapter/Flash fiction]
**Theme:** [Central theme or message]
**Tone:** [Dark/Light/Humorous/Serious]

**Story Requirements:**

## Opening Hook
Start with an intriguing scene that immediately draws readers in

## Character Development
- Create relatable protagonist
- Clear motivations and flaws
- Character arc showing growth

## World Building
- Vivid setting details
- Sensory descriptions
- Authentic atmosphere

## Plot Structure
- Rising action building tension
- Compelling climax
- Satisfying resolution

## Writing Elements
- Natural, character-appropriate dialogue
- "Show don''t tell" approach
- Sensory details (sight, sound, smell, touch, taste)
- At least one unexpected twist or revelation

## Pacing
- Vary sentence length for rhythm
- Balance action and reflection
- Build tension progressively

**Story Elements to Include:**
- Opening that hooks immediately
- Well-developed main character
- Clear conflict or challenge
- Emotional resonance
- Meaningful theme integration
- Satisfying ending (or cliffhanger if serialized)

Length: Aim for 800-1200 words for short story, 1500-2500 for chapter.

Make every scene serve the narrative. Focus on emotional truth and authentic character voice.',
  'text',
  ARRAY['GPT-4', 'Claude-3.5-Sonnet'],
  ARRAY['creative-writing', 'storytelling', 'fiction', 'narrative'],
  'public',
  'Creative',
  'english',
  '1.0.0',
  2456,
  987,
  634,
  89,
  45,
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '11 days'
);

-- Continue with remaining 5 prompts...
-- (Keeping response manageable - full script would include all 10)

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check personas created
SELECT username, name, subscription_plan, bio 
FROM profiles 
WHERE email LIKE '%demo@promptsgo.com%'
ORDER BY subscription_plan DESC, username;

-- Check prompts created
SELECT 
  p.title,
  pr.username as author,
  p.category,
  p.hearts,
  p.save_count,
  p.view_count,
  p.created_at::date
FROM prompts p
JOIN profiles pr ON p.user_id = pr.id
WHERE pr.email LIKE '%demo@promptsgo.com%'
ORDER BY p.hearts DESC;

-- Summary statistics
SELECT 
  pr.username,
  pr.subscription_plan,
  COUNT(p.id) as prompts_created,
  SUM(p.hearts) as total_hearts,
  SUM(p.save_count) as total_saves
FROM profiles pr
LEFT JOIN prompts p ON pr.id = p.user_id
WHERE pr.email LIKE '%demo@promptsgo.com%'
GROUP BY pr.id, pr.username, pr.subscription_plan
ORDER BY total_hearts DESC;

-- Top prompts
SELECT title, hearts, save_count, category
FROM prompts
WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%demo@promptsgo.com%'
)
ORDER BY hearts DESC
LIMIT 10;

SELECT '✅ Seed data loaded successfully! 5 personas and 10 high-quality prompts created.' as status;