-- Migration: Create users table
-- Description: User accounts with authentication and profile data

-- Create role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    avatar TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE users IS 'User accounts with authentication and profile data';
COMMENT ON COLUMN users.balance IS 'User account balance in VND';
