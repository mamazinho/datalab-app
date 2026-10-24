import type { ReactNode } from 'react';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ThemeContext, type ThemeMode } from './contexts';

const STORAGE_KEY = 'theme';

const getDefaultMode = (): ThemeMode => {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  return storedTheme === 'dark' ? 'dark' : 'light';
};

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(getDefaultMode);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const contextValue = useMemo(() => ({ mode, setThemeMode }), [mode, setThemeMode]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
