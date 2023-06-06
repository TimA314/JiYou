import React from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string | undefined;
  primary: string;
  secondary: string;
  paper: string;
  mode?: Theme;
}

export interface ThemeContextProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  themeColors: ThemeColors;
  setThemeColors: React.Dispatch<React.SetStateAction<ThemeColors>>;
}

export const ThemeContext = React.createContext<ThemeContextProps>({
  theme: 'dark',
  setTheme: () => {},
  themeColors: {
    primary: '#8E5AC3', // Default colors
    secondary: '#f50057',
    paper: '#ffffff',
    background: '#f5f5f5',
    mode: 'dark',
  },
  setThemeColors: () => {},
});