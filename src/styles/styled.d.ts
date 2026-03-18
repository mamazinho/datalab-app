import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      surfaceAlt: string;
      text: string;
      textSecondary: string;
      primary: string;
      primaryText: string;
      border: string;
      error: string;
      success: string;
      inputBackground: string;
      overlay: string;
      shadow: string;
    };
    fonts: {
      main: string;
    };
    mode?: 'light' | 'dark';
  }
}
