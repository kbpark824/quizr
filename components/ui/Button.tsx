import React, { useState, ReactNode } from 'react';
import { Pressable, Text, StyleSheet, Platform, PressableProps } from 'react-native';
import { Colors, LegacyColors } from '@/constants/Colors';
import { Spacing, Typography, BorderRadius, ComponentShadows } from '@/constants/DesignTokens';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'option' | 'flip';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: any;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  ...pressableProps
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          pressed: styles.primaryPressed,
          hovered: styles.primaryHovered,
          disabled: styles.primaryDisabled,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          pressed: styles.secondaryPressed,
          hovered: styles.secondaryHovered,
          disabled: styles.secondaryDisabled,
        };
      case 'tertiary':
        return {
          container: styles.tertiaryContainer,
          text: styles.tertiaryText,
          pressed: styles.tertiaryPressed,
          hovered: styles.tertiaryHovered,
          disabled: styles.tertiaryDisabled,
        };
      case 'option':
        return {
          container: styles.optionContainer,
          text: styles.optionText,
          pressed: styles.optionPressed,
          hovered: styles.optionHovered,
          disabled: styles.optionDisabled,
        };
      case 'flip':
        return {
          container: styles.flipContainer,
          text: styles.flipText,
          pressed: styles.flipPressed,
          hovered: styles.flipHovered,
          disabled: styles.flipDisabled,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
        };
      case 'medium':
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled || loading}
      style={({ pressed, hovered }) => [
        styles.baseContainer,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        (pressed || isPressed) && variantStyles.pressed,
        Platform.OS === 'web' && hovered && !disabled && variantStyles.hovered,
        disabled && variantStyles.disabled,
        style,
      ]}
      onPressIn={(e) => {
        setIsPressed(true);
        pressableProps.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setIsPressed(false);
        pressableProps.onPressOut?.(e);
      }}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {leftIcon}
      <Text
        style={[
          styles.baseText,
          variantStyles.text,
          sizeStyles.text,
          disabled && styles.disabledText,
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
      {rightIcon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Base styles
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.button,
    ...ComponentShadows.button,
  },
  baseText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
  disabledText: {
    opacity: 0.5,
  },

  // Size variants
  smallContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 36,
  },
  smallText: {
    ...Typography.sizes.bodySmall,
  },
  mediumContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  mediumText: {
    ...Typography.sizes.bodyMedium,
  },
  largeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  largeText: {
    ...Typography.sizes.bodyLarge,
  },

  // Primary variant (main CTA buttons)
  primaryContainer: {
    backgroundColor: Colors.light.calendar,
  },
  primaryText: {
    color: Colors.light.textInverse,
  },
  primaryPressed: {
    backgroundColor: '#991B1B',
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryHovered: {
    backgroundColor: '#B91C1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1.02 }],
  },
  primaryDisabled: {
    backgroundColor: LegacyColors.mediumGray,
    opacity: 0.6,
  },

  // Secondary variant (outlined buttons)
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.calendar,
  },
  secondaryText: {
    color: Colors.light.calendar,
  },
  secondaryPressed: {
    backgroundColor: Colors.light.surfaceVariant,
    borderColor: '#991B1B',
    transform: [{ scale: 0.98 }],
  },
  secondaryHovered: {
    backgroundColor: Colors.light.surfaceVariant,
    borderColor: '#B91C1C',
    transform: [{ scale: 1.02 }],
  },
  secondaryDisabled: {
    borderColor: LegacyColors.mediumGray,
    opacity: 0.6,
  },

  // Tertiary variant (text-only buttons)
  tertiaryContainer: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  tertiaryText: {
    color: Colors.light.interactive,
  },
  tertiaryPressed: {
    backgroundColor: Colors.light.border,
    transform: [{ scale: 0.98 }],
  },
  tertiaryHovered: {
    backgroundColor: Colors.light.surfaceVariant,
  },
  tertiaryDisabled: {
    opacity: 0.6,
  },

  // Option variant (answer options)
  optionContainer: {
    backgroundColor: LegacyColors.lightGray,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  optionText: {
    color: LegacyColors.black,
    textAlign: 'left',
  },
  optionPressed: {
    backgroundColor: Colors.light.border,
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  optionHovered: {
    backgroundColor: Colors.light.surfaceVariant,
    borderColor: Colors.light.borderStrong,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 1.01 }],
  },
  optionDisabled: {
    opacity: 0.6,
  },

  // Flip variant (reveal answer button)
  flipContainer: {
    backgroundColor: Colors.light.calendar,
    borderRadius: BorderRadius.flipButton,
    minWidth: 140,
  },
  flipText: {
    ...Typography.semantic.buttonPrimary,
    color: Colors.light.textInverse,
  },
  flipPressed: {
    backgroundColor: '#991B1B',
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  flipHovered: {
    backgroundColor: '#B91C1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1.02 }],
  },
  flipDisabled: {
    backgroundColor: LegacyColors.mediumGray,
    opacity: 0.6,
  },
});