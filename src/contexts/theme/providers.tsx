import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ThemeProvider as StyledThemeProvider, type DefaultTheme } from 'styled-components';
import { GlobalStyle } from '../../styles/global-style';
import { darkTheme, lightTheme } from '../../styles/themes';
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

  const theme = useMemo<DefaultTheme>(() => {
    const baseTheme = mode === 'dark' ? darkTheme : lightTheme;

    return {
      ...baseTheme,
      mode,
    };
  }, [mode]);

  const contextValue = useMemo(() => ({ mode, setThemeMode }), [mode, setThemeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
