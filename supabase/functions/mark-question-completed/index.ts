// @ts-ignore - Deno runtime types not available in development
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - ESM module types not available in development
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Declare Deno global for development (exists at runtime)
declare const Deno: any;

// Initialize Supabase client with service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Helper function to get today's date in YYYY-MM-DD format (UTC)
const getTodaysDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'exp://localhost:19000',  // Expo development server
  'http://localhost:19006', // Expo web development
  'https://localhost:19006', // Expo web development (HTTPS)
];

const getCorsHeaders = (requestOrigin: string | null) => {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin) 
    ? requestOrigin 
    : ALLOWED_ORIGINS[0];
    
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    // Get device ID from headers
    const deviceId = req.headers.get('x-device-id') || req.headers.get('x-forwarded-for') || 'anonymous';
    const questionDate = getTodaysDate();

    // Parse request body for additional data (if needed)
    let requestData = {};
    try {
      const body = await req.text();
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (parseError) {
      // Ignore parsing errors for empty body
    }

    // Mark the user's attempt as completed
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('user_question_attempts')
      .update({
        has_attempted: true,
        is_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('device_id', deviceId)
      .eq('question_date', questionDate)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to mark question as completed: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Question marked as completed',
        user_status: {
          has_attempted: updatedAttempt.has_attempted,
          is_completed: updatedAttempt.is_completed,
          can_attempt: false
        }
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: 'Failed to mark question as completed' }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});