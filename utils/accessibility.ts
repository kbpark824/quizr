/**
 * Accessibility Utilities
 * Provides helper functions for focus management and screen reader announcements
 */
import { AccessibilityInfo, findNodeHandle } from 'react-native';

/**
 * Set focus to a specific element for screen readers
 * @param elementRef - React ref to the element to focus
 * @param delay - Optional delay in milliseconds (default: 100ms)
 */
export function setAccessibilityFocus(
  elementRef: React.RefObject<any>, 
  delay: number = 100
): void {
  if (!elementRef.current) return;

  const focusElement = () => {
    const reactTag = findNodeHandle(elementRef.current);
    if (reactTag) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  };

  if (delay > 0) {
    setTimeout(focusElement, delay);
  } else {
    focusElement();
  }
}

/**
 * Announce text to screen readers
 * @param announcement - Text to announce
 * @param priority - Announcement priority ('polite' or 'assertive')
 */
export function announceForAccessibility(
  announcement: string, 
  priority: 'polite' | 'assertive' = 'polite'
): void {
  AccessibilityInfo.announceForAccessibility(announcement);
}

/**
 * Check if screen reader is currently enabled
 * @returns Promise<boolean>
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch {
    return false;
  }
}

/**
 * Check if reduce motion is enabled (for users who prefer reduced animations)
 * @returns Promise<boolean>
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
}

/**
 * Enhanced accessibility state for interactive elements
 * Provides consistent accessibility properties for buttons, links, etc.
 */
export interface AccessibilityProps {
  accessible: boolean;
  accessibilityRole: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState?: {
    selected?: boolean;
    checked?: boolean;
    disabled?: boolean;
    expanded?: boolean;
  };
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
}

/**
 * Create accessibility props for buttons
 */
export function createButtonAccessibility(
  label: string,
  hint?: string,
  state?: {
    selected?: boolean;
    disabled?: boolean;
  }
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: state,
  };
}

/**
 * Create accessibility props for links
 */
export function createLinkAccessibility(
  label: string,
  hint?: string
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: 'link',
    accessibilityLabel: label,
    accessibilityHint: hint,
  };
}

/**
 * Create accessibility props for text content
 */
export function createTextAccessibility(
  label?: string,
  isHeader = false,
  liveRegion?: 'none' | 'polite' | 'assertive'
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: isHeader ? 'header' : 'text',
    accessibilityLabel: label || '',
    accessibilityLiveRegion: liveRegion,
  };
}

/**
 * Create accessibility props for toggle/switch elements
 */
export function createToggleAccessibility(
  label: string,
  isExpanded: boolean,
  hint?: string
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: {
      expanded: isExpanded,
    },
  };
}

/**
 * Accessibility guidelines and best practices
 */
export const AccessibilityGuidelines = {
  // Minimum touch target size (React Native uses points)
  MIN_TOUCH_TARGET_SIZE: 44,
  
  // Recommended delays for focus management
  FOCUS_DELAY: {
    IMMEDIATE: 0,
    QUICK: 50,
    NORMAL: 100,
    SLOW: 300,
  },
  
  // Semantic headings hierarchy
  HEADING_LEVELS: {
    H1: 1, // Main page title
    H2: 2, // Major sections
    H3: 3, // Subsections
    H4: 4, // Sub-subsections
  },
  
  // Live region priorities
  LIVE_REGION: {
    NONE: 'none' as const,
    POLITE: 'polite' as const,      // Wait for current speech to finish
    ASSERTIVE: 'assertive' as const, // Interrupt current speech
  },
} as const;