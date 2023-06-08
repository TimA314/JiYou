import React from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  paper: string;
  background: string;
  textSize: number;
  textColor: string;
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
    primary: '#4527a0',
    secondary: '#f50057',
    paper: '#121212',
    background: '#141414',
    textSize: 16,
    textColor: '#CFCFCF',
  },
  setThemeColors: () => {},
});
