# PromptsGo Feature Expansion - Architecture Plan

## Phase 1: System Design Overview

This document outlines the comprehensive architecture for implementing 8 major feature modules in PromptsGo. The plan ensures modular, scalable, and maintainable code with proper separation of concerns.

---

## 🗄️ Database Schema Changes

### Module 1: Success Rate Tracking System
```sql
-- Success votes table
CREATE TABLE success_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    vote_value INTEGER NOT NULL CHECK (vote_value >= 1 AND vote_value <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prompt_id, user_id)
);

-- Add success rate columns to prompts
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS success_rate DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS success_votes_count INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX idx_success_votes_prompt_id ON success_votes(prompt_id);
CREATE INDEX idx_success_votes_user_id ON success_votes(user_id);
CREATE INDEX idx_prompts_success_rate ON prompts(success_rate DESC);
```

### Module 2: Portfolio System (username.promptsgo.com)
```sql
-- Extend profiles table for portfolio metadata
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_theme TEXT DEFAULT 'default';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_view_count INTEGER DEFAULT 0;

-- Portfolio collections table
CREATE TABLE portfolio_collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio collection prompts (junction table)
CREATE TABLE portfolio_collection_prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection_id UUID REFERENCES portfolio_collections(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, prompt_id)
);

-- Indexes
CREATE INDEX idx_portfolio_collections_user_id ON portfolio_collections(user_id);
CREATE INDEX idx_portfolio_collection_prompts_collection_id ON portfolio_collection_prompts(collection_id);
CREATE INDEX idx_portfolio_collection_prompts_prompt_id ON portfolio_collection_prompts(prompt_id);
```

### Module 3: Version History & Forking
```sql
-- Prompt versions table
CREATE TABLE prompt_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    parent_version_id UUID REFERENCES prompt_versions(id),
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    changelog TEXT,
    is_major_version BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fork relationships table
CREATE TABLE prompt_forks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    original_prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    forked_prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
    forked_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    fork_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(original_prompt_id, forked_prompt_id)
);

-- Indexes
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_parent_version_id ON prompt_versions(parent_version_id);
CREATE INDEX idx_prompt_forks_original_prompt_id ON prompt_forks(original_prompt_id);
CREATE INDEX idx_prompt_forks_forked_prompt_id ON prompt_forks(forked_prompt_id);
```

### Module 4: Enhanced ExplorePage Filters
```sql
-- User filter preferences table
CREATE TABLE user_filter_presets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Indexes
CREATE INDEX idx_user_filter_presets_user_id ON user_filter_presets(user_id);
```

### Module 5: Collaboration Features
```sql
-- Extend comments table for threaded discussions
ALTER TABLE comments ADD COLUMN IF NOT EXISTS thread_id UUID;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- Activity feed table
CREATE TABLE activity_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'comment', 'heart', 'save', 'fork', 'edit', etc.
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time presence table
CREATE TABLE user_presence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, prompt_id)
);

-- Indexes
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_prompt_id ON activity_feed(prompt_id);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX idx_user_presence_prompt_id ON user_presence(prompt_id);
CREATE INDEX idx_user_presence_last_seen ON user_presence(last_seen);
```

### Module 6: Analytics Dashboard
```sql
-- Analytics events table
CREATE TABLE analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'view', 'save', 'fork', 'heart', 'share', 'copy'
    metadata JSONB DEFAULT '{}',
    session_id TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator analytics summary table (materialized view alternative)
CREATE TABLE creator_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    total_saves INTEGER DEFAULT 0,
    total_forks INTEGER DEFAULT 0,
    total_hearts INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    top_performing_prompts JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_start, period_end)
);

-- Indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_prompt_id ON analytics_events(prompt_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_creator_analytics_user_id ON creator_analytics(user_id);
CREATE INDEX idx_creator_analytics_period ON creator_analytics(period_start, period_end);
```

### Module 7: Upgrade to Pro Flow
```sql
-- Extend subscriptions table if needed
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS upgrade_source TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- Feature usage tracking
CREATE TABLE feature_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    feature_name TEXT NOT NULL, -- 'unlimited_saves', 'advanced_analytics', etc.
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feature_name)
);

-- Indexes
CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);
```

