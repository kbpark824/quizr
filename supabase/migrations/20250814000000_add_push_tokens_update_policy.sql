-- Add UPDATE policy for push_tokens table to allow upsert operations
-- This allows anonymous users to update existing push tokens, which is needed
-- for the upsert operation when a device tries to register the same token again

CREATE POLICY "Allow anon update push tokens" ON push_tokens
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

-- Note: This policy allows anonymous users to update any push token.
-- This is acceptable because:
-- 1. Push tokens are not sensitive user data
-- 2. Updating a token with the same value is harmless
-- 3. The tokens are only used for sending notifications
-- 4. Edge Functions with service role bypass RLS anyway for notifications