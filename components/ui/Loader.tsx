import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ViewProps } from 'react-native';
import { Colors, LegacyColors } from '@/constants/Colors';
import { Spacing, Typography, BorderRadius } from '@/constants/DesignTokens';
import { Typography as UITypography } from './Typography';

type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';
type LoaderSize = 'small' | 'medium' | 'large';

interface LoaderProps extends ViewProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: any;
}

export function Loader({
  variant = 'spinner',
  size = 'medium',
  color = Colors.light.interactive,
  message,
  fullScreen = false,
  style,
  ...viewProps
}: LoaderProps) {
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <InternalSpinLoader size={size} color={color} />;
      case 'dots':
        return <InternalDotLoader size={size} color={color} />;
      case 'pulse':
        return <InternalPulseLoader size={size} color={color} />;
      case 'skeleton':
        return <InternalSkeletonLoader size={size} />;
      default:
        return <InternalSpinLoader size={size} color={color} />;
    }
  };

  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <View style={[containerStyle, style]} {...viewProps}>
      <View style={styles.loaderContent}>
        {renderLoader()}
        {message && (
          <UITypography 
            variant="bodyMedium" 
            align="center" 
            style={styles.message}
          >
            {message}
          </UITypography>
        )}
      </View>
    </View>
  );
}

// Spinning loader (default)
function InternalSpinLoader({ size, color }: { size: LoaderSize; color: string }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dimensions = getSizeDimensions(size);

  useEffect(() => {
    const startAnimation = () => {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.spinLoader,
        {
          width: dimensions.size,
          height: dimensions.size,
          borderRadius: dimensions.size / 2,
          borderTopColor: color,
          borderWidth: dimensions.borderWidth,
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
}

// Dot loader
function InternalDotLoader({ size, color }: { size: LoaderSize; color: string }) {
  const animValues = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  const dimensions = getSizeDimensions(size);

  useEffect(() => {
    const animations = animValues.map((animValue, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            delay: index * 200,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.stagger(200, animations).start();
  }, [animValues]);

  return (
    <View style={styles.dotContainer}>
      {animValues.map((animValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: dimensions.dotSize,
              height: dimensions.dotSize,
              borderRadius: dimensions.dotSize / 2,
              backgroundColor: color,
              opacity: animValue,
            },
          ]}
        />
      ))}
    </View>
  );
}

// Pulse loader
function InternalPulseLoader({ size, color }: { size: LoaderSize; color: string }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const dimensions = getSizeDimensions(size);

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    startAnimation();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.pulseLoader,
        {
          width: dimensions.size,
          height: dimensions.size,
          backgroundColor: color,
          borderRadius: dimensions.size / 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
}

// Skeleton loader
function InternalSkeletonLoader({ size }: { size: LoaderSize }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const dimensions = getSizeDimensions(size);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [animValue]);

  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [LegacyColors.lightGray, LegacyColors.mediumGray],
  });

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View
        style={[
          styles.skeletonBar,
          {
            backgroundColor,
            height: dimensions.skeletonHeight,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonBar,
          {
            backgroundColor,
            height: dimensions.skeletonHeight * 0.8,
            width: '80%',
            marginTop: Spacing.xs,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonBar,
          {
            backgroundColor,
            height: dimensions.skeletonHeight * 0.6,
            width: '60%',
            marginTop: Spacing.xs,
          },
        ]}
      />
    </View>
  );
}

function getSizeDimensions(size: LoaderSize) {
  switch (size) {
    case 'small':
      return {
        size: 24,
        dotSize: 6,
        borderWidth: 2,
        skeletonHeight: 12,
      };
    case 'medium':
      return {
        size: 40,
        dotSize: 8,
        borderWidth: 3,
        skeletonHeight: 16,
      };
    case 'large':
      return {
        size: 60,
        dotSize: 12,
        borderWidth: 4,
        skeletonHeight: 20,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
  },
  loaderContent: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  message: {
    marginTop: Spacing.md,
    color: Colors.light.textSecondary,
  },

  // Spin loader
  spinLoader: {
    borderColor: Colors.light.border,
    borderTopColor: Colors.light.interactive,
  },

  // Dot loader
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Pulse loader
  pulseLoader: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Skeleton loader
  skeletonContainer: {
    width: '100%',
    maxWidth: 200,
  },
  skeletonBar: {
    borderRadius: BorderRadius.xs,
    width: '100%',
  },
});

// Convenience exports
export const SpinLoader = (props: Omit<LoaderProps, 'variant'>) => (
  <Loader variant="spinner" {...props} />
);

export const DotLoader = (props: Omit<LoaderProps, 'variant'>) => (
  <Loader variant="dots" {...props} />
);

export const PulseLoader = (props: Omit<LoaderProps, 'variant'>) => (
  <Loader variant="pulse" {...props} />
);

export const SkeletonLoader = (props: Omit<LoaderProps, 'variant'>) => (
  <Loader variant="skeleton" {...props} />
);

export default Loader;