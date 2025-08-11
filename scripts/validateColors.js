/**
 * Color Contrast Validation Script
 * Run this to validate all color combinations in the app meet WCAG standards
 */
// Simple validation function
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  if (hex.length !== 6) return null;
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return { r, g, b };
}

function getRelativeLuminance(r, g, b) {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function getContrastRatio(foreground, background) {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return null;
  
  const fgLuminance = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function validateAppColorContrasts() {
  const combinations = [
    { name: 'Primary text on light background', fg: '#111827', bg: '#F9FAFB', isLarge: false },
    { name: 'Secondary text on light background', fg: '#6B7280', bg: '#F9FAFB', isLarge: false },
    { name: 'Interactive text on light background', fg: '#4F46E5', bg: '#F9FAFB', isLarge: false },
    { name: 'White text on interactive background', fg: '#FFFFFF', bg: '#4F46E5', isLarge: false },
    { name: 'White text on calendar red', fg: '#FFFFFF', bg: '#DC2626', isLarge: false },
    { name: 'Error text on light background', fg: '#DC2626', bg: '#F9FAFB', isLarge: false },
    { name: 'Success text on light background', fg: '#047857', bg: '#F9FAFB', isLarge: false },
    { name: 'Light text on dark background', fg: '#F9FAFB', bg: '#111827', isLarge: false },
    { name: 'Secondary text on dark background', fg: '#D1D5DB', bg: '#111827', isLarge: false },
    { name: 'Interactive text on dark background', fg: '#818CF8', bg: '#111827', isLarge: false },
  ];

  return combinations.map(combo => {
    const ratio = getContrastRatio(combo.fg, combo.bg);
    const threshold = combo.isLarge ? 3.0 : 4.5;
    const passes = ratio >= threshold;
    
    return {
      name: combo.name,
      foreground: combo.fg,
      background: combo.bg,
      ratio,
      passes,
      isLargeText: combo.isLarge
    };
  });
}

console.log('🎨 Validating Color Contrast Ratios...\n');

try {
  const results = validateAppColorContrasts();
  
  let passCount = 0;
  let failCount = 0;
  
  results.forEach(result => {
    const status = result.passes ? '✅ PASS' : '❌ FAIL';
    const ratio = result.ratio ? result.ratio.toFixed(2) : 'N/A';
    
    console.log(`${status} ${result.name}`);
    console.log(`   Ratio: ${ratio}:1 | Level: ${result.level} | Large Text: ${result.isLargeText}`);
    console.log(`   Colors: ${result.foreground} on ${result.background}\n`);
    
    if (result.passes) {
      passCount++;
    } else {
      failCount++;
    }
  });
  
  console.log(`📊 Summary:`);
  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   Total: ${results.length}`);
  
  if (failCount > 0) {
    console.log('\n⚠️  Some color combinations do not meet WCAG AA standards.');
    console.log('Consider adjusting colors to improve accessibility.');
  } else {
    console.log('\n🎉 All color combinations meet WCAG AA standards!');
  }
  
} catch (error) {
  console.error('❌ Error validating colors:', error);
  process.exit(1);
}