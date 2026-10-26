-- Add required farmers per request (defaults to 1 for existing rows)
ALTER TABLE task_requests
ADD COLUMN IF NOT EXISTS required_farmers integer NOT NULL DEFAULT 1;
