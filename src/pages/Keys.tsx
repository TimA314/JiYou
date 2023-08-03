import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Grid, Stack, Paper, Button, Tooltip, Snackbar, IconButton } from '@mui/material';
import { useContext, useState } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { ThemeContext } from '../theme/ThemeContext';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Close, VisibilityOff } from '@mui/icons-material';



interface KeysProps {}

export default function Keys({}: KeysProps) {
  const keys = useSelector((state: RootState) => state.keys);
  const [showSk, setShowSk] = useState(false);
  const [copySkSuccess, setCopySkSuccess] = useState(false);
  const [copyPkSuccess, setCopyPkSuccess] = useState(false);

  const { themeColors } = useContext(ThemeContext);

  const copySkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(keys.privateKey.encoded);
      setCopySkSuccess(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyPkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(keys.publicKey.encoded);
      setCopyPkSuccess(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClose = () => {
    setCopyPkSuccess(false);
  };

  return (
    <Grid
    container
    direction="column"

    alignItems="center"
    style={{ minHeight: '100vh' }}
    >
        <Box >
          {keys.privateKey.decoded === "" ?
            <Paper sx={{padding: "10px"}}>
              <Stack flexDirection="row" direction='row' spacing="2" justifyContent="center">
                <CelebrationIcon color='success'/>
                <CelebrationIcon color='success'/>
                <CelebrationIcon color='success'/>
              </Stack>
              <Typography id="modal-modal-title" variant="h6" color={themeColors.textColor} component="h2" textAlign="center" marginBottom="5px">
                Good Job using a Nostr Extension! Your Secret Key is not stored here.
              </Typography> 
            </Paper>
              :  
            <Box>
              <Paper elevation={3} style={{padding: '10px', margin: '10px', textAlign: 'center'}}>
                <Box>
                  <Stack flexDirection="row" direction='row' spacing="2" justifyContent="space-between">
                    <WarningIcon color='warning'/>
                    <WarningIcon color='warning'/>
                  </Stack>
                </Box>
                <Typography
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }} 
                  fontSize="small" 
                  textAlign="center" 
                  color={themeColors.textColor}
                >
                  <strong > IT IS HIGHLY RECCOMENDED TO USE A <br/> NOSTR EXTENSION TO HANDLE YOUR <br/> SECRET KEY.</strong>
                </Typography>
                <Box>
                  <Stack flexDirection="row" direction='row' spacing="2" justifyContent="space-between">
                    <WarningIcon color='warning'/>
                    <WarningIcon color='warning'/>
                  </Stack>
                </Box>
              </Paper>
                <Typography id="pkTitle" variant="h6" color="secondary" component="h2" marginBottom="5px">
                  Secret Key
                </Typography>
                  <Grid container direction="column" spacing={2}>
                  <Grid item>
                  <Tooltip title="Click to reveal secret key">
                    <Button onClick={() => setShowSk(!showSk)}>
                      { showSk ? <VisibilityOff /> : <VisibilityIcon /> }
                      <Typography
                        style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }} 
                        variant='body1' 
                        color={themeColors.textColor}
                      > 
                        {showSk ? keys.privateKey.encoded : ' ••••••••••••••••••••••••••••••••••••'}
                      </Typography>
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Button onClick={copySkToClipboard} variant="contained" color="secondary">
                    Copy Secret Key
                  </Button>
                  <Snackbar
                    open={copySkSuccess}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    message="Secret key copied to clipboard"
                    action={
                      <IconButton
                        size="small"
                        color="inherit"
                        onClick={handleClose}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    }
                  />
                </Grid>
                  </Grid>
                <Typography id="modal-modal-description" color={themeColors.textColor} sx={{ mt: 2}}>
                  This is your secret key. <strong style={{color: "red"}}>DO NOT</strong> share this with others. Your private key will be stored within your browser's local storage. It will be used to sign events. <br/> 
                  </Typography>
            </Box>
      }
          <Box sx={{marginTop: "50px"}}>          
            <Typography id="pkTitle" variant="h6" color={themeColors.textColor} component="h2" marginBottom="5px">
              Public Key
            </Typography>
          </Box>


            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Paper sx={{padding: "5px"}}>
                  <Typography 
                    style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }} 
                    variant='body1' 
                    color={themeColors.primary} >
                    {keys.publicKey.encoded}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid item sx={{marginTop: "10px"}}>
                  <Button onClick={copyPkToClipboard} variant="contained" color="primary">
                    Copy Public Key
                  </Button>
                  <Snackbar
                    open={copyPkSuccess}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    message="Secret key copied to clipboard"
                    action={
                      <IconButton
                        size="small"
                        color="inherit"
                        onClick={handleClose}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    }
                  />
                </Grid>

          <Typography variant='caption' sx={{ mt: 2 }} color={themeColors.textColor}>
            This is your public key. You can share this with others. Your public key will be stored within your browser's local storage. It will be used to get your profile and other settings.
            </Typography>
        </Box>
    </Grid>
  );
}
