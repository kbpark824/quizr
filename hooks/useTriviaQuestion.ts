import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { logger } from '@/utils/logger';
import { trackRender, trackMemoization, measurePerformance } from '@/utils/performance';
import { useAsyncErrorHandler } from '@/components/AsyncErrorBoundary';

interface QuestionData {
  question_text: string;
  answer_options: string[];
  correct_answer: string;
}

interface UseTriviaQuestionReturn {
  question: QuestionData | null;
  loading: boolean;
  error: string | null;
  errorObject: any | null; // Add error object for better context
  refetch: () => Promise<void>;
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

export function useTriviaQuestion(): UseTriviaQuestionReturn {
  const [rawQuestionData, setRawQuestionData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorObject, setErrorObject] = useState<any | null>(null);
  const handleAsyncError = useAsyncErrorHandler();

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorObject(null);
    
    logger.debug('Starting daily question fetch');
    
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('get-trivia-question');

      if (fetchError) {
        logger.error('Error fetching daily question:', fetchError);
        setError('Failed to load daily question. Please try again later.');
        setErrorObject(fetchError);
        setRawQuestionData(null);
      } else if (data) {
        logger.debug('Question data received, storing raw data...');
        setRawQuestionData(data);
        setError(null);
        setErrorObject(null);
      } else {
        logger.warn('No question data received');
        const noDataError = new Error('No question found for today. Check back tomorrow!');
        setError('No question found for today. Check back tomorrow!');
        setErrorObject(noDataError);
        setRawQuestionData(null);
      }
    } catch (err) {
      logger.error('Unexpected error fetching question:', err);
      
      // Report to async error boundary for global error handling
      if (err instanceof Error) {
        handleAsyncError(err);
      }
      
      setError('An unexpected error occurred. Please try again.');
      setErrorObject(err);
      setRawQuestionData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized processing of question data - only recalculates when raw data changes
  const question = useMemo(() => {
    if (!rawQuestionData) {
      trackMemoization('useTriviaQuestion', true);
      return null;
    }
    
    trackMemoization('useTriviaQuestion', false);
    logger.debug('Processing question data with memoization...');
    
    return measurePerformance('question-data-processing', () => {
      const triviaQuestion = rawQuestionData;
      const decodedQuestion = decodeHtmlEntities(triviaQuestion.question || '');
      const decodedIncorrectAnswers = (triviaQuestion.incorrect_answers || []).map((ans: string) => decodeHtmlEntities(ans || ''));
      const decodedCorrectAnswer = decodeHtmlEntities(triviaQuestion.correct_answer || '');

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
    loading,
    error,
    errorObject,
    refetch: fetchQuestion,
  };
}