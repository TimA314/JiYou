import React, { useState, ReactNode, useEffect } from 'react';
import { ThemeContext, Theme, ThemeColors } from './ThemeContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface AppThemeProviderProps {
  children: ReactNode;
}

const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary: '#4527a0',
    secondary: '#f50057',
    paper: '#121212',
    background: '#141414',
    textSize: 16,
    textColor: '#CFCFCF',
  });

  useEffect(() => {
    const savedColors = localStorage.getItem('themeColors');
    if (savedColors) {
      setThemeColors(JSON.parse(savedColors));
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