### Module 8: Template Variable System
```sql
-- Template variables table
CREATE TABLE template_variables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE NOT NULL,
    variable_name TEXT NOT NULL,
    variable_type TEXT DEFAULT 'text', -- 'text', 'number', 'select', 'boolean'
    default_value TEXT,
    placeholder TEXT,
    validation_rules JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template instances table (filled templates)
CREATE TABLE template_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    variable_values JSONB NOT NULL DEFAULT '{}',
    generated_prompt_id UUID REFERENCES prompts(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_template_variables_template_id ON template_variables(template_id);
CREATE INDEX idx_template_instances_template_id ON template_instances(template_id);
CREATE INDEX idx_template_instances_user_id ON template_instances(user_id);
CREATE INDEX idx_template_instances_generated_prompt_id ON template_instances(generated_prompt_id);
```

---

## 🔌 API Endpoints & Edge Functions

### Module 1: Success Rate Tracking
- `POST /api/prompts/{id}/success-vote` - Submit success vote
- `GET /api/prompts/{id}/success-stats` - Get success statistics
- `DELETE /api/prompts/{id}/success-vote` - Remove user's vote

### Module 2: Portfolio System
- `GET /api/portfolios/{username}` - Get public portfolio by username
- `PUT /api/portfolios/settings` - Update portfolio settings
- `POST /api/portfolios/collections` - Create portfolio collection
- `GET /api/portfolios/{username}/analytics` - Get portfolio analytics

### Module 3: Version History & Forking
- `GET /api/prompts/{id}/versions` - Get version history
- `POST /api/prompts/{id}/versions` - Save new version
- `POST /api/prompts/{id}/fork` - Fork prompt
- `GET /api/prompts/{id}/fork-tree` - Get fork visualization data

### Module 4: Enhanced ExplorePage Filters
- `GET /api/prompts/search` - Advanced search with compound filters
- `POST /api/user/filter-presets` - Save filter preset
- `GET /api/user/filter-presets` - Get user's saved presets
- `DELETE /api/user/filter-presets/{id}` - Delete filter preset

### Module 5: Collaboration Features
- `GET /api/prompts/{id}/activity` - Get activity feed
- `POST /api/comments/threaded` - Create threaded comment
- `GET /api/prompts/{id}/presence` - Get active users
- `POST /api/presence/heartbeat` - Update user presence

### Module 6: Analytics Dashboard
- `GET /api/analytics/creator/{userId}` - Get creator analytics
- `GET /api/analytics/prompt/{promptId}` - Get prompt analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `POST /api/analytics/events` - Track analytics events

### Module 7: Upgrade to Pro Flow
- `GET /api/subscription/plans` - Get available plans
- `POST /api/subscription/create-session` - Create Stripe checkout session
- `GET /api/subscription/features` - Get feature entitlements
- `POST /api/subscription/cancel` - Cancel subscription

### Module 8: Template Variable System
- `POST /api/templates/{id}/variables` - Add template variables
- `POST /api/templates/{id}/instantiate` - Create prompt from template
- `GET /api/templates/{id}/preview` - Preview filled template
- `PUT /api/templates/{id}/variables` - Update template variables

---

## 🎨 Frontend Integration Points

### Component Ownership Map

