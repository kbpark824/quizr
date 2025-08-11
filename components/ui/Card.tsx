import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, LegacyColors } from '@/constants/Colors';
import { Spacing, BorderRadius, ComponentShadows } from '@/constants/DesignTokens';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'calendar';
type CardPadding = 'none' | 'small' | 'medium' | 'large';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  fullWidth?: boolean;
  style?: any;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  fullWidth = false,
  style,
  ...viewProps
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          container: styles.defaultContainer,
        };
      case 'elevated':
        return {
          container: styles.elevatedContainer,
        };
      case 'outlined':
        return {
          container: styles.outlinedContainer,
        };
      case 'filled':
        return {
          container: styles.filledContainer,
        };
      case 'calendar':
        return {
          container: styles.calendarContainer,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return styles.noPadding;
      case 'small':
        return styles.smallPadding;
      case 'medium':
        return styles.mediumPadding;
      case 'large':
        return styles.largePadding;
    }
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();

  return (
    <View
      {...viewProps}
      style={[
        styles.baseContainer,
        variantStyles.container,
        paddingStyles,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Base styles
  baseContainer: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },

  // Padding variants
  noPadding: {
    padding: 0,
  },
  smallPadding: {
    padding: Spacing.sm,
  },
  mediumPadding: {
    padding: Spacing.md,
  },
  largePadding: {
    padding: Spacing.lg,
  },

  // Variant styles
  defaultContainer: {
    backgroundColor: Colors.light.surface,
    ...ComponentShadows.card,
  },
  elevatedContainer: {
    backgroundColor: Colors.light.surface,
    ...ComponentShadows.cardElevated,
  },
  outlinedContainer: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filledContainer: {
    backgroundColor: Colors.light.surfaceVariant,
  },
  calendarContainer: {
    backgroundColor: LegacyColors.white,
    borderColor: LegacyColors.red,
    borderWidth: 12,
    shadowColor: LegacyColors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});