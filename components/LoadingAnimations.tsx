import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LegacyColors } from '@/constants/Colors';
import { Spacing } from '@/constants/DesignTokens';

interface LoadingDotsProps {
  color?: string;
  size?: number;
}

export function LoadingDots({ color = LegacyColors.blue, size = 8 }: LoadingDotsProps) {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 200),
      createDotAnimation(dot3Anim, 400),
    ]).start();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const createDotStyle = (animValue: Animated.Value) => {
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return {
      transform: [{ scale }],
      opacity,
    };
  };

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
          createDotStyle(dot1Anim),
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
          createDotStyle(dot2Anim),
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
          createDotStyle(dot3Anim),
        ]}
      />
    </View>
  );
}

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
}

export function FadeInView({ children, duration = 1000, delay = 0 }: FadeInViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
}

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 30, color = LegacyColors.blue }: LoadingSpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.spinner,
        {
          width: size,
          height: size,
          borderColor: color,
          borderTopColor: 'transparent',
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  spinner: {
    borderWidth: 3,
    borderRadius: 50,
  },
});