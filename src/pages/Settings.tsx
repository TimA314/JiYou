import React, { useContext } from 'react';
import { ThemeColors, ThemeContext } from '../theme/ThemeContext';
import { ChromePicker } from 'react-color';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';

const colorLabels: Record<keyof ThemeColors, string> = {
    primary: 'Main Color',
    secondary: 'Accent Color',
    paper: 'Content Background',
    background: 'Background Color',
    mode: 'dark'
};

  const defaultThemeColors: ThemeColors = {
    mode: 'dark',
    primary: '#7047c9',
    secondary: '#ff0024',
    paper: '#121212',
    background: '#000000',
  };

const Settings: React.FC = () => {
  const { themeColors, setThemeColors } = useContext(ThemeContext);

  const handleColorChange = (colorKey: keyof typeof themeColors) => (color: any) => {
    setThemeColors(prevColors => ({
      ...prevColors,
      [colorKey]: color.hex,
    }));
  };

  const handleSetDefault = () => {
    setThemeColors(defaultThemeColors);
  };

  const handleSaveColors = () => {
    localStorage.setItem('themeColors', JSON.stringify(themeColors));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">Settings</Typography>
      </Grid>

      {Object.keys(themeColors).map((colorKey) => {
        const key = colorKey as keyof ThemeColors;

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
            <Card>
              <CardContent>
                <Typography variant="h6">{colorLabels[key]}</Typography>
                <ChromePicker color={themeColors[key]} onChange={handleColorChange(key)} />
              </CardContent>
            </Card>
          </Grid>
        );
      })}

      <Grid item xs={12}>
        <Button onClick={handleSetDefault} variant="contained" color="primary">Set Default</Button>
        <Button onClick={handleSaveColors} variant="contained" color="primary">Save Colors</Button>
      </Grid>
    </Grid>
  );
};

export default Settings;
