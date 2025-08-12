/*
 * Quizr - Daily Trivia App
 * Main question screen component
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
  const { question, userStatus, loading, error, errorObject, refetch, markCompleted } = useTriviaQuestion();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} error={errorObject} onRetry={refetch} />;
  }

  if (!question) {
    return <ErrorState message="No question available. Please try again." onRetry={refetch} />;
  }

  logger.debug('Rendering QuestionGame with user status:', userStatus);
  return (
    <SectionErrorBoundary sectionName="Question Game">
      <QuestionGame 
        question={question} 
        userStatus={userStatus}
        onMarkCompleted={markCompleted}
      />
    </SectionErrorBoundary>
  );
}