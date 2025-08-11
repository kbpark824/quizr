import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define a constant for the Open Trivia Database API success response code
const TRIVIA_API_SUCCESS_CODE = 0;

// Get the API URL from environment variables
// In a Supabase Edge Function, environment variables are accessed via Deno.env.get()
const OPEN_TRIVIA_DB_API_URL = Deno.env.get('OPEN_TRIVIA_DB_API_URL') || "https://opentdb.com/api.php?amount=1&type=multiple";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*', // CONSIDER: Restrict this to your frontend's domain if this API is not intended for public consumption.
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      },
      status: 204,
    })
  }

  try {
    const response = await fetch(OPEN_TRIVIA_DB_API_URL);
    console.log("Response from Open Trivia Database API:", response);
    const data = await response.json();
    console.log("Data from Open Trivia Database API:", data);

    if (data.response_code !== TRIVIA_API_SUCCESS_CODE) {
      throw new Error("Failed to fetch trivia question from Open Trivia Database API");
    }

    const question = data.results[0];

    return new Response(
      JSON.stringify(question),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }, // CONSIDER: Restrict this to your frontend's domain if this API is not intended for public consumption.
    );
  } catch (error) {
    console.error("Error in get-trivia-question function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});