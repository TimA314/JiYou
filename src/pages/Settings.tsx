import React, { useContext, useState } from 'react';
import { ThemeColors, ThemeContext } from '../theme/ThemeContext';
import { Card, CardContent, Typography, Grid, Button, Slider, Box, Divider, Checkbox } from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { MuiColorInput } from 'mui-color-input';

const colorLabels: Record<keyof ThemeColors, string> = {
  primary: 'Main Color',
  secondary: 'Accent Color',
  paper: 'Content Background',
  background: 'Background Color',
  textSize: 'Content Text Size',
  textColor: 'Text Color',
};

const defaultThemeColors: ThemeColors = {
  primary: '#5D37D5',
  secondary: '#f50057',
  paper: '#121212',
  background: '#111111',
  textSize: 14,
  textColor: '#CFCFCF',
};

interface SettingsProps {
  imagesOnlyMode: boolean;
  setImagesOnlyMode: (imagesOnlyMode: boolean) => void;
  hideExplicitContent: boolean;
  setHideExplicitContent: (hideExplicitContent: boolean) => void;
}

export default function Settings ({imagesOnlyMode, setImagesOnlyMode, hideExplicitContent, setHideExplicitContent}: SettingsProps) {
  const { themeColors, setThemeColors } = useContext(ThemeContext);
  const [isPickerOpen, setIsPickerOpen] = useState<Record<keyof ThemeColors, boolean>>({
    primary: false,
    secondary: false,
    paper: false,
    background: false,
    textSize: false,
    textColor: false,
  });

  const togglePicker = (colorKey: keyof typeof isPickerOpen) => {
    setIsPickerOpen(prevState => ({
      ...prevState,
      [colorKey]: !prevState[colorKey],
    }));
  };

  const handleImagesOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImagesOnlyMode(event.target.checked);
  };

  const handleHideExplicitContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHideExplicitContent(event.target.checked);
  };
  
  const handleColorChange = (colorKey: keyof ThemeColors) => (color: string, colors: any) => {
    setThemeColors(prevColors => ({
      ...prevColors,
      [colorKey]: color,
    }));
  };
  
  const handleTextColorChange = (color: string, colors: any) => {
    setThemeColors(prevColors => ({
      ...prevColors,
      textColor: color,
    }));
  };

  const handleSetDefault = () => {
    setThemeColors(defaultThemeColors);
  };

  const handleSaveColors = () => {
    localStorage.setItem('settings', JSON.stringify({theme: themeColors, settings: {hideExplicitContent: hideExplicitContent, imagesOnlyMode: imagesOnlyMode}}));
  };

  const handleTextSizeChange = (event: Event, value: number | number[], activeThumb: number) => {
    setThemeColors(prevColors => ({
      ...prevColors,
      textSize: value as number,
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

      <Grid item xs={12} margin="10px">
        <Typography variant="h5" style={{color: themeColors.textColor}}>
          Feed Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Checkbox checked={imagesOnlyMode} onChange={handleImagesOnlyChange} inputProps={{ 'aria-label': 'controlled' }} />
            <Typography variant="subtitle1" style={{color: themeColors.textColor}}>Images Only Mode</Typography>
          </Grid>
          <Grid item direction="row" xs={12} sm={6} md={4} lg={3}>
            <Checkbox checked={hideExplicitContent} onChange={handleHideExplicitContentChange} inputProps={{ 'aria-label': 'controlled' }}/>
            <Typography variant="subtitle1" style={{color: themeColors.textColor}}>Hide Sensitive Content</Typography>
          </Grid>
      </Grid>


      <Grid item xs={12}>
        <Typography variant="h5" style={{color: themeColors.textColor}}>
          Apearance
        </Typography>
      </Grid>
        {Object.keys(themeColors).map((colorKey) => {
          const key = colorKey as keyof ThemeColors;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" style={{color: themeColors.textColor}}>{colorLabels[key]}</Typography>
                  {key === 'textColor' && (
                    <MuiColorInput value={themeColors.textColor}  onChange={handleTextColorChange} />
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
                        This Size
                      </Typography>
                    </div>
                  )}

                  {key !== 'textSize' && key !== 'textColor' && (
                    <MuiColorInput value={themeColors[key]} onChange={handleColorChange(key)} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};
