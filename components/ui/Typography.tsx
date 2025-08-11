import React, { ReactNode } from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { Colors, LegacyColors } from '@/constants/Colors';
import { Typography as TypographyTokens } from '@/constants/DesignTokens';

type TypographyVariant = 
  | 'displayLarge' 
  | 'displayMedium' 
  | 'displaySmall'
  | 'headlineLarge' 
  | 'headlineMedium' 
  | 'headlineSmall'
  | 'titleLarge' 
  | 'titleMedium' 
  | 'titleSmall'
  | 'bodyLarge' 
  | 'bodyMedium' 
  | 'bodySmall'
  | 'labelLarge' 
  | 'labelMedium' 
  | 'labelSmall'
  | 'questionText'
  | 'answerText'
  | 'buttonPrimary';

type ColorVariant = 'primary' | 'secondary' | 'inverse' | 'error' | 'success' | 'warning' | 'calendar';

interface TypographyProps extends TextProps {
  children: ReactNode;
  variant?: TypographyVariant;
  color?: ColorVariant | string;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  style?: any;
}

export function Typography({
  children,
  variant = 'bodyMedium',
  color = 'primary',
  align = 'left',
  weight,
  style,
  ...textProps
}: TypographyProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'displayLarge':
        return TypographyTokens.sizes.displayLarge;
      case 'displayMedium':
        return TypographyTokens.sizes.displayMedium;
      case 'displaySmall':
        return TypographyTokens.sizes.displaySmall;
      case 'headlineLarge':
        return TypographyTokens.sizes.headlineLarge;
      case 'headlineMedium':
        return TypographyTokens.sizes.headlineMedium;
      case 'headlineSmall':
        return TypographyTokens.sizes.headlineSmall;
      case 'titleLarge':
        return TypographyTokens.sizes.titleLarge;
      case 'titleMedium':
        return TypographyTokens.sizes.titleMedium;
      case 'titleSmall':
        return TypographyTokens.sizes.titleSmall;
      case 'bodyLarge':
        return TypographyTokens.sizes.bodyLarge;
      case 'bodyMedium':
        return TypographyTokens.sizes.bodyMedium;
      case 'bodySmall':
        return TypographyTokens.sizes.bodySmall;
      case 'labelLarge':
        return TypographyTokens.sizes.labelLarge;
      case 'labelMedium':
        return TypographyTokens.sizes.labelMedium;
      case 'labelSmall':
        return TypographyTokens.sizes.labelSmall;
      case 'questionText':
        return TypographyTokens.semantic.questionText;
      case 'answerText':
        return TypographyTokens.semantic.answerText;
      case 'buttonPrimary':
        return TypographyTokens.semantic.buttonPrimary;
    }
  };

  const getColorStyles = () => {
    if (typeof color === 'string' && !['primary', 'secondary', 'inverse', 'error', 'success', 'warning', 'calendar'].includes(color)) {
      return { color };
    }

    switch (color) {
      case 'primary':
        return { color: Colors.light.text };
      case 'secondary':
        return { color: Colors.light.textSecondary };
      case 'inverse':
        return { color: Colors.light.textInverse };
      case 'error':
        return { color: Colors.light.error };
      case 'success':
        return { color: Colors.light.success };
      case 'warning':
        return { color: Colors.light.warning };
      case 'calendar':
        return { color: Colors.light.calendar };
      default:
        return { color: Colors.light.text };
    }
  };

  const getAlignStyles = () => {
    return { textAlign: align };
  };

  const getWeightStyles = () => {
    if (!weight) return {};
    
    switch (weight) {
      case 'normal':
        return { fontWeight: TypographyTokens.weights.normal };
      case 'medium':
        return { fontWeight: TypographyTokens.weights.medium };
      case 'semibold':
        return { fontWeight: TypographyTokens.weights.semibold };
      case 'bold':
        return { fontWeight: TypographyTokens.weights.bold };
    }
  };

  const variantStyles = getVariantStyles();
  const colorStyles = getColorStyles();
  const alignStyles = getAlignStyles();
  const weightStyles = getWeightStyles();

  return (
    <Text
      {...textProps}
      style={[
        variantStyles,
        colorStyles,
        alignStyles,
        weightStyles,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// Convenience components for common use cases
export function Heading({ variant = 'headlineMedium', ...props }: TypographyProps) {
  return <Typography variant={variant} {...props} />;
}

export function Title({ variant = 'titleLarge', ...props }: TypographyProps) {
  return <Typography variant={variant} {...props} />;
}

export function Body({ variant = 'bodyMedium', ...props }: TypographyProps) {
  return <Typography variant={variant} {...props} />;
}

export function Label({ variant = 'labelMedium', ...props }: TypographyProps) {
  return <Typography variant={variant} {...props} />;
}

export function QuestionText({ ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="questionText" align="center" {...props} />;
}

export function AnswerText({ ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="answerText" {...props} />;
}

export function ButtonText({ ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="buttonPrimary" align="center" {...props} />;
}