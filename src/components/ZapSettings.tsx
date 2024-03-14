import React, { useContext, useState } from 'react';
import { Slide, Box, Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Accordion } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ThemeContext } from '../theme/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { removeZapAmountSettings, addZapAmountSettings } from '../redux/slices/noteSlice';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

const ZapSettings = () => {
    const { themeColors } = useContext(ThemeContext);
    const note = useSelector((state: RootState) => state.note);
    const [newAmount, setNewAmount] = useState<number | string>('');
    const [displayZapSettings, setDisplayZapSettings] = useState(false);
    const dispatch = useDispatch();

    const handleAddAmount = () => {
        if (newAmount && typeof(newAmount) === 'number' && newAmount > 0) {
            dispatch(addZapAmountSettings(newAmount));
        }
    };

  const handleDeleteAmount = (amount: number) => {
    dispatch(removeZapAmountSettings(amount));
  };

  return (
    <Box>
      <Typography variant='body1' color={themeColors.textColor}>
        Zap Amounts
      </Typography>
      
      <Box display="flex" alignItems="center">
        <Box onClick={() => setDisplayZapSettings((prev) => !prev)}>
          {displayZapSettings ? <UnfoldLessIcon sx={{color: themeColors.textColor }}/> : <UnfoldMoreIcon sx={{color: themeColors.textColor }}/>}
        </Box>
        <TextField
          type="number"
          label="New Amount"
          variant="outlined"
          size='small'
          value={newAmount}
          sx={{ marginRight: '1rem', color: themeColors.textColor }}
          InputLabelProps={{sx: {color: themeColors.textColor}}}
          onChange={e => {
            const val = Number(e.target.value);
            if (val >= 1 || e.target.value !== '') {
              setNewAmount(val);
            }
          }}
          InputProps={{
            style: { color: themeColors.textColor},
        }}
        />
        <Button variant="contained" size='small' color="primary" onClick={handleAddAmount}>
          Add Zap Amount
        </Button>
      </Box>

      {displayZapSettings ? 
        <Box
          sx={{
              maxHeight: '10rem',
              overflowY: 'auto',
          }}>
          <List style={{color: themeColors.textColor}}>
              {note.zapAmountSettings.map((amount, index) => (
                  <ListItem key={index}>
                      <ListItemText color={themeColors.textColor} primary={amount} />
                      <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleDeleteAmount(amount)}>
                          <DeleteIcon color='error' />
                          </IconButton>
                      </ListItemSecondaryAction>
                  </ListItem>
              ))}
          </List>
        </Box>
        : <Box></Box>
      }
    </Box>
  );
};

export default ZapSettings;
