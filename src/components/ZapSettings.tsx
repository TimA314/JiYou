import React, { useContext, useState } from 'react';
import { Slide, Box, Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ThemeContext } from '../theme/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { removeZapAmountSettings, setZapAmountSettings } from '../redux/slices/noteSlice';

const ZapSettings = () => {
    const { themeColors } = useContext(ThemeContext);
    const note = useSelector((state: RootState) => state.note);
    const [newAmount, setNewAmount] = useState<number | string>('');
    const dispatch = useDispatch();

    const handleAddAmount = () => {
        if (newAmount && typeof(newAmount) === 'number' && newAmount > 0) {
            dispatch(setZapAmountSettings(newAmount));
        }
    };

  const handleDeleteAmount = (amount: number) => {
    dispatch(removeZapAmountSettings(amount));
  };

  return (
    <Box>
      <Typography variant='h6' color={themeColors.textColor}>
        Chip Amounts
      </Typography>

      <Box
        sx={{
            maxHeight: '10rem',
            overflowY: 'auto',
        }}>

        <List style={{color: themeColors.textColor}}>
            {note.zapAmountSettings.map((amount, index) => (
                <Slide direction="left" in={true} mountOnEnter unmountOnExit key={index}>
                <ListItem>
                <ListItemText color={themeColors.textColor} primary={amount} />
                <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDeleteAmount(amount)}>
                    <DeleteIcon color='error' />
                    </IconButton>
                </ListItemSecondaryAction>
                </ListItem>
            </Slide>
            ))}
        </List>

        </Box>
      
      <Box display="flex" alignItems="center">
        <TextField
          type="number"
          label="New Amount"
          variant="outlined"
          value={newAmount}
          sx={{ marginRight: '1rem', color: themeColors.textColor }}
          InputLabelProps={{sx: {color: themeColors.textColor}}}
          onChange={e => {
            const val = Number(e.target.value);
            if (val >= 1 || e.target.value === '') {
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
    </Box>
  );
};

export default ZapSettings;
