import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '../supabaseClient';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [dailyQuestion, setDailyQuestion] = useState(null);

  useEffect(() => {
    const fetchDailyQuestion = async () => {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('question_date', today)
        .single();

      if (error) {
        console.error('Error fetching daily question:', error);
      } else if (data) {
        setDailyQuestion(data);
        console.log('Daily Question:', data);
      } else {
        console.log('No question found for today.');
      }
    };

    fetchDailyQuestion();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
