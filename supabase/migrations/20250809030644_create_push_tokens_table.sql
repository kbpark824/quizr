CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert push tokens" ON push_tokens
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow all users to read push tokens" ON push_tokens
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow users to delete their own push tokens" ON push_tokens
  FOR DELETE USING (auth.uid() = id);