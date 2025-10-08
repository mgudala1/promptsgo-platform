-- System Logs & Health Monitoring Schema Migration
-- This file contains the database schema for system logs, health monitoring, and job management

-- Create enum for log levels
DO $$ BEGIN
    CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error', 'fatal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for log sources
DO $$ BEGIN
    CREATE TYPE log_source AS ENUM ('frontend', 'backend', 'database', 'api', 'system', 'external');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for health check types
DO $$ BEGIN
    CREATE TYPE health_check_type AS ENUM ('database', 'cache', 'queue', 'external_api', 'storage', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for health status
DO $$ BEGIN
    CREATE TYPE health_status AS ENUM ('healthy', 'degraded', 'unhealthy', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for job status
DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- System Logs table
DROP TABLE IF EXISTS system_logs CASCADE;
CREATE TABLE system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level log_level NOT NULL,
    source log_source NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    user_id UUID REFERENCES profiles(id),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    stack_trace TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Checks table
DROP TABLE IF EXISTS health_checks CASCADE;
CREATE TABLE health_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type health_check_type NOT NULL,
    name TEXT NOT NULL,
    status health_status NOT NULL,
    response_time_ms INTEGER,
    details JSONB DEFAULT '{}',
    error_message TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    next_check_at TIMESTAMPTZ,
    UNIQUE(type, name)
);

-- Background Jobs table
DROP TABLE IF EXISTS background_jobs CASCADE;
CREATE TABLE background_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    job_type TEXT NOT NULL, -- e.g., 'refresh_materialized_view', 'cleanup_old_data'
    status job_status DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    parameters JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job History table (for completed jobs)
DROP TABLE IF EXISTS job_history CASCADE;
CREATE TABLE job_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES background_jobs(id) ON DELETE CASCADE,
    status job_status NOT NULL,
    result JSONB DEFAULT '{}',
    error_message TEXT,
    duration_ms INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Metrics table (for storing periodic metrics)
DROP TABLE IF EXISTS system_metrics CASCADE;
CREATE TABLE system_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_unit TEXT,
    tags JSONB DEFAULT '{}',
    collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_source ON system_logs(source);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_request_id ON system_logs(request_id);

CREATE INDEX idx_health_checks_type ON health_checks(type);
CREATE INDEX idx_health_checks_status ON health_checks(status);
CREATE INDEX idx_health_checks_checked_at ON health_checks(checked_at DESC);

CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_job_type ON background_jobs(job_type);
CREATE INDEX idx_background_jobs_created_at ON background_jobs(created_at DESC);
CREATE INDEX idx_background_jobs_priority ON background_jobs(priority DESC);

CREATE INDEX idx_job_history_job_id ON job_history(job_id);
CREATE INDEX idx_job_history_completed_at ON job_history(completed_at DESC);

CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_collected_at ON system_metrics(collected_at DESC);

-- Create updated_at trigger for background_jobs
CREATE TRIGGER update_background_jobs_updated_at BEFORE UPDATE ON background_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only admins can access system monitoring data)
CREATE POLICY "Only admins can access system logs" ON system_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can access health checks" ON health_checks FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can manage background jobs" ON background_jobs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can access job history" ON job_history FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can access system metrics" ON system_metrics FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert some default health checks
INSERT INTO health_checks (type, name, status, details) VALUES
('database', 'supabase_connection', 'unknown', '{"description": "Supabase database connectivity"}'),
('cache', 'supabase_cache', 'unknown', '{"description": "Supabase built-in caching"}'),
('system', 'application_status', 'unknown', '{"description": "Application health status"}');

-- Insert some default background jobs
INSERT INTO background_jobs (name, description, job_type, priority, parameters) VALUES
('Refresh Success Stats', 'Refresh the success statistics materialized view', 'refresh_materialized_view', 1, '{"view_name": "success_stats"}'),
('Cleanup Old Logs', 'Remove system logs older than 30 days', 'cleanup_logs', 2, '{"retention_days": 30}'),
('Update User Metrics', 'Recalculate user engagement metrics', 'update_metrics', 3, '{"metric_types": ["engagement", "activity"]}');

-- Function to log system events
CREATE OR REPLACE FUNCTION log_system_event(
    p_level log_level,
    p_source log_source,
    p_message TEXT,
    p_details JSONB DEFAULT '{}',
    p_user_id UUID DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO system_logs (level, source, message, details, user_id, request_id, stack_trace)
    VALUES (p_level, p_source, p_message, p_details, p_user_id, p_request_id, p_stack_trace)
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update health check status
CREATE OR REPLACE FUNCTION update_health_check(
    p_type health_check_type,
    p_name TEXT,
    p_status health_status,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_error_message TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO health_checks (type, name, status, response_time_ms, details, error_message, checked_at)
    VALUES (p_type, p_name, p_status, p_response_time_ms, p_details, p_error_message, NOW())
    ON CONFLICT (type, name)
    DO UPDATE SET
        status = EXCLUDED.status,
        response_time_ms = EXCLUDED.response_time_ms,
        details = EXCLUDED.details,
        error_message = EXCLUDED.error_message,
        checked_at = EXCLUDED.checked_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to trigger manual job
CREATE OR REPLACE FUNCTION trigger_manual_job(
    p_job_type TEXT,
    p_parameters JSONB DEFAULT '{}',
    p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    job_id UUID;
    job_name TEXT;
BEGIN
    -- Get job name from existing job or create a new one
    SELECT name INTO job_name
    FROM background_jobs
    WHERE job_type = p_job_type AND status IN ('pending', 'completed')
    ORDER BY created_at DESC
    LIMIT 1;

    IF job_name IS NULL THEN
        job_name := 'Manual ' || p_job_type;
    END IF;

    INSERT INTO background_jobs (name, job_type, status, parameters, created_by)
    VALUES (job_name, p_job_type, 'pending', p_parameters, p_created_by)
    RETURNING id INTO job_id;

    -- Log the job trigger
    PERFORM log_system_event('info', 'system', 'Manual job triggered: ' || p_job_type, p_parameters, p_created_by);

    RETURN job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to refresh success stats materialized view (placeholder - implement based on actual view)
CREATE OR REPLACE FUNCTION refresh_success_stats_view() RETURNS TEXT AS $$
BEGIN
    -- This is a placeholder. Replace with actual materialized view refresh logic
    -- Example: REFRESH MATERIALIZED VIEW CONCURRENTLY success_stats;

    -- For now, just log that the job ran
    PERFORM log_system_event('info', 'system', 'Success stats view refresh completed', '{}');

    RETURN 'Success stats view refreshed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;