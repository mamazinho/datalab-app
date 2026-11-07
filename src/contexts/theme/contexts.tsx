import { createContext, use } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

export interface ThemeContextType {
  mode: ThemeMode;
  setThemePreference: (preference: ThemePreference) => void;
  previewThemePreference: (preference: ThemePreference | null) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = use(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }

  return context;
};
