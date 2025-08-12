/*
 * Quizr - Daily Trivia App
 * Supabase client configuration and validation
 * Copyright 2025 Kibum Park
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Enhanced environment variable validation
function validateSupabaseEnvironment(): { url: string; anonKey: string } {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  // Check for missing environment variables
  if (!supabaseUrl) {
    throw new Error(
      'Missing required environment variable: EXPO_PUBLIC_SUPABASE_URL. ' +
      'Please ensure your Supabase project URL is configured in your environment.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing required environment variable: EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please ensure your Supabase anonymous key is configured in your environment.'
    );
  }

  // Validate data types
  if (typeof supabaseUrl !== 'string' || supabaseUrl.trim().length === 0) {
    throw new Error('Invalid EXPO_PUBLIC_SUPABASE_URL: must be a non-empty string');
  }

  if (typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim().length === 0) {
    throw new Error('Invalid EXPO_PUBLIC_SUPABASE_ANON_KEY: must be a non-empty string');
  }

  const trimmedUrl = supabaseUrl.trim();
  const trimmedKey = supabaseAnonKey.trim();

  // Validate URL format
  try {
    const url = new URL(trimmedUrl);
    
    // Additional validation for Supabase URL format
    if (!url.hostname.includes('supabase')) {
      console.warn('EXPO_PUBLIC_SUPABASE_URL does not appear to be a Supabase URL. Expected format: https://your-project.supabase.co');
    }
    
    if (url.protocol !== 'https:') {
      throw new Error('EXPO_PUBLIC_SUPABASE_URL must use HTTPS protocol for security');
    }
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid EXPO_PUBLIC_SUPABASE_URL format: ${error.message}`);
    }
    throw new Error('Invalid EXPO_PUBLIC_SUPABASE_URL format: must be a valid HTTPS URL');
  }

  // Validate Supabase anonymous key format (basic checks)
  if (trimmedKey.length < 50) {
    console.warn('EXPO_PUBLIC_SUPABASE_ANON_KEY appears to be too short. Supabase keys are typically longer.');
  }

  // Check for common mistakes
  if (trimmedKey.includes('service_role')) {
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY appears to be a service role key. ' +
      'For security reasons, only use anonymous (public) keys in client applications.'
    );
  }

  return {
    url: trimmedUrl,
    anonKey: trimmedKey
  };
}

// Validate environment and create client
const config = validateSupabaseEnvironment();

export const supabase = createClient(config.url, config.anonKey, {
  db: { schema: 'public' },
  auth: { persistSession: true },
  global: { 
    headers: {
      'X-Client-Info': 'quizr-mobile-app'
    }
  }
});

// Export configuration validation function for testing/debugging
export const validateConfiguration = (): boolean => {
  try {
    validateSupabaseEnvironment();
    return true;
  } catch (error) {
    console.error('Supabase configuration validation failed:', error);
    return false;
  }
};