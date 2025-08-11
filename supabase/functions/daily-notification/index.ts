import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // Fetch daily question
  const { data: question, error: questionError } = await supabase.functions.invoke('get-trivia-question');

  if (questionError) {
    console.error('Error fetching daily question:', questionError)
    return new Response(JSON.stringify({ error: 'Error fetching daily question' }), { status: 500 })
  }

  if (!question) {
    console.log('No question found for today.')
    return new Response(JSON.stringify({ message: 'No question found for today' }), { status: 200 })
  }

  // Fetch all push tokens
  const { data: tokens, error: tokensError } = await supabase
    .from('push_tokens')
    .select('token')

  if (tokensError) {
    console.error('Error fetching push tokens:', tokensError)
    return new Response(JSON.stringify({ error: 'Error fetching push tokens' }), { status: 500 })
  }

  if (!tokens || tokens.length === 0) {
    console.log('No push tokens registered.')
    return new Response(JSON.stringify({ message: 'No push tokens registered' }), { status: 200 })
  }

  const messages = tokens.map(record => ({
    to: record.token,
    sound: 'default',
    title: 'Quizr Daily Trivia!',
    body: question.question,
  }))

  // Send notifications using Expo Push API
  const expoPushApiUrl = Deno.env.get('EXPO_PUSH_API_URL') ?? 'https://exp.host/--/api/v2/push/send';
  const expoResponse = await fetch(expoPushApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })

  const responseData = await expoResponse.json()

  if (!expoResponse.ok) {
    console.error('Error sending notifications to Expo Push API:', responseData);
    return new Response(JSON.stringify({ error: 'Failed to send notifications', details: responseData }), { status: expoResponse.status });
  }

  if (responseData.errors && responseData.errors.length > 0) {
    console.error('Errors in Expo Push API response:', responseData.errors);
    // You might want to handle individual errors here, e.g., remove invalid tokens
  }

  console.log('Expo Push API Response:', responseData)

  return new Response(
    JSON.stringify({ message: 'Notifications sent', expoResponse: responseData }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})