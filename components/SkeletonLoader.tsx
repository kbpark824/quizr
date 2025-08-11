import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LegacyColors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/DesignTokens';

interface SkeletonLoaderProps {
  width: number;
  height: number;
  borderRadius?: number;
  widthPercent?: string;
}

function SkeletonLoader({ width, height, borderRadius = 4 }: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
      ]}
    />
  );
}

export default function QuestionSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <View style={styles.dateBorderContainer}>
          <SkeletonLoader width={60} height={40} borderRadius={8} />
          <View style={styles.dateDetails}>
            <SkeletonLoader width={80} height={16} />
            <SkeletonLoader width={70} height={16} />
            <SkeletonLoader width={50} height={16} />
          </View>
        </View>
      </View>

      {/* Card skeleton */}
      <View style={styles.cardFace}>
        <View style={styles.cardContent}>
          {/* Question skeleton */}
          <View style={styles.questionSkeleton}>
            <SkeletonLoader width={300} height={20} />
            <SkeletonLoader width={250} height={20} />
            <SkeletonLoader width={200} height={20} />
          </View>

          {/* Options skeleton */}
          <View style={styles.optionsContainer}>
            {[1, 2, 3, 4].map((_, index) => (
              <View key={index} style={styles.optionSkeleton}>
                <SkeletonLoader width={280} height={50} borderRadius={8} />
              </View>
            ))}
          </View>

          {/* Button skeleton */}
          <View style={styles.buttonSkeleton}>
            <SkeletonLoader width={120} height={40} borderRadius={20} />
          </View>
        </View>
      </View>
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
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dateBorderContainer: {
    backgroundColor: LegacyColors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateDetails: {
    marginLeft: Spacing.md,
    gap: Spacing.xs,
  },
  cardFace: {
    flex: 1,
    width: '100%',
    maxWidth: 350,
    backgroundColor: LegacyColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  questionSkeleton: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionSkeleton: {
    marginBottom: Spacing.xs,
  },
  buttonSkeleton: {
    alignItems: 'center',
  },
  skeleton: {
    backgroundColor: LegacyColors.mediumGray,
  },
});