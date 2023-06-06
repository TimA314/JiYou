import React, { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';
import { ChromePicker } from 'react-color';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const Settings: React.FC = () => {
  const { themeColors, setThemeColors } = useContext(ThemeContext);

  const handleColorChange = (colorKey: keyof typeof themeColors) => (color: any) => {
    setThemeColors(prevColors => ({
      ...prevColors,
      [colorKey]: color.hex,
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">Settings</Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Primary Color</Typography>
            <ChromePicker color={themeColors.primary} onChange={handleColorChange('primary')} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Secondary Color</Typography>
            <ChromePicker color={themeColors.secondary} onChange={handleColorChange('secondary')} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Background Color</Typography>
            <ChromePicker color={themeColors.background} onChange={handleColorChange('background')} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Paper Color</Typography>
            <ChromePicker color={themeColors.paper} onChange={handleColorChange('paper')} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Settings;
