ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(255);

UPDATE users u
SET region = ep.region
FROM expert_profile ep
WHERE ep.user_id = u.id
  AND ep.region IS NOT NULL
  AND TRIM(ep.region) <> ''
  AND (u.region IS NULL OR TRIM(u.region) = '');
