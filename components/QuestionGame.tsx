import React, { useState, useCallback, useRef, useMemo, memo } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, findNodeHandle } from 'react-native';
import DeskCalendarPage from './DeskCalendarPage';
import { LegacyColors } from '@/constants/Colors';

interface QuestionData {
  question_text: string;
  answer_options: string[];
  correct_answer: string;
}

interface QuestionGameProps {
  question: QuestionData;
}

const QuestionGame = memo(function QuestionGame({ question }: QuestionGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isPageFlipped, setIsPageFlipped] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const messageRef = useRef<Text>(null);

  const handleAnswerSelected = useCallback((option: string) => {
    setSelectedAnswer(option);
    setAnnouncementText(`Selected answer: ${option}`);
  }, []);

  // Memoize the result calculation to avoid repeated computation
  const isAnswerCorrect = useMemo(() => {
    if (!selectedAnswer) return false;
    return selectedAnswer.toLowerCase() === question.correct_answer.toLowerCase();
  }, [selectedAnswer, question.correct_answer]);

  const handleFlipPage = useCallback(() => {
    if (isPageFlipped) {
      setIsPageFlipped(false);
      setSelectedAnswer(null);
      setMessage('');
      setShowCorrectAnswer(false);
    } else {
      if (selectedAnswer === null) {
        setMessage('Please select an answer before revealing.');
        return;
      }

      setIsPageFlipped(true);
      setShowCorrectAnswer(true);
      
      let resultMessage = '';
      if (isAnswerCorrect) {
        resultMessage = 'Congratulations! You got it right!';
        setMessage(resultMessage);
      } else {
        resultMessage = `Incorrect. The correct answer was: ${question.correct_answer}.`;
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
  }, [question.correct_answer, selectedAnswer, isPageFlipped, isAnswerCorrect]);

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
        {!isPageFlipped && selectedAnswer && (
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