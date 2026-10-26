-- Add coverUrl column to users table for cover photo support
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url VARCHAR(512);
