/**
 * Design System Spacing Tokens
 * Based on 8px grid system for consistent layouts
 * Follow Material Design and iOS spacing principles
 */
export const Spacing = {
  // Base unit: 8px
  base: 8,
  
  // Spacing scale
  xs: 4,    // 0.5 * base - Minimal spacing for tight layouts
  sm: 8,    // 1 * base   - Small spacing between related elements
  md: 16,   // 2 * base   - Medium spacing, most common use
  lg: 24,   // 3 * base   - Large spacing between sections
  xl: 32,   // 4 * base   - Extra large spacing for major separations
  xxl: 48,  // 6 * base   - Maximum spacing for significant breaks
  xxxl: 64, // 8 * base   - Largest spacing for major layout divisions
  
  // Semantic spacing (mapped to scale above)
  padding: {
    container: 20,    // Main container padding (slightly off-grid for mobile)
    card: 16,         // Card internal padding
    button: 12,       // Button internal padding
    input: 12,        // Input field padding
  },
  
  margin: {
    section: 32,      // Between major sections
    element: 16,      // Between related elements
    text: 8,          // Between text elements
    tight: 4,         // For closely related items
  },
  
  // Component-specific spacing
  gap: {
    list: 8,          // Between list items
    grid: 12,         // Between grid items
    form: 16,         // Between form fields
    navigation: 24,   // Between navigation elements
  },
};

/**
 * Helper function to get consistent spacing values
 * Usage: getSpacing('md') returns 16
 */
export const getSpacing = (size: keyof typeof Spacing): number => {
  const value = Spacing[size];
  return typeof value === 'number' ? value : Spacing.md;
};

/**
 * Helper function to create multiple spacing values
 * Usage: getSpacing(['sm', 'md']) returns [8, 16]
 */
export const getSpacings = (sizes: (keyof typeof Spacing)[]): number[] => {
  return sizes.map(size => getSpacing(size));
};