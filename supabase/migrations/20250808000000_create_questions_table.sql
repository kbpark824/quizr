ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON questions
  FOR SELECT USING (TRUE);

-- Removed: CREATE POLICY "Allow anon insert" ON questions
--   FOR INSERT WITH CHECK (TRUE);
