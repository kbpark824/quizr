import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define a constant for the Open Trivia Database API success response code
const TRIVIA_API_SUCCESS_CODE = 0;

// Content validation constants
const MAX_QUESTION_LENGTH = 500;
const MAX_ANSWER_LENGTH = 200;
const MAX_ANSWERS_COUNT = 10;

// Input validation and sanitization functions
function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    throw new Error('Invalid input: expected string');
  }
  
  // Remove HTML tags and potentially dangerous characters
  let sanitized = text
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/&lt;script/gi, '') // Remove encoded script tags
    .replace(/&lt;\/script/gi, '')
    // Decode common HTML entities
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

  // Trim whitespace and normalize spaces
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  return sanitized;
}

function validateQuestionData(data: any): any {
  // Validate response structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid API response: not an object');
  }
  
  if (typeof data.response_code !== 'number') {
    throw new Error('Invalid API response: missing or invalid response_code');
  }
  
  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error('Invalid API response: missing or empty results array');
  }
  
  const question = data.results[0];
  
  // Validate question structure
  if (!question || typeof question !== 'object') {
    throw new Error('Invalid question data: not an object');
  }
  
  // Validate and sanitize question text
  if (!question.question || typeof question.question !== 'string') {
    throw new Error('Invalid question data: missing or invalid question text');
  }
  
  const sanitizedQuestion = sanitizeText(question.question);
  if (sanitizedQuestion.length === 0) {
    throw new Error('Invalid question data: empty question after sanitization');
  }
  
  if (sanitizedQuestion.length > MAX_QUESTION_LENGTH) {
    throw new Error(`Invalid question data: question too long (${sanitizedQuestion.length} > ${MAX_QUESTION_LENGTH})`);
  }
  
  // Validate and sanitize correct answer
  if (!question.correct_answer || typeof question.correct_answer !== 'string') {
    throw new Error('Invalid question data: missing or invalid correct answer');
  }
  
  const sanitizedCorrectAnswer = sanitizeText(question.correct_answer);
  if (sanitizedCorrectAnswer.length === 0) {
    throw new Error('Invalid question data: empty correct answer after sanitization');
  }
  
  if (sanitizedCorrectAnswer.length > MAX_ANSWER_LENGTH) {
    throw new Error(`Invalid question data: correct answer too long (${sanitizedCorrectAnswer.length} > ${MAX_ANSWER_LENGTH})`);
  }
  
  // Validate and sanitize incorrect answers
  if (!Array.isArray(question.incorrect_answers)) {
    throw new Error('Invalid question data: missing or invalid incorrect answers array');
  }
  
  if (question.incorrect_answers.length === 0 || question.incorrect_answers.length > MAX_ANSWERS_COUNT) {
    throw new Error(`Invalid question data: incorrect answers count out of range (0-${MAX_ANSWERS_COUNT})`);
  }
  
  const sanitizedIncorrectAnswers = question.incorrect_answers.map((answer: any, index: number) => {
    if (typeof answer !== 'string') {
      throw new Error(`Invalid question data: incorrect answer ${index} is not a string`);
    }
    
    const sanitized = sanitizeText(answer);
    if (sanitized.length === 0) {
      throw new Error(`Invalid question data: incorrect answer ${index} is empty after sanitization`);
    }
    
    if (sanitized.length > MAX_ANSWER_LENGTH) {
      throw new Error(`Invalid question data: incorrect answer ${index} too long (${sanitized.length} > ${MAX_ANSWER_LENGTH})`);
    }
    
    return sanitized;
  });
  
  // Validate other optional fields if present
  const validatedQuestion: any = {
    question: sanitizedQuestion,
    correct_answer: sanitizedCorrectAnswer,
    incorrect_answers: sanitizedIncorrectAnswers,
  };
  
  // Copy safe optional fields
  if (question.category && typeof question.category === 'string') {
    validatedQuestion.category = sanitizeText(question.category);
  }
  
  if (question.type && typeof question.type === 'string') {
    validatedQuestion.type = sanitizeText(question.type);
  }
  
  if (question.difficulty && typeof question.difficulty === 'string') {
    validatedQuestion.difficulty = sanitizeText(question.difficulty);
  }
  
  return validatedQuestion;
}

// Get the API URL from environment variables
// In a Supabase Edge Function, environment variables are accessed via Deno.env.get()
const OPEN_TRIVIA_DB_API_URL = Deno.env.get('OPEN_TRIVIA_DB_API_URL') || "https://opentdb.com/api.php?amount=1&type=multiple";

