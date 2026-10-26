-- Fix FK on post_likes to reference the correct `posts` table
DO $$
DECLARE
  cname text;
BEGIN
  -- Drop any FK constraints on post_likes that reference a table named 'post'
  FOR cname IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class rel ON c.confrelid = rel.oid
    WHERE c.conrelid = 'post_likes'::regclass
      AND c.contype = 'f'
      AND rel.relname = 'post'
  LOOP
    EXECUTE format('ALTER TABLE post_likes DROP CONSTRAINT %I', cname);
  END LOOP;

  -- Drop the canonical constraint name if present (no-op if not present)
  BEGIN
    EXECUTE 'ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey';
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Create a correct FK referencing posts(id)
  EXECUTE 'ALTER TABLE post_likes ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE';
END $$;
