-- Add expert fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(16) NOT NULL DEFAULT 'FARMER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status varchar(16) NOT NULL DEFAULT 'PENDING';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_expert boolean NOT NULL DEFAULT false;
