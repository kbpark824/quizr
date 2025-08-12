import React, { useMemo, memo, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LegacyColors } from '@/constants/Colors';
import { Spacing, Typography } from '@/constants/DesignTokens';
import { ComponentLayout, getResponsiveDimension } from '@/constants/Layout';
import { Button } from '@/components/ui';
import { trackRender } from '@/utils/performance';

// Platform-specific scaling constants
const PlatformScaling = {
  // Card dimensions
  cardHeightMultiplier: Platform.select({ android: 1.15, default: 1 }),
  
  // Header dimensions
  headerHeightReduction: Platform.select({ android: 50, default: 0 }),
  headerPadding: Platform.select({
    android: getResponsiveDimension(12, 14, 16),
    default: getResponsiveDimension(12, 15, 18)
  }),
  
  // Date number scaling
  dateNumberSizeMultiplier: Platform.select({ android: 0.7, default: 1 }),
  
  // Border widths
  containerBorder: getResponsiveDimension(12, 15, 18),
  dateBorder: Platform.select({ android: 1, default: getResponsiveDimension(2, 3, 4) }),
  verticalLine: Platform.select({ android: 1, default: getResponsiveDimension(2, 3, 4) }),
  
  // Padding and margins
  datePadding: Platform.select({
    android: getResponsiveDimension(8, 10, 12),
    default: getResponsiveDimension(12, 15, 18)
  }),
  dateSpacing: Platform.select({
    android: getResponsiveDimension(8, 10, 12),
    default: getResponsiveDimension(12, 15, 18)
  }),
  dateMargin: Platform.select({
    android: getResponsiveDimension(6, 8, 10),
    default: getResponsiveDimension(8, 10, 12)
  }),
  
  // Text sizes
  dateDetailFontSize: Platform.select({
    android: getResponsiveDimension(14, 18, 22),
    default: getResponsiveDimension(18, 24, 28)
  }),
  dateDetailPadding: Platform.select({
    android: getResponsiveDimension(3, 4, 5),
    default: getResponsiveDimension(4, 5, 6)
  }),
  dateDetailHeight: Platform.select({
    android: getResponsiveDimension(40, 50, 60),
    default: getResponsiveDimension(60, 75, 90)
  }),
  
  // Content text sizes
  questionFontSize: Platform.select({
    android: 16,
    default: Typography.semantic.questionText.fontSize
  }),
  questionLineHeight: Platform.select({
    android: 22,
    default: Typography.semantic.questionText.lineHeight
  }),
  answerFontSize: Platform.select({
    android: 14,
    default: Typography.semantic.answerText.fontSize
  }),
  answerLineHeight: Platform.select({
    android: 20,
    default: Typography.semantic.answerText.lineHeight
  }),
  
  // Spacing
  questionMargin: Platform.select({ android: Spacing.md, default: Spacing.lg }),
  optionsMargin: Platform.select({ android: Spacing.md, default: Spacing.lg }),
  cardMarginTop: Platform.select({ android: 20, default: 0 }),
  cardPadding: getResponsiveDimension(16, 20, 24),
} as const;

interface QuestionData {
  question_text: string;
  answer_options: string[];
  correct_answer: string;
}

interface DeskCalendarPageProps {
  question: QuestionData;
  onFlip: () => void;
  isFlipped: boolean; // Controlled from parent
  onAnswerSelected: (answer: string) => void;
  selectedAnswer: string | null;
  showAnswer: boolean; // To control when to show the correct correct_answer on the back
  isCompleted?: boolean; // To disable answer selection when question is completed
}

