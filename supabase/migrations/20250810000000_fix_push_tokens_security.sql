-- Fix overly permissive read policy on push_tokens table
-- Remove the policy that allows all users to read all push tokens

DROP POLICY IF EXISTS "Allow all users to read push tokens" ON push_tokens;

-- The push_tokens table should only be:
-- 1. Insertable by anonymous users (for registering tokens)
-- 2. Readable by service role (for sending notifications via Edge Functions)
-- 
-- No read policy needed since Edge Functions use service role key
-- which bypasses RLS entirely

-- Keep the existing policies:
-- - "Allow anon insert push tokens" (allows token registration)
-- - "Allow users to delete their own push tokens" (for cleanup, though not used in MVP)

-- Note: Edge Functions with service role key can still read all tokens
-- for sending notifications, but client-side code cannot.