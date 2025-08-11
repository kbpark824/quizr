/**
 * Design System Layout Tokens
 * Responsive breakpoints, dimensions, and layout utilities
 * Optimized for mobile-first React Native development
 */
import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Layout = {
  // Screen dimensions
  screen: {
    width: screenWidth,
    height: screenHeight,
  },
  
  // Breakpoints (useful for web and larger devices)
  breakpoints: {
    mobile: 0,       // Mobile phones
    tablet: 768,     // Tablets in portrait
    desktop: 1024,   // Desktop and tablets in landscape
    wide: 1440,      // Large desktop screens
  },
  
  // Container dimensions
  container: {
    maxWidth: 1200,          // Maximum content width
    mobileMaxWidth: '100%',   // Full width on mobile
    tabletMaxWidth: '90%',    // Slight margins on tablet
    desktopMaxWidth: 1200,    // Fixed max width on desktop
  },
  
  // Common dimensions
  dimensions: {
    // Navigation
    tabBarHeight: Platform.select({
      ios: 83,      // iOS tab bar with safe area
      android: 56,  // Material Design bottom navigation
      default: 60,
    }),
    headerHeight: Platform.select({
      ios: 44,      // iOS navigation bar
      android: 56,  // Material Design app bar
      default: 50,
    }),
    
    // Interactive elements
    buttonHeight: {
      small: 32,
      medium: 44,
      large: 56,
    },
    inputHeight: 48,
    
    // Card dimensions
    cardMinHeight: 200,
    cardMaxHeight: screenHeight * 0.8,
    
    // App-specific dimensions
    calendarCardWidth: screenWidth * 0.9,   // 90% of screen width
    calendarCardHeight: screenHeight * 0.7,  // 70% of screen height
    calendarDateSize: 120,                   // Large date number
    
    // Icon sizes
    iconSizes: {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
  },
  
  // Z-index layering
  zIndex: {
    background: -1,
    content: 0,
    card: 1,
    header: 10,
    overlay: 100,
    modal: 1000,
    popover: 1100,
    tooltip: 1200,
    toast: 1300,
  },
  
  // Safe areas and spacing
  safeArea: {
    // Minimum padding from screen edges
    horizontal: 20,
    vertical: Platform.select({
      ios: 44,      // Account for notch/home indicator
      android: 24,  // Account for system UI
      default: 20,
    }),
  },
};

/**
 * Responsive utilities
 */
export const isTablet = screenWidth >= Layout.breakpoints.tablet;
export const isMobile = screenWidth < Layout.breakpoints.tablet;
export const isLargeScreen = screenWidth >= Layout.breakpoints.desktop;

/**
 * Helper function to get responsive dimensions
 */
export const getResponsiveDimension = (
  mobileValue: number,
  tabletValue?: number,
  desktopValue?: number
): number => {
  if (isLargeScreen && desktopValue !== undefined) {
    return desktopValue;
  }
  if (isTablet && tabletValue !== undefined) {
    return tabletValue;
  }
  return mobileValue;
};

/**
 * Helper function to get responsive padding
 */
export const getResponsivePadding = () => ({
  horizontal: getResponsiveDimension(16, 24, 32),
  vertical: getResponsiveDimension(16, 20, 24),
});

/**
 * Component-specific layout tokens
 */
export const ComponentLayout = {
  // Screen containers
  screen: {
    padding: Layout.safeArea.horizontal,
    maxWidth: Layout.container.maxWidth,
  },
  
  // Card layouts
  card: {
    padding: getResponsiveDimension(16, 20, 24),
    margin: getResponsiveDimension(8, 12, 16),
    maxWidth: getResponsiveDimension(
      screenWidth - 32,  // Mobile: screen width minus padding
      600,               // Tablet: fixed max width
      500                // Desktop: smaller fixed width
    ),
  },
  
  // Button layouts
  button: {
    height: Layout.dimensions.buttonHeight.medium,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 88,  // Material Design minimum touch target
  },
  
  // Form layouts
  form: {
    fieldSpacing: 16,
    sectionSpacing: 32,
    inputHeight: Layout.dimensions.inputHeight,
    inputPadding: 16,
  },
  
  // App-specific layouts
  calendar: {
    cardWidth: Math.min(
      screenWidth * 0.9,          // 90% of screen
      400                         // Maximum width for readability
    ),
    cardHeight: getResponsiveDimension(
      screenHeight * 0.6,         // Mobile: 60% of screen height
      500,                        // Tablet: fixed height
      450                         // Desktop: smaller fixed height
    ),
    dateNumberSize: getResponsiveDimension(100, 120, 140),
    headerHeight: getResponsiveDimension(80, 100, 120),
  },
  
  // Answer options
  answerOption: {
    minHeight: 48,               // Minimum touch target
    padding: 16,
    marginBottom: 12,
  },
  
  // Navigation
  tabBar: {
    height: Layout.dimensions.tabBarHeight,
    paddingBottom: Platform.select({
      ios: 20,  // Account for home indicator
      default: 0,
    }),
  },
};

/**
 * Animation and transition utilities
 */
export const Animation = {
  // Duration tokens
  duration: {
    fast: 150,      // Quick feedback (button press)
    medium: 250,    // Default transitions
    slow: 400,      // Complex animations
    slower: 600,    // Page transitions
  },
  
  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  
  // Common animation presets
  presets: {
    fadeIn: {
      duration: 250,
      easing: 'ease-out',
    },
    slideUp: {
      duration: 300,
      easing: 'ease-out',
    },
    bounce: {
      duration: 400,
      easing: 'ease-out',
    },
  },
};