const DeskCalendarPage = memo(function DeskCalendarPage({
  question,
  onFlip,
  isFlipped,
  onAnswerSelected,
  selectedAnswer,
  showAnswer,
  isCompleted = false,
}: DeskCalendarPageProps) {
  useEffect(() => {
    trackRender('DeskCalendarPage');
  });
  
  // Memoize date calculations - only recalculates once per day
  const dateInfo = useMemo(() => {
    const today = new Date();
    return {
      dayOfMonth: today.getDate(),
      dayOfWeek: today.toLocaleString('en-US', { weekday: 'long' }),
      month: today.toLocaleString('en-US', { month: 'long' }),
      year: today.getFullYear(),
      dateKey: today.toDateString(), // Used as dependency to recalculate when day changes
    };
  }, []); // Empty dependency array since we want this to be static during the session

  // Component rendering - question loaded successfully
  return (
    <View style={styles.container}>
      {/* Header with Date */}
      <View 
        style={styles.header}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={`Today's date: ${dateInfo.dayOfWeek}, ${dateInfo.month} ${dateInfo.dayOfMonth}, ${dateInfo.year}`}
      >
        <View style={styles.dateBorderContainer}> {/* New container for the white border */}
          <Text 
            style={styles.dayOfMonthText}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Day ${dateInfo.dayOfMonth}`}
          >{dateInfo.dayOfMonth}</Text>
          <View style={styles.dateDetails}>
            <Text 
              style={styles.dateDetailText}
              accessible={true}
              accessibilityRole="text"
            >{dateInfo.dayOfWeek}</Text>
            <Text 
              style={styles.dateDetailText}
              accessible={true}
              accessibilityRole="text"
            >{dateInfo.month}</Text>
            <Text 
              style={styles.dateDetailText}
              accessible={true}
              accessibilityRole="text"
            >{dateInfo.year}</Text>
          </View>
        </View>
      </View>

      {/* Front of the card (Question & Options) */}
      {!isFlipped && (
        <View 
          style={styles.cardFace}
          accessible={false}
        >
          <View style={styles.cardContent}>
            <Text 
              style={styles.questionText}
              accessible={true}
              accessibilityRole="header"
            >{question.question_text}</Text>
            <View 
              style={styles.optionsContainer}
              accessible={false}
            >
              {question.answer_options.map((option, index) => (
                <Button
                  key={option}
                  title={`${index + 1}. ${option}${selectedAnswer === option && isCompleted ? " ✓" : ""}`}
                  variant={selectedAnswer === option ? "primary" : "option"}
                  size="medium"
                  fullWidth
                  onPress={() => isCompleted ? null : onAnswerSelected(option)}
                  disabled={isCompleted && selectedAnswer !== option}
                  accessible={true}
                  accessibilityLabel={`${index + 1}. ${option}${selectedAnswer === option && isCompleted ? " - Your answer" : ""}`}
                  accessibilityHint={isCompleted ? "This question has been completed" : "Selects this as your answer"}
                  accessibilityState={{ 
                    selected: selectedAnswer === option,
                    disabled: isCompleted
                  }}
                  style={[
                    styles.optionButton,
                    isCompleted && selectedAnswer === option && styles.selectedCompletedButton
                  ]}
                />
              ))}
            </View>
            <Button
              title="Reveal Answer"
              variant="flip"
              size="medium"
              onPress={onFlip}
              accessible={true}
              accessibilityLabel="Reveal Answer button"
              accessibilityHint="Reveals the correct answer and flips the card"
              style={styles.flipButton}
            />
          </View>

        </View>
      )}

      {/* Back of the card (Answer) */}
      {isFlipped && (
        <View style={styles.cardFace}> {/* Using cardFace for back as well for consistent styling */}
          <View style={styles.cardContent}>
            <Text style={styles.answerLabel}>Correct Answer:</Text>
            {showAnswer ? (
              <Text style={styles.answerText}>{question.correct_answer}</Text>
            ) : (
              <Text style={styles.answerText}>Flip to reveal...</Text>
            )}
            <Button
              title="Reveal Answer"
              variant="flip"
              size="medium"
              onPress={onFlip}
              accessible={true}
              accessibilityLabel="Reveal Answer button"
              accessibilityHint="Flips the card back to the question side"
              style={styles.flipButton}
            />
          </View>
        </View>
      )}
    </View>
  );
});

export default DeskCalendarPage;

const styles = StyleSheet.create({
  container: {
    width: ComponentLayout.calendar.cardWidth,
    height: ComponentLayout.calendar.cardHeight * PlatformScaling.cardHeightMultiplier,
    backgroundColor: LegacyColors.white,
    borderColor: LegacyColors.red,
    borderWidth: PlatformScaling.containerBorder,
    shadowColor: LegacyColors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: LegacyColors.red,
    paddingBottom: PlatformScaling.headerPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: ComponentLayout.calendar.headerHeight - PlatformScaling.headerHeightReduction,
  },
  dateBorderContainer: {
    borderColor: LegacyColors.white,
    borderWidth: PlatformScaling.dateBorder,
    paddingVertical: 0,
    paddingHorizontal: PlatformScaling.datePadding,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayOfMonthText: {
    color: LegacyColors.white,
    fontSize: ComponentLayout.calendar.dateNumberSize * PlatformScaling.dateNumberSizeMultiplier,
    fontWeight: 'bold',
    borderRightColor: LegacyColors.white,
    borderRightWidth: PlatformScaling.verticalLine,
    paddingRight: PlatformScaling.dateSpacing,
    marginRight: PlatformScaling.dateMargin,
  },
  dateDetails: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: PlatformScaling.dateDetailHeight,
  },
  dateDetailText: {
    color: LegacyColors.white,
    fontSize: PlatformScaling.dateDetailFontSize,
    paddingLeft: PlatformScaling.dateDetailPadding,
  },
  cardFace: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LegacyColors.white,
    marginTop: PlatformScaling.cardMarginTop,
  },
  cardContent: {
    padding: PlatformScaling.cardPadding,
    alignItems: 'center',
    width: '100%',
  },
  questionText: {
    ...Typography.semantic.questionText,
    fontSize: PlatformScaling.questionFontSize,
    lineHeight: PlatformScaling.questionLineHeight,
    marginBottom: PlatformScaling.questionMargin,
    textAlign: 'center',
    color: LegacyColors.black,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: PlatformScaling.optionsMargin,
  },
  optionButton: {
    marginBottom: Spacing.sm + 2,
  },
  flipButton: {
    marginTop: Spacing.lg,
  },
  answerLabel: {
    ...Typography.sizes.titleMedium,
    marginBottom: Spacing.sm + 2,
    color: LegacyColors.black,
  },
  answerText: {
    ...Typography.sizes.titleSmall,
    textAlign: 'center',
    color: LegacyColors.black,
  },
  selectedCompletedButton: {
    opacity: 1, // Override the disabled opacity to keep the selected answer visible
  },
});