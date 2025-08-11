import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LegacyColors } from '@/constants/Colors';
import { Typography, Spacing } from '@/constants/DesignTokens';
import QuestionSkeleton from './SkeletonLoader';
import PulsingLoader from './PulsingLoader';
import { LoadingDots, FadeInView } from './LoadingAnimations';

interface LoadingStateProps {
  message?: string;
  useSkeletonScreen?: boolean;
}

export default function LoadingState({ 
  message = 'Loading daily question...', 
  useSkeletonScreen = true 
}: LoadingStateProps) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    // Show skeleton after a brief delay for better perceived performance
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (useSkeletonScreen && showSkeleton) {
    return <QuestionSkeleton />;
  }

  return (
    <View style={styles.container}>
      <FadeInView duration={800}>
        <View style={styles.loadingContent}>
          <PulsingLoader size={80} color={LegacyColors.blue} />
          <Text style={styles.message}>{message}</Text>
          <LoadingDots size={10} color={LegacyColors.blue} />
        </View>
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: LegacyColors.lightGray,
  },
  loadingContent: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  message: {
    fontSize: Typography.sizes.bodyLarge.fontSize,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    color: LegacyColors.black,
    marginTop: Spacing.md,
  },
});