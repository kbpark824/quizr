import React from 'react';
import { View, StyleSheet, Linking, Alert } from 'react-native';
import { LegacyColors } from '@/constants/Colors';
import { Spacing } from '@/constants/DesignTokens';
import { Typography as UITypography, Button, Card } from '@/components/ui';

export default function AboutScreen() {
  
  const handlePressLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('An error occurred', err);
      Alert.alert('Error', 'Could not open link. Please try again later.');
    });
  };

  const handlePressEmail = () => {
    Linking.openURL('mailto:support@quizr.app').catch(err => {
      console.error('An error occurred', err);
      Alert.alert('Error', 'Could not open email client. Please ensure you have one configured.');
    });
  };

  return (
    <View style={styles.container}>
      <UITypography variant="headlineMedium" align="center" style={styles.title}>
        About Quizr
      </UITypography>
      <UITypography variant="bodyLarge" align="center" style={styles.description}>
        Quizr is your daily dose of trivia! Challenge yourself with new questions every day and expand your knowledge.
      </UITypography>

      <Card variant="default" padding="medium" style={styles.linksContainer}>
        <Button
          title="Privacy Policy"
          variant="tertiary"
          size="medium"
          fullWidth
          onPress={() => handlePressLink('https://quizr.app/privacy-policy')}
          accessible={true}
          accessibilityLabel="Privacy Policy link"
          accessibilityHint="Opens the Quizr privacy policy in your browser"
          accessibilityRole="link"
        />

        <Button
          title="Terms of Use"
          variant="tertiary"
          size="medium"
          fullWidth
          onPress={() => handlePressLink('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
          accessible={true}
          accessibilityLabel="Terms of Use link"
          accessibilityHint="Opens the Apple Terms of Use in your browser"
          accessibilityRole="link"
        />

        <Button
          title="Need help? Email us at support@quizr.app"
          variant="tertiary"
          size="medium"
          fullWidth
          onPress={handlePressEmail}
          accessible={true}
          accessibilityLabel="Support email link"
          accessibilityHint="Opens your email client to send an email to Quizr support"
          accessibilityRole="link"
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center', // Center align all content
    paddingTop: Spacing.xxxl + 36, // Increased padding to move content lower
    paddingHorizontal: Spacing.padding.container, // Keep horizontal padding
    backgroundColor: LegacyColors.lightGray, // Match page background
  },
  title: {
    marginBottom: Spacing.sm + 2,
    color: LegacyColors.black,
  },
  description: {
    marginBottom: Spacing.xl - 2,
    color: LegacyColors.darkGray,
  },
  linksContainer: {
    width: '100%',
  },
});