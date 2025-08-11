/*
 * Quizr - Daily Trivia App
 * Root layout component with navigation, notifications, and theming
 * Copyright (C) 2025  Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';
import React, { useEffect, useRef } from 'react';
import { supabase } from '@/supabaseClient';

// Removed unused useColorScheme import
import { registerForPushNotificationsAsync, NotificationError } from '../utils/notifications';
import { ThemeProvider } from '@/providers/ThemeProvider'; // Our custom ThemeProvider
import { logger } from '@/utils/logger';
import { AppErrorBoundary } from '@/components/ErrorBoundary';

// Import performance debugger in development
if (__DEV__) {
  require('@/utils/performanceDebugger');
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const sendPushTokenToSupabase = async (token: string) => {
  // Validate Expo push token format
  if (!token || typeof token !== 'string') {
    logger.error('Invalid token: Token must be a non-empty string');
    return;
  }
  
  if (!token.startsWith('ExponentPushToken[') || !token.endsWith(']')) {
    logger.error('Invalid token format: Expected ExponentPushToken[...] format');
    return;
  }
  
  // Extract the token ID and validate it contains only valid characters
  const tokenId = token.slice(18, -1); // Remove 'ExponentPushToken[' and ']'
  if (!/^[A-Za-z0-9_-]+$/.test(tokenId)) {
    logger.error('Invalid token ID: Contains invalid characters');
    return;
  }
  
  logger.debug('Attempting to upsert validated token to Supabase');
  const { error } = await supabase.from('push_tokens').upsert({ token: token }, { onConflict: 'token' });
  
  if (error) {
    logger.error('Error saving push token to Supabase:', error);
  } else {
    logger.debug('Push token saved to Supabase successfully.');
  }
};

export default function RootLayout() {
  // const colorScheme = useColorScheme(); // No longer needed here, handled by ThemeProvider
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Log configuration status without exposing sensitive values
    logger.debug('Environment configuration check:', {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ? 'Set' : 'Missing'
    });

    logger.debug('Attempting to register for push notifications...');
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        logger.debug('Expo Push Token obtained');
        sendPushTokenToSupabase(token);
      } else {
        logger.warn('No Expo Push Token obtained.');
      }
    }).catch(error => {
      if (error instanceof NotificationError) {
        // Log the specific error type and user-friendly message
        logger.error(`Push notification registration failed [${error.code}]:`, error.message);
        if (error.userMessage) {
          logger.warn('User message:', error.userMessage);
        }
      } else {
        logger.error('Unexpected error during push notification registration:', error);
      }
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      logger.debug('Notification received:', notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      logger.debug('Notification response received:', response);
      // Navigate to the question screen when notification is tapped
      router.push('/(tabs)');
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AppErrorBoundary>
      <ThemeProvider> {/* Use our custom ThemeProvider */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppErrorBoundary>
  );
}