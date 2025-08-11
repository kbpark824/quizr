import React from 'react';
import { useTriviaQuestion } from '../../hooks/useTriviaQuestion';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import QuestionGame from '../../components/QuestionGame';
import { logger } from '@/utils/logger';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';
import { AsyncErrorBoundary } from '@/components/AsyncErrorBoundary';

export default function QuestionScreen() {
  return (
    <AsyncErrorBoundary resetKeys={[]} onError={(error) => logger.error('Question screen async error:', error)}>
      <QuestionScreenContent />
    </AsyncErrorBoundary>
  );
}

function QuestionScreenContent() {
  const { question, loading, error, errorObject, refetch } = useTriviaQuestion();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} error={errorObject} onRetry={refetch} />;
  }

  if (!question) {
    return <ErrorState message="No question available. Please try again." onRetry={refetch} />;
  }

  logger.debug('Rendering QuestionGame');
  return (
    <SectionErrorBoundary sectionName="Question Game">
      <QuestionGame question={question} />
    </SectionErrorBoundary>
  );
}