/**
 * Design System Border Radius Tokens
 * Consistent rounded corners for visual harmony
 * Following modern design system practices with semantic naming
 */
export const BorderRadius = {
  // Base border radius scale
  none: 0,      // Sharp corners
  xs: 2,        // Very subtle rounding
  sm: 4,        // Small rounding for subtle elements
  md: 8,        // Default rounding for buttons, inputs
  lg: 12,       // Medium rounding for cards
  xl: 16,       // Large rounding for prominent elements
  xxl: 20,      // Very large rounding
  xxxl: 24,     // Maximum rounding for special elements
  
  // Circular/pill shapes
  full: 9999,   // Fully rounded (pill buttons, avatars)
  
  // Semantic border radius for specific components
  button: 8,           // Standard buttons
  buttonPill: 9999,    // Pill-shaped buttons
  card: 12,            // Card components
  input: 8,            // Form inputs
  chip: 16,            // Chip/tag components
  modal: 16,           // Modal corners
  image: 8,            // Image containers
  
  // App-specific radius
  calendarCard: 0,     // Sharp corners for desk calendar theme
  answerButton: 8,     // Answer option buttons
  flipButton: 8,       // Question flip button
};

/**
 * Helper function to get border radius
 * Usage: getBorderRadius('md') returns 8
 */
export const getBorderRadius = (size: keyof typeof BorderRadius): number => {
  return BorderRadius[size] ?? BorderRadius.md;
};

/**
 * Border radius combinations for complex components
 */
export const BorderRadiusCombinations = {
  // Top only (for headers)
  topOnly: {
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  
  // Bottom only (for footers)
  bottomOnly: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  
  // Left only (for tabs)
  leftOnly: {
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: 0,
  },
  
  // Right only (for tabs)
  rightOnly: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: BorderRadius.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: BorderRadius.md,
  },
  
  // Asymmetric combinations for unique designs
  modalTop: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
};

/**
 * Component-specific border radius presets
 */
export const ComponentBorderRadius = {
  // Interactive elements
  buttonPrimary: BorderRadius.button,
  buttonSecondary: BorderRadius.button,
  buttonPill: BorderRadius.buttonPill,
  
  // Content containers
  card: BorderRadius.card,
  cardHero: BorderRadius.lg,
  
  // Form elements
  input: BorderRadius.input,
  textarea: BorderRadius.input,
  select: BorderRadius.input,
  
  // Navigation
  tab: BorderRadius.sm,
  tabBar: BorderRadius.lg,
  
  // App-specific
  calendarPage: BorderRadius.calendarCard,  // Keep sharp for calendar theme
  answerOption: BorderRadius.answerButton,
  flipButton: BorderRadius.flipButton,
  
  // Overlays
  modal: BorderRadius.modal,
  popover: BorderRadius.md,
  tooltip: BorderRadius.sm,
  
  // Media
  avatar: BorderRadius.full,
  image: BorderRadius.image,
  thumbnail: BorderRadius.sm,
};