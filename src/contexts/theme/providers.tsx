import type { ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';
import { ThemeContext, type ThemeMode, type ThemePreference } from './contexts';

const STORAGE_KEY = 'theme';

const getDefaultMode = (): ThemeMode => {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  return storedTheme === 'dark' ? 'dark' : 'light';
};

const resolveMode = (preference: ThemePreference): ThemeMode => {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// The preview shows an unsaved choice without touching the saved mode, so leaving without saving restores it
export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [savedMode, setSavedMode] = useState<ThemeMode>(getDefaultMode);
  const [previewMode, setPreviewMode] = useState<ThemeMode | null>(null);
  const mode = previewMode ?? savedMode;

  const setThemePreference = (preference: ThemePreference) => {
    const newMode = resolveMode(preference);
    setSavedMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  const previewThemePreference = (preference: ThemePreference | null) => {
    setPreviewMode(preference ? resolveMode(preference) : null);
  };

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const contextValue = { mode, setThemePreference, previewThemePreference };

  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
};
