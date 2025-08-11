/*
 * Quizr - Daily Trivia App
 * Custom hook for fetching and managing trivia questions
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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { logger } from '@/utils/logger';
import { trackRender, trackMemoization, measurePerformance } from '@/utils/performance';
import { useAsyncErrorHandler } from '@/components/AsyncErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceId } from '@/utils/deviceId';

interface QuestionData {
  question_text: string;
  answer_options: string[];
  correct_answer: string;
}

interface UserStatus {
  has_attempted: boolean;
  is_completed: boolean;
  can_attempt: boolean;
}

interface UseTriviaQuestionReturn {
  question: QuestionData | null;
  userStatus: UserStatus | null;
  loading: boolean;
  error: string | null;
  errorObject: any | null;
  refetch: () => Promise<void>;
  markCompleted: () => Promise<void>;
}

// Helper function to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  return text
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
};

// Helper function to shuffle array using Fisher-Yates algorithm (more efficient)
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const DAILY_QUESTION_CACHE_KEY = 'quizr_daily_question_cache';

export function useTriviaQuestion(): UseTriviaQuestionReturn {
  const [rawQuestionData, setRawQuestionData] = useState<any | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorObject, setErrorObject] = useState<any | null>(null);
  const handleAsyncError = useAsyncErrorHandler();

  // Helper to get today's date string
  const getTodaysDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper to load from local cache
  const loadFromCache = async (): Promise<{ question: any; userStatus: UserStatus } | null> => {
    try {
      const cached = await AsyncStorage.getItem(DAILY_QUESTION_CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (parsedCache.date === getTodaysDate()) {
          logger.debug('Loaded question from cache');
          return parsedCache;
        }
      }
    } catch (error) {
      logger.warn('Failed to load from cache:', error);
    }
    return null;
  };

  // Helper to save to local cache
  const saveToCache = async (questionData: any, userStatus: UserStatus) => {
    try {
      const cacheData = {
        date: getTodaysDate(),
        question: questionData,
        userStatus
      };
      await AsyncStorage.setItem(DAILY_QUESTION_CACHE_KEY, JSON.stringify(cacheData));
      logger.debug('Saved question to cache');
    } catch (error) {
      logger.warn('Failed to save to cache:', error);
    }
  };

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorObject(null);
    
    logger.debug('Starting daily question fetch');
    
    try {
      // First try to load from cache
      const cached = await loadFromCache();
      if (cached) {
        setRawQuestionData(cached.question);
        setUserStatus(cached.userStatus);
        setLoading(false);
        return;
      }

      // Get device ID for server request
      const deviceId = await getDeviceId();
      
      // Fetch from server with device ID
      const { data, error: fetchError } = await supabase.functions.invoke('get-trivia-question', {
        headers: {
          'x-device-id': deviceId
        }
      });

      if (fetchError) {
        logger.error('Error fetching daily question:', fetchError);
        setError('Failed to load daily question. Please try again later.');
        setErrorObject(fetchError);
        setRawQuestionData(null);
        setUserStatus(null);
      } else if (data) {
        logger.debug('Question data received from server');
        const { user_status, ...questionData } = data;
        
        setRawQuestionData(questionData);
        setUserStatus(user_status);
        setError(null);
        setErrorObject(null);

        // Cache the data
        await saveToCache(questionData, user_status);
      } else {
        logger.warn('No question data received');
        const noDataError = new Error('No question found for today. Check back tomorrow!');
        setError('No question found for today. Check back tomorrow!');
        setErrorObject(noDataError);
        setRawQuestionData(null);
        setUserStatus(null);
      }
    } catch (err) {
      logger.error('Unexpected error fetching question:', err);
      
      if (err instanceof Error) {
        handleAsyncError(err);
      }
      
      setError('An unexpected error occurred. Please try again.');
      setErrorObject(err);
      setRawQuestionData(null);
      setUserStatus(null);
    } finally {
      setLoading(false);
    }
  }, [handleAsyncError]);

  const markCompleted = useCallback(async () => {
    if (!userStatus || userStatus.is_completed) return;

    try {
      const deviceId = await getDeviceId();
      
      const { data, error: markError } = await supabase.functions.invoke('mark-question-completed', {
        headers: {
          'x-device-id': deviceId
        }
      });

      if (markError) {
        logger.error('Error marking question as completed:', markError);
        throw new Error('Failed to mark question as completed');
      }

      if (data && data.user_status) {
        const newUserStatus = data.user_status;
        setUserStatus(newUserStatus);
        
        // Update cache with new status
        if (rawQuestionData) {
          await saveToCache(rawQuestionData, newUserStatus);
        }
        
        logger.debug('Question marked as completed successfully');
      }
    } catch (error) {
      logger.error('Failed to mark question as completed:', error);
      throw error;
    }
  }, [userStatus, rawQuestionData]);

  // Memoized processing of question data
  const question = useMemo(() => {
    if (!rawQuestionData) {
      trackMemoization('useTriviaQuestion', true);
      return null;
    }
    
    trackMemoization('useTriviaQuestion', false);
    logger.debug('Processing question data with memoization...');
    
    return measurePerformance('question-data-processing', () => {
      const decodedQuestion = decodeHtmlEntities(rawQuestionData.question || '');
      const decodedIncorrectAnswers = (rawQuestionData.incorrect_answers || []).map((ans: string) => decodeHtmlEntities(ans || ''));
      const decodedCorrectAnswer = decodeHtmlEntities(rawQuestionData.correct_answer || '');

      const questionData: QuestionData = {
        question_text: decodedQuestion,
        answer_options: shuffleArray([...decodedIncorrectAnswers, decodedCorrectAnswer]),
        correct_answer: decodedCorrectAnswer,
      };
      
      logger.debug('Question data processed successfully with memoization');
      return questionData;
    });
  }, [rawQuestionData]);

  useEffect(() => {
    trackRender('useTriviaQuestion');
    fetchQuestion();
  }, [fetchQuestion]);

  return {
    question,
    userStatus,
    loading,
    error,
    errorObject,
    refetch: fetchQuestion,
    markCompleted,
  };
}