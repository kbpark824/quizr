import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, AccessibilityInfo, findNodeHandle, Text } from 'react-native';
import { LegacyColors } from '@/constants/Colors';
import { Spacing } from '@/constants/DesignTokens';
import { getErrorDetails, getContextualHelp } from '@/utils/errorMessages';
import { Typography as UITypography, Button, Card } from '@/components/ui';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  error?: any; // Optional error object for better context
}

export default function ErrorState({ message, onRetry, error }: ErrorStateProps) {
  const [showHelp, setShowHelp] = useState(false);
  const errorTitleRef = useRef<Text>(null);
  const helpSectionRef = useRef<View>(null);
  const errorDetails = getErrorDetails(error || { message });
  const helpSteps = getContextualHelp(error || { message });

  // Focus error title when component mounts for screen readers
  useEffect(() => {
    const focusErrorTitle = () => {
      if (errorTitleRef.current) {
        const reactTag = findNodeHandle(errorTitleRef.current);
        if (reactTag) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      }
    };
    
    // Delay to ensure component is fully rendered
    const timer = setTimeout(focusErrorTitle, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleHelp = () => {
    const wasShowingHelp = showHelp;
    setShowHelp(!showHelp);
    
    // If we just opened help, focus the help section
    if (!wasShowingHelp) {
      setTimeout(() => {
        if (helpSectionRef.current) {
          const reactTag = findNodeHandle(helpSectionRef.current);
          if (reactTag) {
            AccessibilityInfo.setAccessibilityFocus(reactTag);
          }
        }
      }, 100);
    }
  };

  return (
    <View style={styles.container}>
      {/* Error Icon */}
      <UITypography variant="displayMedium" align="center" style={styles.errorIcon}>
        {errorDetails.icon}
      </UITypography>
      
      {/* Error Title */}
      <Text 
        ref={errorTitleRef}
        style={styles.errorTitle}
        accessible={true}
        accessibilityRole="header"
      >
        {errorDetails.title}
      </Text>
      
      {/* Error Message */}
      <UITypography 
        variant="bodyLarge" 
        color="secondary" 
        align="center"
        style={styles.errorMessage}
      >
        {errorDetails.message}
      </UITypography>
      
      {/* Suggestion */}
      <UITypography 
        variant="bodyMedium" 
        color={LegacyColors.mediumGray}
        align="center"
        style={styles.suggestion}
      >
        {errorDetails.suggestion}
      </UITypography>
      
      {/* Retry Button */}
      {onRetry && errorDetails.canRetry && (
        <Button
          title="Try Again"
          variant="primary"
          size="medium"
          onPress={onRetry}
          accessible={true}
          accessibilityLabel="Try again"
          accessibilityHint="Attempts to reload the trivia question"
          style={styles.retryButton}
        />
      )}
      
      {/* Expandable Help Section */}
      <Button
        title={showHelp ? '▼ Hide Help' : '▶ Need Help?'}
        variant="tertiary"
        size="small"
        onPress={handleToggleHelp}
        accessible={true}
        accessibilityLabel={showHelp ? "Hide help" : "Show help"}
        accessibilityHint="Shows additional troubleshooting steps"
        style={styles.helpToggle}
      />
      
      {showHelp && (
        <View 
          ref={helpSectionRef}
          style={styles.helpSection}
          accessible={false}
        >
          <UITypography 
            variant="bodyMedium"
            weight="semibold"
            color="secondary"
            accessible={true}
            accessibilityRole="header"
            style={styles.helpTitle}
          >
            Troubleshooting Steps:
          </UITypography>
          {helpSteps.map((step, index) => (
            <View key={index} style={styles.helpStep}>
              <UITypography 
                variant="bodySmall" 
                color={LegacyColors.blue}
                weight="semibold"
                style={styles.helpStepNumber}
              >
                {index + 1}.
              </UITypography>
              <UITypography 
                variant="bodySmall" 
                color="secondary"
                style={styles.helpStepText}
              >
                {step}
              </UITypography>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: LegacyColors.white,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: LegacyColors.red,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  errorMessage: {
    fontSize: 18,
    color: LegacyColors.darkGray,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  suggestion: {
    fontSize: 16,
    color: LegacyColors.mediumGray,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  retryButton: {
    marginBottom: Spacing.lg,
  },
  helpToggle: {
    marginTop: Spacing.lg,
  },
  helpSection: {
    marginTop: Spacing.md,
    backgroundColor: LegacyColors.lightGray,
    borderRadius: 8,
    padding: Spacing.md,
    width: '100%',
    maxWidth: 320,
  },
  helpTitle: {
    marginBottom: Spacing.sm,
  },
  helpStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  helpStepNumber: {
    marginRight: Spacing.xs,
    minWidth: 20,
  },
  helpStepText: {
    flex: 1,
  },
});