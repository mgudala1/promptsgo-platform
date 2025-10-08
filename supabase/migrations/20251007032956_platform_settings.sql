-- Platform Settings Schema Migration
-- This file contains the database schema for platform settings functionality

-- Create enum for email template types
DO $$ BEGIN
    CREATE TYPE email_template_type AS ENUM ('welcome', 'billing', 'notification', 'password_reset', 'verification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for environment types
DO $$ BEGIN
    CREATE TYPE environment_type AS ENUM ('development', 'staging', 'production');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for webhook event types
DO $$ BEGIN
    CREATE TYPE webhook_event_type AS ENUM ('user_created', 'user_updated', 'user_deleted', 'prompt_created', 'prompt_updated', 'subscription_created', 'subscription_updated', 'payment_succeeded', 'payment_failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Email Templates table
DROP TABLE IF EXISTS email_templates CASCADE;
CREATE TABLE email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type email_template_type NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]', -- Array of variable names used in template
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    UNIQUE(type, name)
);

-- Feature Flags table
DROP TABLE IF EXISTS feature_flags CASCADE;
CREATE TABLE feature_flags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN DEFAULT FALSE,
    environment environment_type NOT NULL,
    rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    conditions JSONB DEFAULT '{}', -- Additional conditions for feature enablement
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    UNIQUE(name, environment)
);

-- API Keys table
DROP TABLE IF EXISTS api_keys CASCADE;
CREATE TABLE api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- Hashed version of the actual key
    permissions JSONB DEFAULT '[]', -- Array of permissions this key has
    environment environment_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Webhooks table
DROP TABLE IF EXISTS webhooks CASCADE;
CREATE TABLE webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events webhook_event_type[] DEFAULT '{}', -- Array of events this webhook listens to
    secret TEXT NOT NULL, -- Secret for webhook signature verification
    headers JSONB DEFAULT '{}', -- Custom headers to send with webhook
    is_active BOOLEAN DEFAULT TRUE,
    environment environment_type NOT NULL,
    retry_count INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Webhook Delivery Logs table
DROP TABLE IF EXISTS webhook_deliveries CASCADE;
CREATE TABLE webhook_deliveries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
    event_type webhook_event_type NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempt_number INTEGER DEFAULT 1,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_feature_flags_environment ON feature_flags(environment);
CREATE INDEX idx_api_keys_environment ON api_keys(environment);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_webhooks_environment ON webhooks(environment);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);

-- Create updated_at triggers
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only admins can manage platform settings)
CREATE POLICY "Only admins can manage email templates" ON email_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can manage feature flags" ON feature_flags FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can manage API keys" ON api_keys FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can manage webhooks" ON webhooks FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can view webhook deliveries" ON webhook_deliveries FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default email templates
INSERT INTO email_templates (type, name, subject, html_content, text_content, variables) VALUES
('welcome', 'Default Welcome', 'Welcome to PromptsGo!',
 '<h1>Welcome to PromptsGo!</h1><p>Hi {{name}},</p><p>Thank you for joining PromptsGo! Your account has been created successfully.</p><p>Best regards,<br>The PromptsGo Team</p>',
 'Welcome to PromptsGo! Hi {{name}}, Thank you for joining PromptsGo! Your account has been created successfully. Best regards, The PromptsGo Team',
 '["name"]'),

('billing', 'Payment Confirmation', 'Payment Confirmation - PromptsGo',
 '<h1>Payment Confirmation</h1><p>Hi {{name}},</p><p>Your payment of ${{amount}} has been processed successfully.</p><p>Thank you for your subscription!</p><p>Best regards,<br>The PromptsGo Team</p>',
 'Payment Confirmation - Hi {{name}}, Your payment of ${{amount}} has been processed successfully. Thank you for your subscription! Best regards, The PromptsGo Team',
 '["name", "amount"]'),

('notification', 'General Notification', 'Notification from PromptsGo',
 '<h1>Notification</h1><p>Hi {{name}},</p><p>{{message}}</p><p>Best regards,<br>The PromptsGo Team</p>',
 'Notification - Hi {{name}}, {{message}} Best regards, The PromptsGo Team',
 '["name", "message"]');

-- Insert default feature flags
INSERT INTO feature_flags (name, description, enabled, environment) VALUES
('AUTH', 'User authentication system', true, 'production'),
('PROMPTS', 'Prompt creation and management', true, 'production'),
('SUBSCRIPTIONS', 'Subscription management', false, 'production'),
('PAYMENTS', 'Payment processing', false, 'production'),
('NOTIFICATIONS', 'Email notifications', false, 'production'),
('ANALYTICS', 'Usage analytics', false, 'production'),
('ADMIN_PANEL', 'Admin management panel', false, 'production'),
('API_ACCESS', 'API access for integrations', false, 'production');