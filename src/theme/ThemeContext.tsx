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
    primary: '#5D37D5',
    secondary: '#f50057',
    paper: '#2A2438',
    background: '#352F44',
    textSize: 16,
    textColor: '#CFCFCF',
  },
  setThemeColors: () => {},
});
