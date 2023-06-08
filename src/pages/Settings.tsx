import React, { useContext } from 'react';
import { ThemeColors, ThemeContext } from '../theme/ThemeContext';
import { ChromePicker } from 'react-color';
import { Card, CardContent, Typography, Grid, Button, Slider, Box, Divider } from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const colorLabels: Record<keyof ThemeColors, string> = {
  primary: 'Main Color',
  secondary: 'Accent Color',
  paper: 'Content Background',
  background: 'Background Color',
  textSize: 'Note Text Size',
  textColor: 'Text Color',
};

const defaultThemeColors: ThemeColors = {
  primary: '#4527a0',
  secondary: '#f50057',
  paper: '#121212',
  background: '#141414',
  textSize: 14,
  textColor: '#CFCFCF',
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
      <Typography variant="h4" style={{color: themeColors.textColor}}><SettingsSuggestIcon color="primary" /> Settings</Typography>
    </Grid>
    
    <Divider />

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
                      min={4}
                      max={32}
                      step={1}
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
