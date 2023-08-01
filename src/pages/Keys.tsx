import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Grid, Stack, Paper } from '@mui/material';
import { useContext } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { ThemeContext } from '../theme/ThemeContext';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';


interface KeysProps {}

export default function Keys({}: KeysProps) {
  const keys = useSelector((state: RootState) => state.keys);
  const { themeColors } = useContext(ThemeContext);

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
                      <Typography
                        style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }} 
                        variant='body1' 
                        color={themeColors.textColor}
                      > 
                        {keys.privateKey.encoded}
                      </Typography>
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

          <Typography variant='caption' sx={{ mt: 2 }} color={themeColors.textColor}>
            This is your public key. You can share this with others. Your public key will be stored within your browser's local storage. It will be used to get your profile and other settings.
            </Typography>
        </Box>
    </Grid>
  );
}
