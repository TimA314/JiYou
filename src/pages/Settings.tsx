import React, { useContext, useState } from 'react';
import { ThemeColors, ThemeContext } from '../theme/ThemeContext';
import { Card, CardContent, Typography, Grid, Button, Slider, Box, Divider, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { MuiColorInput } from 'mui-color-input';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addMessage, setHideExplicitContent, setHideExplicitTags, setImageOnlyMode, setZapAmountSettings } from '../redux/slices/noteSlice';
import { toggleRefreshFeedNotes, toggleRefreshUserNotes } from '../redux/slices/eventsSlice';
import { useNavigate } from 'react-router';
import ZapSettings from '../components/ZapSettings';
import SensitiveContentList from '../components/SensitiveContentList';

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
  paper: '#212121',
  background: '#323232',
  textSize: 16,
  textColor: '#CFCFCF',
};

interface SettingsProps {}

export default function Settings ({}: SettingsProps) {
  const dispatch = useDispatch();
  const note = useSelector((state: RootState) => state.note);
  const { themeColors, setThemeColors } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleImagesOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked === note.imageOnlyMode) return;
    dispatch(setImageOnlyMode(event.target.checked))
  };

  const handleHideExplicitContentCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked === note.hideExplicitContent) return;
    dispatch(setHideExplicitContent(event.target.checked))
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
    dispatch(setHideExplicitContent(true))
    dispatch(setImageOnlyMode(false))
    dispatch(setZapAmountSettings([1, 12, 21, 210, 2100]))
    dispatch(setHideExplicitTags(["nsfw"]))
    dispatch(addMessage({message: 'Default Setting Set', isError: false}))
  };

  const handleSaveSettings = () => {
    localStorage.setItem('JiYouSettings', JSON.stringify({
      theme: themeColors,
      zapSettings: note.zapAmountSettings.join(","),
      feedSettings: {hideExplicitContent: note.hideExplicitContent, imagesOnlyMode: note.imageOnlyMode}
    }));
    dispatch(addMessage({message: 'Settings Saved', isError: false}))
    dispatch(toggleRefreshFeedNotes())
    dispatch(toggleRefreshUserNotes())
    navigate("/");
  };

  const handleTextSizeChange = (event: Event, value: number | number[], activeThumb: number) => {
    setThemeColors(prevColors => ({
      ...prevColors,
      textSize: value as number,
    }));
  };

  return (
    <Grid padding={1} container spacing={3} >
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
            <SensitiveContentList />  
            <FormControlLabel
              control={<Checkbox checked={note?.hideExplicitContent ?? true} onChange={handleHideExplicitContentCheckboxChange}/>} 
              label="Hide Sensetive Content"
              style={{color: themeColors.textColor}}
              color={themeColors.textColor} />
            <FormControlLabel
              control={<Checkbox checked={note?.imageOnlyMode ?? false} onChange={handleImagesOnlyChange} />} 
              label="Images Only"
              style={{color: themeColors.textColor}}
              color={themeColors.textColor} />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <ZapSettings />
        </Grid>
      </Grid>


      <Grid item xs={12}>
        <Typography variant="h5" style={{color: themeColors.textColor}}>
          Apearance
        </Typography>
      </Grid>
      <Grid margin={1} container spacing={3}>

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
