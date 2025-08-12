import React, { useState, useCallback, useRef, useMemo, memo } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, findNodeHandle } from 'react-native';
import DeskCalendarPage from './DeskCalendarPage';
import { LegacyColors } from '@/constants/Colors';

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

interface QuestionGameProps {
  question: QuestionData;
  userStatus: UserStatus | null;
  onMarkCompleted: () => Promise<void>;
}

const QuestionGame = memo(function QuestionGame({ question, userStatus, onMarkCompleted }: QuestionGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isPageFlipped, setIsPageFlipped] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const messageRef = useRef<Text>(null);

  const handleAnswerSelected = useCallback((option: string) => {
    // Don't allow answer changes if user has already completed the question
    if (userStatus?.is_completed) {
      return;
    }
    setSelectedAnswer(option);
    setAnnouncementText(`Selected answer: ${option}`);
  }, [userStatus?.is_completed]);

  // Memoize the result calculation to avoid repeated computation
  const isAnswerCorrect = useMemo(() => {
    if (!selectedAnswer) return false;
    return selectedAnswer.toLowerCase() === question.correct_answer.toLowerCase();
  }, [selectedAnswer, question.correct_answer]);

  const handleFlipPage = useCallback(async () => {
    if (isPageFlipped) {
      // Allow flipping back to question view (but don't reset selected answer)
      setIsPageFlipped(false);
      setMessage('');
      setShowCorrectAnswer(false);
      // Keep selectedAnswer intact so user can see their previous choice
    } else {
      // If user hasn't completed and hasn't selected an answer, require selection first
      if (!userStatus?.is_completed && selectedAnswer === null) {
        setMessage('Please select an answer before revealing.');
        return;
      }

      setIsPageFlipped(true);
      setShowCorrectAnswer(true);
      
      // If already completed, just flip to show answer again without re-processing
      if (userStatus?.is_completed) {
        return;
      }
      
      let resultMessage = '';
      if (isAnswerCorrect) {
        resultMessage = 'Congratulations! You got it right!';
      } else {
        resultMessage = `Incorrect. The correct answer was: ${question.correct_answer}.`;
      }
      
      // Mark question as completed
      try {
        await onMarkCompleted();
        resultMessage += ' Thanks for playing today! Come back tomorrow for a new question.';
        setMessage(resultMessage);
      } catch (error) {
        console.warn('Failed to mark question as completed:', error);
        // Still show the result even if completion failed
        setMessage(resultMessage);
      }

      // Announce the result to screen readers
      setAnnouncementText(resultMessage);
      
      // Focus the message for screen readers
      setTimeout(() => {
        if (messageRef.current) {
          const reactTag = findNodeHandle(messageRef.current);
          if (reactTag) {
            AccessibilityInfo.setAccessibilityFocus(reactTag);
          }
        }
      }, 100);
    }
  }, [question.correct_answer, selectedAnswer, isPageFlipped, isAnswerCorrect, userStatus, onMarkCompleted]);

  // Show completion status if user has already completed today's question
  if (userStatus?.is_completed && !isPageFlipped) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <DeskCalendarPage
            question={question}
            onFlip={handleFlipPage}
            isFlipped={false}
            onAnswerSelected={handleAnswerSelected}
            selectedAnswer={selectedAnswer}
            showAnswer={false}
            isCompleted={userStatus?.is_completed}
          />
          <Text style={[styles.message, styles.completedMessage]}>
            You&apos;ve already completed today&apos;s question! Come back tomorrow for a new challenge.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <DeskCalendarPage
          question={question}
          onFlip={handleFlipPage}
          isFlipped={isPageFlipped}
          onAnswerSelected={handleAnswerSelected}
          selectedAnswer={selectedAnswer}
          showAnswer={showCorrectAnswer}
          isCompleted={userStatus?.is_completed}
        />
        {isPageFlipped && (
          <Text 
            ref={messageRef}
            style={[
              styles.message,
              isAnswerCorrect ? styles.correctMessage : styles.incorrectMessage
            ]}
            accessible={true}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
          >
            {message}
          </Text>
        )}
        {!isPageFlipped && selectedAnswer && !userStatus?.is_completed && (
          <Text 
            style={styles.selectionMessage}
            accessible={true}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
          >
            Selected: {selectedAnswer}
          </Text>
        )}
        
        {/* Hidden live region for announcements */}
        <Text
          style={styles.hiddenAnnouncement}
          accessible={true}
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
          importantForAccessibility="yes"
        >
          {announcementText}
        </Text>
      </View>
    </View>
  );
});

export default QuestionGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: LegacyColors.lightGray,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  message: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    color: LegacyColors.black,
  },
  correctMessage: {
    color: LegacyColors.green,
  },
  incorrectMessage: {
    color: LegacyColors.red,
  },
  completedMessage: {
    color: LegacyColors.darkGray,
    fontStyle: 'italic',
  },
  selectionMessage: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: LegacyColors.blue,
  },
  hiddenAnnouncement: {
    position: 'absolute',
    left: -10000,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});