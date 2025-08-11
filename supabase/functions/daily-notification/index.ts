// @ts-ignore - ESM import from CDN in Deno Edge Runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

// Types for Deno Edge Runtime
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

// Structured logging utility for Edge Functions
interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

class EdgeLogger {
  private requestId: string;

  constructor(requestId: string = crypto.randomUUID()) {
    this.requestId = requestId;
  }

  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: this.requestId,
      service: 'daily-notification',
      ...context
    };

    // Only log errors and warnings in production to reduce noise
    const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
    
    if (level === 'error' || level === 'warn' || isDev) {
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }
}

// Function to sanitize sensitive data from logs
function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  
  // Remove or mask sensitive fields
  const sensitiveFields = ['token', 'key', 'secret', 'password', 'authorization'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = `[REDACTED-${field.toUpperCase()}]`;
    }
  }

  // Truncate long arrays for readability
  if (Array.isArray(sanitized) && sanitized.length > 5) {
    return [
      ...sanitized.slice(0, 3),
      `... ${sanitized.length - 3} more items`,
      sanitized[sanitized.length - 1]
    ];
  }

  return sanitized;
}

// Function to sanitize and validate notification content
function sanitizeNotificationContent(questionData: any): string | null {
  if (!questionData || typeof questionData !== 'object') {
    return null;
  }

  const question = questionData.question;
  if (!question || typeof question !== 'string') {
    return null;
  }

  // Remove HTML tags and decode common HTML entities
  let sanitized = question
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');

  // Trim whitespace and limit length
  sanitized = sanitized.trim();
  if (sanitized.length === 0) {
    return null;
  }

  // Limit notification length for better UX
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + '...';
  }

  return sanitized;
}

Deno.serve(async (req: Request) => {
  const logger = new EdgeLogger();
  
  try {
    // Log request method and URL for debugging
    logger.info('Daily notification function started', { 
      operation: 'daily-notification-start',
      metadata: {
        method: req.method,
        url: req.url
      }
    });

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // This function should typically be called via POST (e.g., from cron)
    if (req.method !== 'POST') {
      logger.warn('Invalid request method', { 
        operation: 'method-validation',
        metadata: { method: req.method, expected: 'POST' }
      });
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { 
          status: 405,
          headers: { 
            'Content-Type': 'application/json',
            'Allow': 'POST'
          }
        }
      );
    }
    
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      logger.error('Missing required environment variables', {
        operation: 'env-validation',
        metadata: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      });
      return new Response(
        JSON.stringify({ error: 'Configuration error' }), 
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch daily question
    logger.debug('Fetching daily question', { operation: 'fetch-question' });
    const { data: question, error: questionError } = await supabase.functions.invoke('get-trivia-question');

    if (questionError) {
      logger.error('Failed to fetch daily question', {
        operation: 'fetch-question',
        metadata: sanitizeForLogging(questionError)
      });
      return new Response(JSON.stringify({ error: 'Error fetching daily question' }), { status: 500 });
    }

    if (!question) {
      logger.info('No question available for today', { operation: 'question-validation' });
      return new Response(JSON.stringify({ message: 'No question found for today' }), { status: 200 });
    }

    // Validate and sanitize question data
    logger.debug('Sanitizing question content', { operation: 'sanitize-question' });
    const sanitizedQuestion = sanitizeNotificationContent(question);
    
    if (!sanitizedQuestion) {
      logger.error('Question data failed sanitization', { operation: 'sanitize-question' });
      return new Response(JSON.stringify({ error: 'Invalid question data' }), { status: 400 });
    }

    // Fetch all push tokens
    logger.debug('Fetching push tokens', { operation: 'fetch-tokens' });
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token');

    if (tokensError) {
      logger.error('Failed to fetch push tokens', {
        operation: 'fetch-tokens',
        metadata: sanitizeForLogging(tokensError)
      });
      return new Response(JSON.stringify({ error: 'Error fetching push tokens' }), { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      logger.info('No push tokens registered', { 
        operation: 'token-validation',
        metadata: { tokenCount: 0 }
      });
      return new Response(JSON.stringify({ message: 'No push tokens registered' }), { status: 200 });
    }

    logger.info('Preparing notifications', {
      operation: 'prepare-notifications',
      metadata: { 
        tokenCount: tokens.length,
        questionLength: sanitizedQuestion.length
      }
    });

    // Create notification messages (sanitize tokens for logging)
    const messages = tokens.map((record: any) => ({
      to: record.token,
      sound: 'default' as const,
      title: 'Quizr Daily Trivia!',
      body: sanitizedQuestion,
    }));

    // Send notifications using Expo Push API
    const expoPushApiUrl = Deno.env.get('EXPO_PUSH_API_URL') ?? 'https://exp.host/--/api/v2/push/send';
    
    logger.debug('Sending notifications to Expo Push API', {
      operation: 'send-notifications',
      metadata: { 
        messageCount: messages.length,
        apiUrl: expoPushApiUrl 
      }
    });

    const expoResponse = await fetch(expoPushApiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const responseData = await expoResponse.json();

    if (!expoResponse.ok) {
      logger.error('Expo Push API returned error', {
        operation: 'expo-api-error',
        metadata: {
          status: expoResponse.status,
          statusText: expoResponse.statusText,
          response: sanitizeForLogging(responseData)
        }
      });
      return new Response(
        JSON.stringify({ error: 'Failed to send notifications' }), 
        { status: expoResponse.status }
      );
    }

    // Check for individual notification errors
    if (responseData.errors && responseData.errors.length > 0) {
      logger.warn('Some notifications failed to send', {
        operation: 'partial-notification-failure',
        metadata: {
          errorCount: responseData.errors.length,
          totalSent: messages.length,
          errors: sanitizeForLogging(responseData.errors)
        }
      });
      // In production, you might want to handle individual errors here
      // e.g., remove invalid tokens from database
    }

    const successCount = responseData.data ? responseData.data.length : messages.length;
    logger.info('Notifications sent successfully', {
      operation: 'notifications-completed',
      metadata: {
        successCount,
        totalAttempted: messages.length,
        hasErrors: !!(responseData.errors && responseData.errors.length > 0)
      }
    });

    return new Response(
      JSON.stringify({ 
        message: 'Notifications sent',
        summary: {
          sent: successCount,
          total: messages.length
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Unexpected error in daily notification function', {
      operation: 'uncaught-error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});