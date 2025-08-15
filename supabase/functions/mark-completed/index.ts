import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: any;

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const deviceId = req.headers.get('x-device-id') || 'anonymous';
    const today = new Date().toISOString().split('T')[0];

    // Mark the user's attempt as completed
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('user_question_attempts')
      .update({
        has_attempted: true,
        is_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('device_id', deviceId)
      .eq('question_date', today)
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