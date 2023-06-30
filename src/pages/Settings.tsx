import React, { MutableRefObject, useContext, useState } from 'react';
import { ThemeColors, ThemeContext } from '../theme/ThemeContext';
import { Card, CardContent, Typography, Grid, Button, Slider, Box, Divider, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
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
  imagesOnlyMode: MutableRefObject<boolean>;
  hideExplicitContent: MutableRefObject<boolean>;
  fetchEvents: boolean;
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Settings ({imagesOnlyMode, hideExplicitContent, fetchEvents, setFetchEvents}: SettingsProps) {
  const { themeColors, setThemeColors } = useContext(ThemeContext);
  const [imagesOnly, setImagesOnly] = useState<boolean>(imagesOnlyMode.current);
  const [hideExplicit, setHideExplicit] = useState<boolean>(hideExplicitContent.current);

  const handleImagesOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    imagesOnlyMode.current = event.target.checked;
    setImagesOnly(event.target.checked);
  };

  const handleHideExplicitContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    hideExplicitContent.current = event.target.checked;
    setHideExplicit(event.target.checked);
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
    hideExplicitContent.current = true;
    imagesOnlyMode.current = false;
  };

  const handleSaveSettings = () => {
    localStorage.setItem('JiYouSettings', JSON.stringify({theme: themeColors, feedSettings: {hideExplicitContent: hideExplicitContent, imagesOnlyMode: imagesOnlyMode}}));
    setFetchEvents(true);
    alert('Settings Saved');
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
          <Button onClick={handleSaveSettings} variant="contained" color="secondary">Save</Button>
        </Box>
      </Grid>

      <Grid item xs={12} margin="10px">
        <Grid>
          <Typography variant="h5" style={{color: themeColors.textColor}}>
            Feed Settings
          </Typography>
        </Grid>
        <Grid>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={hideExplicit} onChange={handleHideExplicitContentChange}/>} 
              label="Hide Sensetive Content"
              style={{color: themeColors.textColor}}
              color={themeColors.textColor} />
            <FormControlLabel
              control={<Checkbox checked={imagesOnly} onChange={handleImagesOnlyChange} />} 
              label="Images Only"
              style={{color: themeColors.textColor}}
              color={themeColors.textColor} />
          </FormGroup>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h5" style={{color: themeColors.textColor}}>
          Apearance
        </Typography>
      </Grid>
      <Grid container spacing={3}>
        {Object.keys(themeColors).map((colorKey) => {
          const key = colorKey as keyof ThemeColors;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" style={{color: themeColors.textColor}}>{colorLabels[key]}</Typography>
                  {key === 'textColor' && (
                    <MuiColorInput 
                      inputProps={{ style: {color: themeColors.textColor}}} 
                      value={themeColors.textColor} 
                      onChange={handleTextColorChange} />
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
                    <MuiColorInput 
                      inputProps={{ style: {color: themeColors.textColor}}} 
                      value={themeColors[key]} 
                      onChange={handleColorChange(key)} />
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
