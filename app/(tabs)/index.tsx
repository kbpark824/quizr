/*
 * Quizr - Daily Trivia App
 * Main question screen component
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