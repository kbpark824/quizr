/**
 * Color Contrast Validation Utility
 * Validates WCAG 2.1 color contrast ratios for accessibility compliance
 */

// WCAG 2.1 AA Standards
export const WCAG_AA_NORMAL = 4.5;     // Normal text minimum contrast ratio
export const WCAG_AA_LARGE = 3.0;      // Large text minimum contrast ratio (18pt+ or 14pt+ bold)
export const WCAG_AAA_NORMAL = 7.0;    // Enhanced contrast for normal text
export const WCAG_AAA_LARGE = 4.5;     // Enhanced contrast for large text

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    return null;
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return { r, g, b };
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio from 1 (no contrast) to 21 (maximum contrast)
 */
export function getContrastRatio(foreground: string, background: string): number | null {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) {
    return null;
  }
  
  const fgLuminance = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA standards
 */
export function meetsWCAG_AA(
  foreground: string, 
  background: string, 
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  if (!ratio) return false;
  
  const threshold = isLargeText ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
  return ratio >= threshold;
}

/**
 * Check if a color combination meets WCAG AAA standards
 */
export function meetsWCAG_AAA(
  foreground: string, 
  background: string, 
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  if (!ratio) return false;
  
  const threshold = isLargeText ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
  return ratio >= threshold;
}

/**
 * Get contrast level description
 */
export function getContrastLevel(foreground: string, background: string, isLargeText = false): string {
  const ratio = getContrastRatio(foreground, background);
  if (!ratio) return 'Invalid colors';
  
  if (meetsWCAG_AAA(foreground, background, isLargeText)) {
    return 'AAA Enhanced';
  } else if (meetsWCAG_AA(foreground, background, isLargeText)) {
    return 'AA Compliant';
  } else {
    return 'Non-compliant';
  }
}

/**
 * Validate color combinations used in the app
 */
export function validateAppColorContrasts() {
  const results: Array<{
    name: string;
    foreground: string;
    background: string;
    ratio: number | null;
    level: string;
    isLargeText: boolean;
    passes: boolean;
  }> = [];

  // Define color combinations to validate
  const combinations = [
    // Light mode combinations
    { name: 'Primary text on light background', fg: '#111827', bg: '#F9FAFB', isLarge: false },
    { name: 'Secondary text on light background', fg: '#6B7280', bg: '#F9FAFB', isLarge: false },
    { name: 'Interactive text on light background', fg: '#4F46E5', bg: '#F9FAFB', isLarge: false },
    { name: 'White text on interactive background', fg: '#FFFFFF', bg: '#4F46E5', isLarge: false },
    { name: 'White text on calendar red', fg: '#FFFFFF', bg: '#DC2626', isLarge: false },
    { name: 'Error text on light background', fg: '#EF4444', bg: '#F9FAFB', isLarge: false },
    { name: 'Success text on light background', fg: '#10B981', bg: '#F9FAFB', isLarge: false },
    
    // Dark mode combinations
    { name: 'Light text on dark background', fg: '#F9FAFB', bg: '#111827', isLarge: false },
    { name: 'Secondary text on dark background', fg: '#D1D5DB', bg: '#111827', isLarge: false },
    { name: 'Interactive text on dark background', fg: '#6366F1', bg: '#111827', isLarge: false },
    { name: 'Dark text on light surface', fg: '#111827', bg: '#1F2937', isLarge: false },
    
    // Large text variations
    { name: 'Large interactive text on light background', fg: '#4F46E5', bg: '#F9FAFB', isLarge: true },
    { name: 'Large error text on light background', fg: '#EF4444', bg: '#F9FAFB', isLarge: true },
  ];

  combinations.forEach(combo => {
    const ratio = getContrastRatio(combo.fg, combo.bg);
    const level = getContrastLevel(combo.fg, combo.bg, combo.isLarge);
    const passes = meetsWCAG_AA(combo.fg, combo.bg, combo.isLarge);

    results.push({
      name: combo.name,
      foreground: combo.fg,
      background: combo.bg,
      ratio,
      level,
      isLargeText: combo.isLarge,
      passes
    });
  });

  return results;
}