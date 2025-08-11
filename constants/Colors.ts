/**
 * Design System Colors
 * Professional color palette with semantic naming and proper contrast ratios
 */
export const Colors = {
  light: {
    // Primary brand colors
    primary: '#4F46E5',        // Indigo - main brand color
    primaryLight: '#6366F1',   // Lighter indigo for hover states
    primaryDark: '#3730A3',    // Darker indigo for pressed states
    
    // Secondary colors
    secondary: '#10B981',      // Emerald green for success states
    accent: '#F59E0B',         // Amber for warnings/highlights
    
    // Surface colors
    background: '#F9FAFB',     // Light gray background
    surface: '#FFFFFF',        // White surface for cards/components
    surfaceVariant: '#F3F4F6', // Subtle gray for secondary surfaces
    
    // Text colors
    text: '#111827',           // Dark gray for primary text
    textSecondary: '#6B7280',  // Medium gray for secondary text
    textMuted: '#9CA3AF',      // Light gray for muted text
    textInverse: '#FFFFFF',    // White text for dark backgrounds
    
    // Icon colors
    icon: '#6B7280',           // Medium gray for icons
    iconSecondary: '#9CA3AF',  // Light gray for secondary icons
    
    // Border and divider colors
    border: '#E5E7EB',         // Light border color
    borderStrong: '#D1D5DB',   // Stronger border for emphasis
    
    // State colors
    success: '#047857',        // Even darker green for better contrast (was #059669)
    warning: '#F59E0B',        // Amber for warnings  
    error: '#DC2626',          // Darker red for better contrast (was #EF4444)
    info: '#3B82F6',           // Blue for information
    
    // Interactive colors
    interactive: '#4F46E5',    // Primary color for interactive elements
    interactiveHover: '#6366F1', // Hover state
    interactivePressed: '#3730A3', // Pressed state
    
    // Specialized colors for Quizr
    calendar: '#DC2626',       // Red for calendar theme (desk calendar)
    calendarLight: '#FCA5A5', // Light red for calendar accents
  },
  
  dark: {
    // Primary brand colors (slightly adjusted for dark mode)
    primary: '#6366F1',        // Slightly lighter indigo for better visibility
    primaryLight: '#818CF8',   // Lighter variant
    primaryDark: '#4F46E5',    // Darker variant
    
    // Secondary colors
    secondary: '#34D399',      // Brighter emerald for dark backgrounds
    accent: '#FBBF24',         // Brighter amber for visibility
    
    // Surface colors
    background: '#111827',     // Very dark background
    surface: '#1F2937',        // Dark surface for cards/components
    surfaceVariant: '#374151', // Lighter dark gray for variants
    
    // Text colors
    text: '#F9FAFB',           // Light text for primary content
    textSecondary: '#D1D5DB',  // Medium light for secondary text
    textMuted: '#9CA3AF',      // Muted text
    textInverse: '#111827',    // Dark text for light backgrounds
    
    // Icon colors  
    icon: '#D1D5DB',           // Light gray for icons in dark mode
    iconSecondary: '#9CA3AF',  // Muted gray for secondary icons
    
    // Border and divider colors
    border: '#374151',         // Dark border
    borderStrong: '#4B5563',   // Stronger dark border
    
    // State colors (adjusted for dark mode)
    success: '#34D399',        // Brighter green
    warning: '#FBBF24',        // Brighter amber
    error: '#F87171',          // Softer red
    info: '#60A5FA',           // Brighter blue
    
    // Interactive colors  
    interactive: '#818CF8',    // Brighter primary for dark mode contrast (was #4F46E5)
    interactiveHover: '#6366F1', // Hover state
    interactivePressed: '#3730A3', // Pressed state
    
    // Specialized colors for Quizr
    calendar: '#F87171',       // Softer red for dark mode
    calendarLight: '#FCA5A5',  // Calendar accent
  },
};

// Legacy color aliases for backward compatibility during transition
// TODO: Remove these once all components are updated
export const LegacyColors = {
  white: Colors.light.surface,
  black: Colors.light.text,
  lightGray: Colors.light.background,
  mediumGray: Colors.light.surfaceVariant,
  darkGray: Colors.light.textSecondary,
  red: Colors.light.calendar,
  blue: Colors.light.info,
  green: Colors.light.success,
};