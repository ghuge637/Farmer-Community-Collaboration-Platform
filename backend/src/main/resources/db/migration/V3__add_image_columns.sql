-- Add caption and image_url columns to posts if missing
ALTER TABLE posts ADD COLUMN IF NOT EXISTS caption text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url varchar(1024);
