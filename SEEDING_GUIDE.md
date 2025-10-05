# PromptsGo Database Seeding Guide

## 📋 Overview

This guide walks you through seeding your PromptsGo database with demo content to create a vibrant, established-looking platform from day one.

## 🎯 What Gets Seeded

### Available Seed Options:

1. **Initial 10 Prompts** (`seed-initial-10-prompts.sql`)
   - 5 realistic user personas
   - 10 high-quality, diverse prompts
   - Realistic engagement metrics
   - **Best for:** Quick setup, MVP testing, demo purposes

2. **30 Prompts MVP** (`seed-30-prompts.sql`)
   - 5 user personas (same as above)
   - 30 curated prompts across major categories
   - Complete coverage of key use cases
   - **Best for:** More comprehensive demo, production-ready initial content

3. **100 Prompts (Future)** - See `CONTENT_SEEDING_STRATEGY.md`
   - 10 diverse user personas
   - 100 professional prompts
   - 8 industry packs
   - **Status:** Strategy document ready, implementation pending

## 🚀 Quick Start (10 Prompts)

### Prerequisites

- Supabase project set up
- Main schema deployed (`supabase-schema.sql` executed)
- **You have signed up for an account** in your PromptsGo app

### Important: Auth Users Requirement

The `profiles` table has a foreign key to `auth.users`, which means you cannot directly insert demo users. You must use one of these approaches:

**Option A: Use Your Own Account (Recommended for Testing)**
1. Sign up through your app first
2. Use `seed-demo-prompts-simple.sql`
3. Replace `YOUR_USER_ID_HERE` with your user ID
4. Run the script

**Option B: Create Real Demo Accounts**
1. Manually sign up 5 demo accounts through your app
2. Use their real user IDs in seed script
3. More realistic but requires manual work

### Step 1: Get Your User ID

After signing up, run this in Supabase SQL Editor:

```sql
SELECT id, email FROM auth.users WHERE email = 'your@email.com';
```

Copy your UUID.

### Step 2: Run the Seed Script

Use `seed-demo-prompts-simple.sql`:

1. Open the file
2. Replace `'YOUR_USER_ID_HERE'` with your UUID
3. Copy entire contents
4. Paste into Supabase SQL Editor
5. Click Run

### Step 2: Verify the Data

Run verification queries (included at bottom of seed file):

```sql
-- Check personas
SELECT username, name, subscription_plan, bio 
FROM profiles 
WHERE email LIKE '%demo@promptsgo.com%'
ORDER BY subscription_plan DESC;

-- Check prompts
SELECT 
  p.title,
  pr.username as author,
  p.category,
  p.hearts,
  p.save_count
FROM prompts p
JOIN profiles pr ON p.user_id = pr.id
WHERE pr.email LIKE '%demo@promptsgo.com%'
ORDER BY p.hearts DESC;
```

### Step 3: Test in Your App

1. Restart your development server
2. Visit the Explore page
3. You should see 10 diverse prompts
4. Try searching, filtering by category
5. Click into prompts to see full details

## 👥 Demo User Personas

All seed scripts create these 5 personas:

### 1. **Sarah Chen** (@sarahc) - Business Consultant
- **Subscription:** Pro
- **Email:** sarah.chen.demo@promptsgo.com
- **Focus:** Business communication, strategy
- **Prompts:** Professional emails, meeting summaries, proposals

### 2. **Marcus Rivera** (@marcusdev) - Senior Developer
- **Subscription:** Pro
- **Email:** marcus.dev.demo@promptsgo.com
- **Focus:** Code quality, documentation
- **Prompts:** Code reviews, technical docs, SQL queries

### 3. **Emily Watson** (@emilymarketing) - Content Marketer
- **Subscription:** Pro
- **Email:** emily.w.demo@promptsgo.com
- **Focus:** SEO, content creation
- **Prompts:** Blog posts, social media, marketing copy

### 4. **David Park** (@datawithdavid) - Data Scientist
- **Subscription:** Free
- **Email:** david.park.demo@promptsgo.com
- **Focus:** Data analysis, SQL
- **Prompts:** Data analysis, visualizations, reports

### 5. **Alex Thompson** (@alexwrites) - Creative Writer
- **Subscription:** Free
- **Email:** alex.writes.demo@promptsgo.com
- **Focus:** Creative writing, storytelling
- **Prompts:** Story generation, characters, world-building

## 📊 What's Included in 10-Prompt Seed

### By Category:
- **Business (3):** Email generator, meeting summaries, support responses
- **Development (2):** Code review, technical documentation
- **Marketing (2):** SEO blog posts, LinkedIn engagement
- **Data Analysis (2):** SQL queries, data insights
- **Creative (1):** Story generation

### Engagement Distribution:
- **Viral hits (2000+ hearts):** 1 prompt (Code Review)
- **Very popular (1000-1500):** 3 prompts
- **Popular (500-1000):** 3 prompts
- **Moderate (200-500):** 3 prompts

### Prompt Types:
- **Text prompts:** 8
- **Code prompts:** 2

## 🔧 Customization Options

### Adjust Engagement Metrics

Edit the seed file to change hearts, saves, views:

```sql
-- Example: Make a prompt less popular
INSERT INTO prompts (..., view_count, hearts, save_count, ...)
VALUES (..., 500, 89, 45, ...);  -- Lower numbers
```

### Add More Users

