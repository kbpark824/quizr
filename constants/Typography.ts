/**
 * Design System Typography Tokens
 * Following type scale principles with proper hierarchy and readability
 * Based on Material Design Type Scale and iOS Typography guidelines
 */
export const Typography = {
  // Font families
  fonts: {
    primary: 'System', // Use system fonts for best performance and native feel
    mono: 'SpaceMono', // Monospace for code or special elements
  },
  
  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Type scale - Following harmonious mathematical progression
  sizes: {
    // Display sizes (for marketing/hero content)
    displayLarge: {
      fontSize: 57,
      lineHeight: 64,
      letterSpacing: -0.25,
      fontWeight: '400' as const,
    },
    displayMedium: {
      fontSize: 45,
      lineHeight: 52,
      letterSpacing: 0,
      fontWeight: '400' as const,
    },
    displaySmall: {
      fontSize: 36,
      lineHeight: 44,
      letterSpacing: 0,
      fontWeight: '400' as const,
    },
    
    // Headline sizes (for section titles)
    headlineLarge: {
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
      fontWeight: '600' as const,
    },
    headlineMedium: {
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
      fontWeight: '600' as const,
    },
    headlineSmall: {
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
      fontWeight: '600' as const,
    },
    
    // Title sizes (for card titles, screen titles)
    titleLarge: {
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0,
      fontWeight: '500' as const,
    },
    titleMedium: {
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: 0.15,
      fontWeight: '500' as const,
    },
    titleSmall: {
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: 0.1,
      fontWeight: '500' as const,
    },
    
    // Body text (for main content)
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
      fontWeight: '400' as const,
    },
    bodyMedium: {
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.4,
      fontWeight: '400' as const,
    },
    
    // Label text (for buttons, form labels)
    labelLarge: {
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      fontWeight: '500' as const,
    },
    labelMedium: {
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
      fontWeight: '500' as const,
    },
    labelSmall: {
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0.5,
      fontWeight: '500' as const,
    },
  },
  
  // Semantic typography (mapped to scale above for common use cases)
  semantic: {
    // App-specific typography
    calendarDate: {
      fontSize: 120,        // Large calendar date number
      lineHeight: 120,      
      fontWeight: '700' as const,
      letterSpacing: -2,
    },
    
    // Question and answer text
    questionText: {
      fontSize: 20,         // Readable question text
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    answerText: {
      fontSize: 16,         // Answer option text
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0.15,
    },
    
    // Button text
    buttonPrimary: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0.1,
    },
    buttonSecondary: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
      letterSpacing: 0.25,
    },
    
    // Navigation and UI
    tabLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0.4,
    },
  },
};

/**
 * Helper function to get typography styles
 * Usage: getTypography('bodyLarge') returns complete typography object
 */
export const getTypography = (variant: keyof typeof Typography.sizes | keyof typeof Typography.semantic) => {
  return Typography.sizes[variant as keyof typeof Typography.sizes] || 
         Typography.semantic[variant as keyof typeof Typography.semantic] ||
         Typography.sizes.bodyMedium;
};

/**
 * Text style presets for common combinations
 */
export const TextStyles = {
  // Screen titles
  screenTitle: {
    ...Typography.sizes.headlineMedium,
  },
  
  // Card titles
  cardTitle: {
    ...Typography.sizes.titleMedium,
  },
  
  // Section headers
  sectionHeader: {
    ...Typography.sizes.titleSmall,
  },
  
  // Default body text
  body: {
    ...Typography.sizes.bodyLarge,
  },
  
  // Secondary/muted text
  secondary: {
    ...Typography.sizes.bodyMedium,
  },
  
  // Small helper text
  helper: {
    ...Typography.sizes.bodySmall,
  },
  
  // Button text
  button: {
    ...Typography.semantic.buttonPrimary,
  },
  
  // Link text
  link: {
    ...Typography.sizes.bodyLarge,
    textDecorationLine: 'underline' as const,
  },
};