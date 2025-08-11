import { Colors } from '@/constants/Colors'; // Keep this for type safety
import { useTheme } from '@/providers/ThemeProvider'; // Import our custom useTheme hook

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { colors, colorScheme } = useTheme(); // Get colors and colorScheme from our context

  const colorFromProps = props[colorScheme]; // Use colorScheme from context

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName]; // Use colors from context
  }
}
