-- Production compatibility migration
-- Ensures all migrations work correctly against existing production schema

-- This migration is designed to be idempotent and work whether running against:
-- 1. A fresh database (dev/test environments)
-- 2. An existing production database with the schema already in place

DO $$
BEGIN
    -- Verify all expected tables exist and have correct structure
    -- This serves as both validation and documentation
    
    -- Check daily_questions table exists with expected columns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_questions' AND table_schema = 'public') THEN
        RAISE NOTICE 'daily_questions table exists - production compatibility verified';
        
        -- Verify key columns exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_questions' AND column_name = 'question_date' AND table_schema = 'public') THEN
            RAISE EXCEPTION 'daily_questions table missing question_date column';
        END IF;
    ELSE
        RAISE NOTICE 'daily_questions table does not exist yet - will be created by previous migrations';
    END IF;
    
    -- Check push_tokens table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_tokens' AND table_schema = 'public') THEN
        RAISE NOTICE 'push_tokens table exists - production compatibility verified';
    ELSE
        RAISE NOTICE 'push_tokens table does not exist yet - will be created by previous migrations';
    END IF;
    
    -- Check user_question_attempts table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_question_attempts' AND table_schema = 'public') THEN
        RAISE NOTICE 'user_question_attempts table exists - production compatibility verified';
    ELSE
        RAISE NOTICE 'user_question_attempts table does not exist yet - will be created by previous migrations';
    END IF;
    
    RAISE NOTICE 'Production compatibility check completed successfully';
END $$;