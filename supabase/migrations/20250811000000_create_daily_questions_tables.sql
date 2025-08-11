-- Create tables for daily question persistence and user tracking

-- Table to store one question per day (global)
CREATE TABLE daily_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_date DATE NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  incorrect_answers JSONB NOT NULL,
  category TEXT,
  difficulty TEXT,
  question_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track user attempts for each daily question
CREATE TABLE user_question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL, -- Using device identifier since no auth
  question_date DATE NOT NULL,
  daily_question_id UUID NOT NULL REFERENCES daily_questions(id),
  has_attempted BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per device per day
  UNIQUE(device_id, question_date)
);

-- Enable Row Level Security
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for daily_questions table
CREATE POLICY "Allow anon read daily questions" ON daily_questions
  FOR SELECT USING (TRUE);

-- Policies for user_question_attempts table  
CREATE POLICY "Allow anon read own attempts" ON user_question_attempts
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow anon insert attempts" ON user_question_attempts
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow anon update own attempts" ON user_question_attempts
  FOR UPDATE USING (TRUE);

-- Create indexes for performance
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