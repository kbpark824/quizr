/**
 * Design System - Central Export
 * Complete design token system for consistent UI development
 * Import this file to access all design tokens in one place
 */

// Re-export all design tokens
export { Colors, LegacyColors } from './Colors';
export { Spacing, getSpacing, getSpacings } from './Spacing';
export { Typography, getTypography, TextStyles } from './Typography';
export { Shadows, DarkShadows, ComponentShadows, getShadow, getComponentShadow } from './Shadows';
export { BorderRadius, getBorderRadius, BorderRadiusCombinations, ComponentBorderRadius } from './BorderRadius';
export { Layout, ComponentLayout, Animation, isTablet, isMobile, isLargeScreen, getResponsiveDimension, getResponsivePadding } from './Layout';

// Design system version for tracking changes
export const DESIGN_SYSTEM_VERSION = '1.0.0';

// Import the tokens for internal use
import { Colors as ColorsInternal } from './Colors';
import { Spacing as SpacingInternal } from './Spacing';
import { Typography as TypographyInternal } from './Typography';
import { Shadows as ShadowsInternal } from './Shadows';
import { BorderRadius as BorderRadiusInternal } from './BorderRadius';
import { ComponentShadows as ComponentShadowsInternal } from './Shadows';

/**
 * Quick access to commonly used tokens
 * Use these for the most common styling needs
 */
export const Tokens = {
  // Most used colors
  colors: {
    primary: ColorsInternal.light.primary,
    secondary: ColorsInternal.light.secondary,
    surface: ColorsInternal.light.surface,
    background: ColorsInternal.light.background,
    text: ColorsInternal.light.text,
    textSecondary: ColorsInternal.light.textSecondary,
    border: ColorsInternal.light.border,
    error: ColorsInternal.light.error,
    success: ColorsInternal.light.success,
  },
  
  // Most used spacing
  space: {
    xs: SpacingInternal.xs,
    sm: SpacingInternal.sm,
    md: SpacingInternal.md,
    lg: SpacingInternal.lg,
    xl: SpacingInternal.xl,
    container: SpacingInternal.padding.container,
  },
  
  // Most used typography
  text: {
    body: TypographyInternal.sizes.bodyLarge,
    title: TypographyInternal.sizes.titleMedium,
    headline: TypographyInternal.sizes.headlineSmall,
    button: TypographyInternal.semantic.buttonPrimary,
    caption: TypographyInternal.sizes.bodySmall,
  },
  
  // Most used shadows
  shadow: {
    none: ShadowsInternal.none,
    small: ShadowsInternal.sm,
    medium: ShadowsInternal.md,
    large: ShadowsInternal.lg,
  },
  
  // Most used border radius
  radius: {
    none: BorderRadiusInternal.none,
    small: BorderRadiusInternal.sm,
    medium: BorderRadiusInternal.md,
    large: BorderRadiusInternal.lg,
    full: BorderRadiusInternal.full,
  },
};

/**
 * Helper function to create consistent component styles
 * Usage: createComponentStyle('card', { backgroundColor: 'red' })
 */
export const createComponentStyle = (
  component: 'card' | 'button' | 'input' | 'modal',
  customStyles: any = {}
) => {
  const baseStyles = {
    card: {
      backgroundColor: ColorsInternal.light.surface,
      padding: SpacingInternal.md,
      borderRadius: BorderRadiusInternal.card,
      ...ComponentShadowsInternal.card,
    },
    button: {
      backgroundColor: ColorsInternal.light.primary,
      paddingHorizontal: SpacingInternal.lg,
      paddingVertical: SpacingInternal.md,
      borderRadius: BorderRadiusInternal.button,
      ...ComponentShadowsInternal.button,
    },
    input: {
      backgroundColor: ColorsInternal.light.surface,
      paddingHorizontal: SpacingInternal.md,
      paddingVertical: SpacingInternal.sm,
      borderRadius: BorderRadiusInternal.input,
      borderWidth: 1,
      borderColor: ColorsInternal.light.border,
    },
    modal: {
      backgroundColor: ColorsInternal.light.surface,
      padding: SpacingInternal.lg,
      borderRadius: BorderRadiusInternal.modal,
      ...ComponentShadowsInternal.modal,
    },
  };
  
  return {
    ...baseStyles[component],
    ...customStyles,
  };
};