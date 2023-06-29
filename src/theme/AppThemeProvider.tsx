import React, { useState, ReactNode, useEffect } from 'react';
import { ThemeContext, Theme, ThemeColors } from './ThemeContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface AppThemeProviderProps {
  children: ReactNode;
}

const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary: '#5D37D5',
    secondary: '#f50057',
    paper: '#121212',
    background: '#111111',
    textSize: 16,
    textColor: '#CFCFCF',
  });

  useEffect(() => {
    const settings = localStorage.getItem('JiYouSettings');
    if (settings) {
      setThemeColors(JSON.parse(settings).theme);
    }
  }, []);
  

  const currentTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: themeColors.primary,
      },
      secondary: {
        main: themeColors.secondary,
      },
      background: {
        paper: themeColors.paper,
        default: themeColors.background,
      },
    }
  });
  

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeColors, setThemeColors }}>
      <ThemeProvider theme={currentTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider;
