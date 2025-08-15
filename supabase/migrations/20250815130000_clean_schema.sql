-- Clean schema for quizr application
-- Removes unused columns and simplifies permissions

-- Table to store push notification tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store one question per day (global)
-- Removed: category, difficulty, question_type (unused columns)
CREATE TABLE daily_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_date DATE NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  incorrect_answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track user attempts for each daily question
CREATE TABLE user_question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  question_date DATE NOT NULL,
  daily_question_id UUID NOT NULL REFERENCES daily_questions(id),
  has_attempted BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per device per day
  UNIQUE(device_id, question_date)
);

-- Grant basic permissions to anon role (for client operations only)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON push_tokens TO anon;
GRANT SELECT, INSERT, UPDATE ON user_question_attempts TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Enable Row Level Security
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;  -- RLS enabled but no anon policies (service role only)
ALTER TABLE user_question_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for push_tokens table
CREATE POLICY "Allow anon insert push tokens" ON push_tokens
  FOR INSERT TO anon WITH CHECK (TRUE);

CREATE POLICY "Allow anon read push tokens" ON push_tokens
  FOR SELECT TO anon USING (TRUE);

CREATE POLICY "Allow anon update push tokens" ON push_tokens
  FOR UPDATE TO anon USING (TRUE);

-- NO policies for daily_questions (service role access only through Edge Functions)

-- Policies for user_question_attempts table  
CREATE POLICY "Allow anon read own attempts" ON user_question_attempts
  FOR SELECT TO anon USING (TRUE);

CREATE POLICY "Allow anon insert attempts" ON user_question_attempts
  FOR INSERT TO anon WITH CHECK (TRUE);

CREATE POLICY "Allow anon update own attempts" ON user_question_attempts
  FOR UPDATE TO anon USING (TRUE);

-- Create indexes for performance
CREATE INDEX idx_push_tokens_token ON push_tokens(token);
CREATE INDEX idx_daily_questions_date ON daily_questions(question_date);
CREATE INDEX idx_user_attempts_device_date ON user_question_attempts(device_id, question_date);
CREATE INDEX idx_user_attempts_question_id ON user_question_attempts(daily_question_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_attempts_updated_at 
    BEFORE UPDATE ON user_question_attempts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to service_role for Edge Functions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_questions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_question_attempts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_tokens TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;