| Component | Owner Module | Location |
|-----------|-------------|----------|
| `SuccessVotingPanel` | Module 1 | `src/components/prompts/SuccessVotingPanel.tsx` |
| `SuccessBadge` | Module 1 | `src/components/ui/SuccessBadge.tsx` |
| `PortfolioPage` | Module 2 | `src/pages/[username].tsx` |
| `PortfolioCollections` | Module 2 | `src/components/portfolio/PortfolioCollections.tsx` |
| `VersionHistoryPanel` | Module 3 | `src/components/prompts/VersionHistoryPanel.tsx` |
| `ForkTreeVisualization` | Module 3 | `src/components/prompts/ForkTreeVisualization.tsx` |
| `AdvancedFilters` | Module 4 | `src/components/explore/AdvancedFilters.tsx` |
| `FilterPresets` | Module 4 | `src/components/explore/FilterPresets.tsx` |
| `ThreadedComments` | Module 5 | `src/components/comments/ThreadedComments.tsx` |
| `ActivityFeed` | Module 5 | `src/components/activity/ActivityFeed.tsx` |
| `PresenceIndicators` | Module 5 | `src/components/presence/PresenceIndicators.tsx` |
| `AnalyticsDashboard` | Module 6 | `src/components/analytics/AnalyticsDashboard.tsx` |
| `UpgradePage` | Module 7 | `src/pages/upgrade.tsx` |
| `SubscriptionManager` | Module 7 | `src/components/subscription/SubscriptionManager.tsx` |
| `TemplateVariableEditor` | Module 8 | `src/components/templates/TemplateVariableEditor.tsx` |
| `TemplateVariableFiller` | Module 8 | `src/components/templates/TemplateVariableFiller.tsx` |

### Context Updates Required

**AppContext Extensions:**
- Success votes state management
- Portfolio collections state
- Version history data
- Filter presets
- Activity feed data
- Analytics data
- Template variables state

**New Contexts:**
- `AnalyticsContext` - Dashboard data management
- `CollaborationContext` - Real-time features
- `SubscriptionContext` - Pro features management

### Hook Ownership

| Hook | Owner Module | Purpose |
|------|-------------|---------|
| `useSuccessVoting` | Module 1 | Success vote management |
| `usePortfolio` | Module 2 | Portfolio data management |
| `useVersionHistory` | Module 3 | Version control operations |
| `useAdvancedFilters` | Module 4 | Complex filtering logic |
| `useCollaboration` | Module 5 | Real-time collaboration |
| `useAnalytics` | Module 6 | Analytics data fetching |
| `useSubscription` | Module 7 | Subscription management |
| `useTemplateVariables` | Module 8 | Template variable handling |

---

## 🔗 Cross-Feature Dependencies

### Success Tracking → Explore Filters
- Success rate becomes a filterable/sortable field in ExplorePage
- Requires Module 1 before Module 4 completion

### Analytics → Profile Dashboard
- Analytics data powers creator dashboards
- Module 6 provides data for enhanced profile pages

### Version History → Forking
- Version system enables proper attribution in forking
- Module 3 foundation required for advanced forking features

### Collaboration → Activity Feed
- Activity feed shows collaborative actions
- Module 5 extends basic commenting system

### Subscription → Feature Gating
- Pro features require subscription validation
- Module 7 provides entitlement checking for all modules

### Templates → Prompt Creation
- Template system enhances prompt creation workflow
- Module 8 integrates with existing CreatePromptPage

---

## 📋 Implementation Phases

### Phase 1: Database Foundation (Week 1)
1. Create all new tables and indexes
2. Set up RLS policies
3. Create database functions for aggregations
4. Test schema migrations

### Phase 2: Core Features (Weeks 2-6)
- **Week 2:** Module 1 (Success Tracking)
- **Week 3:** Module 3 (Version History) + Module 8 (Templates)
- **Week 4:** Module 2 (Portfolio) + Module 4 (Filters)
- **Week 5:** Module 6 (Analytics) + Module 7 (Subscription)
- **Week 6:** Module 5 (Collaboration)

### Phase 3: Integration & Testing (Weeks 7-8)
- Cross-feature integration testing
- Performance optimization
- UI/UX refinements
- End-to-end testing

### Phase 4: Deployment & Monitoring (Week 9)
- Production deployment
- Analytics monitoring
- User feedback collection
- Iterative improvements

---

## ✅ Architecture Validation Checklist

- [ ] All tables have proper indexes for query performance
- [ ] RLS policies prevent unauthorized data access
- [ ] API endpoints follow REST conventions
- [ ] Frontend components are modular and reusable
- [ ] Cross-feature dependencies are clearly mapped
- [ ] Database functions handle edge cases properly
- [ ] Real-time features use appropriate Supabase channels
- [ ] Error handling is comprehensive across all layers

**Ready for Phase 2 implementation?** 🚀