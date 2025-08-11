/**
 * Design System Shadow/Elevation Tokens
 * Consistent depth and layering following Material Design elevation principles
 * Adapted for React Native shadow properties
 */
import { Colors } from './Colors';

export const Shadows = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Android
  },
  
  // Level 1: Subtle depth for cards, buttons at rest
  sm: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Level 2: Default card elevation
  md: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Level 3: Raised elements, pressed buttons
  lg: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Level 4: Floating action buttons, important cards
  xl: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  
  // Level 5: Modals, overlays, maximum depth
  xxl: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
  },
};

/**
 * Dark mode shadows (lighter shadow color for visibility)
 */
export const DarkShadows = {
  none: Shadows.none,
  
  sm: {
    ...Shadows.sm,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
  },
  
  md: {
    ...Shadows.md,
    shadowColor: '#000000',
    shadowOpacity: 0.4,
  },
  
  lg: {
    ...Shadows.lg,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
  },
  
  xl: {
    ...Shadows.xl,
    shadowColor: '#000000',
    shadowOpacity: 0.6,
  },
  
  xxl: {
    ...Shadows.xxl,
    shadowColor: '#000000',
    shadowOpacity: 0.7,
  },
};

/**
 * Semantic shadows for specific components
 */
export const ComponentShadows = {
  // Card components
  card: Shadows.md,
  cardHover: Shadows.lg,
  cardPressed: Shadows.sm,
  
  // Button shadows
  button: Shadows.sm,
  buttonHover: Shadows.md,
  buttonPressed: Shadows.none,
  
  // Modal and overlay shadows
  modal: Shadows.xxl,
  dropdown: Shadows.lg,
  tooltip: Shadows.md,
  
  // App-specific shadows
  calendarCard: Shadows.xl,    // Main trivia calendar card
  answerButton: Shadows.sm,    // Answer option buttons
  answerButtonSelected: Shadows.md, // Selected answer button
};

/**
 * Helper function to get shadows based on theme
 */
export const getShadow = (
  level: keyof typeof Shadows,
  isDark: boolean = false
) => {
  return isDark ? DarkShadows[level] : Shadows[level];
};

/**
 * Helper function to get component-specific shadows
 */
export const getComponentShadow = (
  component: keyof typeof ComponentShadows,
  isDark: boolean = false
) => {
  const shadowLevel = ComponentShadows[component];
  
  // Find the matching shadow level
  const levelKey = Object.keys(Shadows).find(
    key => Shadows[key as keyof typeof Shadows] === shadowLevel
  ) as keyof typeof Shadows;
  
  return getShadow(levelKey || 'md', isDark);
};