// Enhanced in-memory rate limiting with memory leak prevention
interface RateLimitRecord {
  count: number;
  resetTime: number;
  lastAccess: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxStoreSize: number;
  private readonly cleanupIntervalMs: number;
  private lastCleanup: number;

  constructor(
    windowMs: number = 60 * 1000, // 1 minute window
    maxRequests: number = 10, // Max 10 requests per minute per IP
    maxStoreSize: number = 1000, // Max 1000 unique IPs stored
    cleanupIntervalMs: number = 5 * 60 * 1000 // Cleanup every 5 minutes
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.maxStoreSize = maxStoreSize;
    this.cleanupIntervalMs = cleanupIntervalMs;
    this.lastCleanup = Date.now();
  }

  isRateLimited(clientId: string): boolean {
    const now = Date.now();
    
    // Perform cleanup if needed
    this.performCleanupIfNeeded(now);
    
    const record = this.store.get(clientId);
    
    // If no record exists or window has expired, create new record
    if (!record || now > record.resetTime) {
      // Check if we need to make space for new entries
      if (this.store.size >= this.maxStoreSize && !record) {
        this.evictOldestEntries();
      }
      
      this.store.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs,
        lastAccess: now
      });
      return false;
    }
    
    // Update last access time
    record.lastAccess = now;
    
    // If within rate limit, increment and allow
    if (record.count < this.maxRequests) {
      record.count++;
      return false;
    }
    
    // Rate limit exceeded
    return true;
  }

  private performCleanupIfNeeded(now: number): void {
    // Only cleanup if enough time has passed
    if (now - this.lastCleanup < this.cleanupIntervalMs) {
      return;
    }
    
    this.cleanup(now);
    this.lastCleanup = now;
  }

  private cleanup(now: number): void {
    const expiredKeys: string[] = [];
    
    for (const [clientId, record] of this.store.entries()) {
      // Remove expired records (beyond reset time + buffer)
      if (now > record.resetTime + this.windowMs) {
        expiredKeys.push(clientId);
      }
    }
    
    for (const key of expiredKeys) {
      this.store.delete(key);
    }
  }

  private evictOldestEntries(): void {
    // Convert to array and sort by last access time
    const entries = Array.from(this.store.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    
    // Remove oldest 25% of entries to make room
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.store.delete(entries[i][0]);
    }
  }

  // Get current store statistics for monitoring
  getStats(): { size: number; maxSize: number; lastCleanup: number } {
    return {
      size: this.store.size,
      maxSize: this.maxStoreSize,
      lastCleanup: this.lastCleanup
    };
  }

  // Force cleanup for testing/maintenance
  forceCleanup(): void {
    this.cleanup(Date.now());
    this.lastCleanup = Date.now();
  }
}

// Create global rate limiter instance
const rateLimiter = new RateLimiter();

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'exp://localhost:19000',  // Expo development server
  'http://localhost:19006', // Expo web development
  'https://localhost:19006', // Expo web development (HTTPS)
  // Add your production domain when deployed:
  // 'https://yourdomain.com'
];

const getCorsHeaders = (requestOrigin: string | null) => {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin) 
    ? requestOrigin 
    : ALLOWED_ORIGINS[0]; // Default to first allowed origin
    
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
    })
  }

  // Rate limiting check with enhanced memory management
  const clientId = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  
  if (rateLimiter.isRateLimited(clientId)) {
    // Optional: Log rate limit statistics for monitoring in development
    const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
    if (isDev) {
      const stats = rateLimiter.getStats();
      console.log('Rate limit exceeded', { clientId, stats });
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60
      }),
      { 
        status: 429, 
        headers: { 
          "Content-Type": "application/json", 
          "Retry-After": "60",
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Window": "60",
          ...corsHeaders 
        } 
      }
    );
  }

  try {
    const response = await fetch(OPEN_TRIVIA_DB_API_URL);
    
    // Validate HTTP response
    if (!response.ok) {
      throw new Error(`OpenTriviaDB API returned ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('OpenTriviaDB API returned non-JSON response');
    }
    
    const data = await response.json();
    
    // Validate and sanitize the response data
    const validatedQuestion = validateQuestionData(data);
    
    if (data.response_code !== TRIVIA_API_SUCCESS_CODE) {
      throw new Error("Failed to fetch trivia question from Open Trivia Database API");
    }

    return new Response(
      JSON.stringify(validatedQuestion),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    // Log error details for debugging (consider using structured logging in production)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Don't expose internal error details to client in production
    const clientErrorMessage = errorMessage.includes('OpenTriviaDB') 
      ? 'Failed to fetch trivia question. Please try again later.'
      : 'An error occurred while processing your request.';
    
    return new Response(
      JSON.stringify({ error: clientErrorMessage }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      },
    );
  }
});