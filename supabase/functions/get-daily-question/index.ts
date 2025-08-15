import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: any;

const OPEN_TRIVIA_DB_API_URL = "https://opentdb.com/api.php?amount=1&type=multiple";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for all database operations
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const deviceId = req.headers.get('x-device-id') || 'anonymous';
    const today = new Date().toISOString().split('T')[0];

    // STEP 1: Check if today's question exists
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('question_date', today)
      .single();

    let questionData = null;

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (existingQuestion) {
      questionData = existingQuestion;
    } else {
      // STEP 2: Fetch from OpenTriviaDB API
      const response = await fetch(OPEN_TRIVIA_DB_API_URL);
      
      if (!response.ok) {
        throw new Error(`OpenTriviaDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.response_code !== 0) {
        throw new Error(`OpenTriviaDB API error code: ${data.response_code}`);
      }

      const question = data.results[0];
      
      // Clean up HTML entities
      const cleanText = (text: string) => {
        return text
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ');
      };

      // STEP 3: Insert new question using service role
      const { data: storedQuestion, error: insertError } = await supabase
        .from('daily_questions')
        .insert({
          question_date: today,
          question_text: cleanText(question.question),
          correct_answer: cleanText(question.correct_answer),
          incorrect_answers: question.incorrect_answers.map((ans: string) => cleanText(ans))
        })
        .select()
        .single();

      if (insertError) {
        // Handle race condition
        if (insertError.code === '23505') {
          const { data: raceQuestion } = await supabase
            .from('daily_questions')
            .select('*')
            .eq('question_date', today)
            .single();
          questionData = raceQuestion;
        } else {
          throw new Error(`Insert error: ${insertError.message}`);
        }
      } else {
        questionData = storedQuestion;
      }
    }

    // STEP 4: Get or create user attempt
    const { data: existingAttempt, error: attemptFetchError } = await supabase
      .from('user_question_attempts')
      .select('*')
      .eq('device_id', deviceId)
      .eq('question_date', today)
      .single();

    let userAttempt = null;

    if (attemptFetchError && attemptFetchError.code !== 'PGRST116') {
      throw new Error(`User attempt fetch error: ${attemptFetchError.message}`);
    }

    if (!existingAttempt) {
      // Create new attempt
      const attemptData = {
        device_id: deviceId,
        question_date: today,
        daily_question_id: questionData.id,
        has_attempted: false,
        is_completed: false
      };

      const { data: newAttempt, error: attemptInsertError } = await supabase
        .from('user_question_attempts')
        .insert(attemptData)
        .select()
        .single();

      if (attemptInsertError) {
        throw new Error(`Attempt insert error: ${attemptInsertError.message}`);
      }
      
      userAttempt = newAttempt;
    } else {
      userAttempt = existingAttempt;
    }

    // STEP 5: Return response in expected format
    return new Response(
      JSON.stringify({
        id: questionData.id,
        question: questionData.question_text,
        correct_answer: questionData.correct_answer,
        incorrect_answers: questionData.incorrect_answers,
        user_status: {
          has_attempted: userAttempt.has_attempted,
          is_completed: userAttempt.is_completed,
          can_attempt: !userAttempt.is_completed
        }
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});