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
import Constants from 'expo-constants';

// Development Supabase configuration (used in Expo Go)
const DEV_SUPABASE_CONFIG = {
  url: 'https://yjsprdtlqjrwlupfngko.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqc3ByZHRscWpyd2x1cGZuZ2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTAwNjMsImV4cCI6MjA3MDc2NjA2M30.5rkuDw1E-lzXte94DfGLSFpvLhIlcQz3veG8vldCFXI'
};

// Check if should use development Supabase
function shouldUseDevelopmentSupabase(): boolean {
  // Use dev config in Expo Go
  const isExpoGo = Constants.executionEnvironment !== 'standalone';
  
  // Use dev config for development and preview builds
  const buildProfile = Constants.expoConfig?.extra?.eas?.buildProfile;
  const isDevelopmentBuild = buildProfile === 'development' || buildProfile === 'preview';
  
  return isExpoGo || isDevelopmentBuild;
}

// Enhanced configuration validation
function validateSupabaseConfiguration(): { url: string; anonKey: string } {
  // Use development config for Expo Go and development/preview builds
  if (shouldUseDevelopmentSupabase()) {
    const context = Constants.executionEnvironment !== 'standalone' ? 'Expo Go' : 'development/preview build';
    console.log(`🔧 Using development Supabase instance (${context} detected)`);
    console.log(`Dev URL: ${DEV_SUPABASE_CONFIG.url.substring(0, 30)}...`);
    return {
      url: DEV_SUPABASE_CONFIG.url,
      anonKey: DEV_SUPABASE_CONFIG.anonKey
    };
  }

  // Use production config for production builds only
  console.log('🚀 Using production Supabase instance (production build)');
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  
  console.log('Production config check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 30) + '...',
    executionEnv: Constants.executionEnvironment,
    buildProfile: Constants.expoConfig?.extra?.eas?.buildProfile
  });

  // Check for missing configuration
  if (!supabaseUrl) {
    throw new Error(
      'Missing required configuration: supabaseUrl. ' +
      'Please ensure your Supabase project URL is configured in app.json extra section.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing required configuration: supabaseAnonKey. ' +
      'Please ensure your Supabase anonymous key is configured in app.json extra section.'
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

// Validate configuration and create client
const config = validateSupabaseConfiguration();

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
    validateSupabaseConfiguration();
    return true;
  } catch (error) {
    console.error('Supabase configuration validation failed:', error);
    return false;
  }
};