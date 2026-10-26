-- Add avatarUrl column to users table for profile picture support
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);
