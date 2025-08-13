/*
 * Quizr - Daily Trivia App
 * Push notification utilities and configuration
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

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Environment variable validation utilities
interface EnvironmentConfig {
  projectId: string;
}

function validateEnvironmentVariables(): EnvironmentConfig {
  const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
  
  // Check if project ID exists
  if (!projectId) {
    throw new Error(
      'Missing required environment variable: EXPO_PUBLIC_PROJECT_ID. ' +
      'Please ensure this is set in your environment configuration.'
    );
  }
  
  // Validate project ID format - should be a UUID-like string
  if (typeof projectId !== 'string' || projectId.trim().length === 0) {
    throw new Error(
      'Invalid EXPO_PUBLIC_PROJECT_ID: must be a non-empty string'
    );
  }
  
  // Basic UUID format validation (8-4-4-4-12 characters)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId.trim())) {
    throw new Error(
      'Invalid EXPO_PUBLIC_PROJECT_ID format: must be a valid UUID ' +
      '(e.g., "123e4567-e89b-12d3-a456-426614174000")'
    );
  }
  
  return {
    projectId: projectId.trim()
  };
}

// Custom error class for notification-related errors
export class NotificationError extends Error {
  constructor(
    message: string,
    public readonly code: 'PERMISSION_DENIED' | 'CONFIG_ERROR' | 'TOKEN_ERROR',
    public readonly userMessage?: string
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  try {
    // Validate environment configuration first
    const config = validateEnvironmentVariables();

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Handle permission denial
    if (finalStatus !== 'granted') {
      throw new NotificationError(
        'Push notification permissions not granted',
        'PERMISSION_DENIED',
        'Please enable notifications in your device settings to receive daily trivia questions.'
      );
    }

    // Get the push token
    try {
      const tokenResponse = await Notifications.getExpoPushTokenAsync({ 
        projectId: config.projectId 
      });
      
      if (!tokenResponse || !tokenResponse.data) {
        throw new NotificationError(
          'Failed to obtain push token from Expo',
          'TOKEN_ERROR',
          'Unable to register for notifications. Please try again later.'
        );
      }
      
      token = tokenResponse.data;
      
      // Validate token format
      if (!token || typeof token !== 'string' || !token.startsWith('ExponentPushToken[')) {
        throw new NotificationError(
          `Invalid push token format received: ${token}`,
          'TOKEN_ERROR',
          'Invalid notification token received. Please try again.'
        );
      }
      
    } catch (error) {
      if (error instanceof NotificationError) {
        throw error;
      }
      
      throw new NotificationError(
        `Failed to obtain push token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TOKEN_ERROR',
        'Failed to register for notifications. Please check your internet connection and try again.'
      );
    }

    return token;
    
  } catch (error) {
    // Handle different types of errors appropriately
    if (error instanceof NotificationError) {
      // Log the technical error for debugging
      console.error(`[NotificationError:${error.code}]`, error.message);
      
      // Re-throw with user-friendly message
      throw error;
    }
    
    // Handle unexpected errors
    console.error('Unexpected error during push notification registration:', error);
    throw new NotificationError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CONFIG_ERROR',
      'An unexpected error occurred. Please try again later.'
    );
  }
}

// Utility function to check if notifications are properly configured
export function validateNotificationConfig(): boolean {
  try {
    validateEnvironmentVariables();
    return true;
  } catch (error) {
    console.error('Notification configuration validation failed:', error);
    return false;
  }
}