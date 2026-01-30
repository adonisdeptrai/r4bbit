-- Migration: Add Google OAuth support to users table
-- Adds google_id column and last_login timestamp for OAuth authentication

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Allow null passwords for OAuth users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID for SSO authentication';
COMMENT ON COLUMN users.last_login IS 'Timestamp of last successful login';
