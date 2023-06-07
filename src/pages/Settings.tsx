import React, { useContext } from 'react';
import { ThemeColors, ThemeContext } from '../theme/ThemeContext';
import { ChromePicker } from 'react-color';
import { Card, CardContent, Typography, Grid, Button, Slider, Box } from '@mui/material';


const colorLabels: Record<keyof ThemeColors, string> = {
  primary: 'Main Color',
  secondary: 'Accent Color',
  paper: 'Content Background',
  background: 'Background Color',
  textSize: 'Note Text Size',
  textColor: 'Text Color',
};

const defaultThemeColors: ThemeColors = {
  primary: '#7047c9',
  secondary: '#ff0024',
  paper: '#121212',
  background: '#1F1B24',
  textSize: 16,
  textColor: '#B2B2B2',
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

  const handleTextSizeChange = (event: Event, value: number | number[], activeThumb: number) => {
    setThemeColors(prevColors => ({
      ...prevColors,
      textSize: value as number,
    }));
  };

  const handleTextColorChange = (color: any) => {
    setThemeColors(prevColors => ({
      ...prevColors,
      textColor: color.hex,
    }));
  };

  return (
    <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h4" style={{color: themeColors.textColor}}>Settings</Typography>
    </Grid>

    <Grid item xs={12}>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={handleSetDefault} variant="contained" color="primary">Set Default</Button>
        <Button onClick={handleSaveColors} variant="contained" color="secondary">Save</Button>
      </Box>
    </Grid>

      {Object.keys(themeColors).map((colorKey) => {
        const key = colorKey as keyof ThemeColors;

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
            <Card>
              <CardContent>
                <Typography variant="h6" style={{color: themeColors.textColor}}>{colorLabels[key]}</Typography>
                {key === 'textColor' && (
                  <ChromePicker color={themeColors[key]} onChange={handleTextColorChange} />
                )}

                {key === 'textSize' && (
                  <div>
                    <Slider
                      value={themeColors[key]}
                      onChange={handleTextSizeChange}
                      min={12}
                      max={24}
                      step={2}
                    />
                    <Typography style={{fontSize: themeColors.textSize, color: themeColors.textColor}}>
                      Sample Text
                    </Typography>
                  </div>
                )}

                {key !== 'textSize' && key !== 'textColor' && (
                  <ChromePicker color={themeColors[key]} onChange={handleColorChange(key)} />
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Settings;
