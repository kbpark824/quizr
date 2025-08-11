import React, { createContext, useContext } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme'; // Our custom useColorScheme
import { Colors } from '@/constants/Colors'; // Our custom Colors

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  colors: typeof Colors.light; // Type of our color object for the current theme
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme]; // Get the specific color set for the current scheme

  return (
    <ThemeContext.Provider value={{ colorScheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