Duplicate and modify persona entries:

```sql
INSERT INTO profiles (id, username, email, name, bio, ...)
VALUES (
  gen_random_uuid(),  -- Auto-generate UUID
  'youruser',
  'your.email@example.com',
  'Your Name',
  'Your bio...',
  'free',
  5
);
```

### Modify Prompt Content

Edit any prompt's content section to better match your needs:

```sql
-- Find the prompt in the seed file and edit
content: 'Your modified prompt instructions here...'
```

## 🎨 30-Prompt Seed (Extended Version)

For more comprehensive seeding:

### What's Different:
- 3x more prompts (30 vs 10)
- Better category coverage
- More diverse engagement patterns
- Includes client proposals, video scripts, dashboards, etc.

### How to Use:

```sql
-- Run instead of 10-prompt seed
\i seed-30-prompts.sql
```

**Note:** `seed-30-prompts.sql` currently shows only 3 prompts as a sample. The full implementation would follow the pattern shown in `MVP_CONTENT_PLAN.md`.

## ⚙️ Advanced: Custom Seeding

### Create Your Own Prompts

Follow this template:

```sql
INSERT INTO prompts (
  id, user_id, title, slug, description, content, type,
  model_compatibility, tags, visibility, category, language, version,
  view_count, hearts, save_count, fork_count, comment_count,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '[USER_ID]'::uuid,  -- Use one of the demo user IDs
  'Your Prompt Title',
  'your-prompt-slug',
  'Brief description of what this prompt does',
  'Full prompt content with instructions...',
  'text',  -- or 'code', 'image', 'agent', 'chain'
  ARRAY['GPT-4', 'Claude-3.5-Sonnet'],
  ARRAY['tag1', 'tag2', 'tag3'],
  'public',
  'Business',  -- or Development, Marketing, etc.
  'english',
  '1.0.0',
  100,    -- view_count
  25,     -- hearts
  15,     -- save_count
  3,      -- fork_count
  2,      -- comment_count
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '5 days'
);
```

### Best Practices:

1. **Realistic Metrics**
   - View count > hearts > saves > forks > comments
   - Typical ratio: 100:10:7:2:1
   - Popular prompts: views 5000+, hearts 1000+

2. **Creation Dates**
   - Spread over time (30-90 days ago)
   - More recent prompts = fewer metrics
   - Old favorites = high engagement

3. **Quality Content**
   - Clear, actionable prompt instructions
   - Proper formatting and structure
   - Include examples where helpful
   - 200-500 words optimal

4. **Tags**
   - 3-5 relevant tags per prompt
   - Use lowercase, hyphenated format
   - Mix specific and general tags

## 🧪 Testing Your Seeded Data

### 1. Browse & Explore
```
✓ Visit /explore
✓ See all 10 prompts displayed
✓ Try sorting by popularity, recency
✓ Filter by category
```

### 2. Search Functionality
```
✓ Search for "email" → finds email generator
✓ Search for "code" → finds code review
✓ Search by tag → filters correctly
```

### 3. Prompt Details
```
✓ Click into any prompt
✓ See full content and description
✓ View author profile link
✓ See engagement stats
```

### 4. User Profiles
```
✓ Visit user profile pages
✓ See their created prompts
✓ View bio and stats
```

## 🔄 Resetting Seed Data

To start fresh:

```sql
-- WARNING: This deletes all demo data
DELETE FROM prompts 
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE email LIKE '%demo@promptsgo.com%'
);

DELETE FROM profiles 
WHERE email LIKE '%demo@promptsgo.com%';

-- Then re-run your seed script
```

## 📈 Production Considerations

### Before Going Live:

1. **Remove Demo Content**
   - Delete all `@promptsgo.com` demo users
   - Or keep a few as "official" starter content

2. **Adjust Metrics**
   - Start with lower, realistic numbers
   - Let real engagement grow organically

3. **Curate Carefully**
   - Keep only highest quality prompts
   - Remove any outdated references
   - Update model compatibility

4. **Attribution**
   - Clearly mark seeded content if keeping
   - Consider "Staff Picks" or "Featured" labels

## 📚 Related Documentation

- **`CONTENT_SEEDING_STRATEGY.md`** - Full 100-prompt strategy
- **`MVP_CONTENT_PLAN.md`** - Detailed 30-prompt breakdown
- **`seed-initial-10-prompts.sql`** - Ready-to-run 10-prompt script
- **`seed-30-prompts.sql`** - Extended 30-prompt script (partial)

## 🎯 Next Steps

1. Choose your seed option (10 or 30 prompts)
2. Run the appropriate SQL script
3. Verify data loaded correctly
4. Test in your application
5. Customize as needed
6. Consider creating more prompts following the templates

## ❓ Troubleshooting

### "User ID not found" error
- Make sure user personas are created first
- Check UUIDs match between profiles and prompts

### Prompts not appearing in app
- Verify `visibility = 'public'`
- Check React query cache (restart dev server)
- Confirm Supabase RLS policies allow reads

### Duplicate key errors
- Change UUIDs if re-running
- Or use `ON CONFLICT DO NOTHING` clause

### Missing images/avatars
- Demo users don't have avatar URLs
- App should show fallback avatars
- Add avatar URLs to profiles if needed

---

**🎉 You're ready to seed!** Choose your starting point and run the script. Your PromptsGo platform will instantly feel established and valuable.
