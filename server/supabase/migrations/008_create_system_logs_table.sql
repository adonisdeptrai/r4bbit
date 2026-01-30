-- Migration: Create system_logs table
-- Description: System activity and error logging with auto-cleanup

-- Create log type enum
CREATE TYPE log_type AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'WORKER');

-- Create system_logs table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type log_type NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for timestamp queries
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_type ON system_logs(type);

-- Add comment
COMMENT ON TABLE system_logs IS 'System activity and error logging with auto-cleanup (7 days retention)';
COMMENT ON COLUMN system_logs.details IS 'Additional context data in JSON format';

-- Note: Auto-cleanup will be implemented via application-level cleanup job
-- Alternative: Use pg_cron extension if available:
-- SELECT cron.schedule('cleanup-old-logs', '0 0 * * *', 
--   'DELETE FROM system_logs WHERE timestamp < NOW() - INTERVAL ''7 days''');
