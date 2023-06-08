import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { EventTemplate, Kind, SimplePool, finishEvent, nip19, validateEvent } from 'nostr-tools';
import { Box, Paper, styled } from '@mui/material';
import { ProfileContent } from '../nostr/Types';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';


const CustomDialog = styled(Dialog)(({ }) => ({
  '& .MuiDialog-paper': {
    width: '80%',
    maxWidth: '800px',
    maxHeight: '90%',
  },
}));

interface SignEventDialogProps {
    signEventOpen: boolean;
    setSignEventOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setEventToSign: React.Dispatch<React.SetStateAction<EventTemplate | null>>;
    event: EventTemplate | null;
    pool: SimplePool | null;
    relays: string[];
    setProfile: React.Dispatch<React.SetStateAction<ProfileContent>>;
    setRelays: React.Dispatch<React.SetStateAction<string[]>>;
  }

export default function SignEventDialog({ 
    signEventOpen, 
    setSignEventOpen,
    setEventToSign, 
    event, 
    pool, 
    relays, 
    setProfile, 
    setRelays }: SignEventDialogProps) {
    const { themeColors } = useContext(ThemeContext);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));


  const signEventManually = async () => {
    if (!pool){
      alert("No pool");
      return;
    };

    const secretKey = localStorage.getItem("sk");
    const decodedSk = nip19.decode(secretKey ?? "");

    if (!decodedSk || decodedSk.data.toString().trim() === "") {
      alert("Invalid secret key");
      return;
    }

    if (!event){
      alert("No event found");
      return;
    }

    var signedEvent = finishEvent(event, decodedSk.data.toString());
    const validated = validateEvent(signedEvent);

    if (!validated) {
      alert("Invalid event");
      return;
    }

    const pubs = pool.publish(relays, signedEvent)
    
    pubs.on("ok", (pub: string) => {
      console.log("Posted to relay " + pub)
    })
    
    pubs.on("failed", (error: string) => {
      console.log("Failed to post to relay " + error)
    })

    setEventToSign(null);
    setSignEventOpen(false);

    // Update relays if it's a relay list event
    if (signedEvent.kind === Kind.RelayList){
      const relaysFromEvent = signedEvent.tags
      .filter((tags) => tags[0] === 'r' && tags[1].startsWith('wss://'))
      .map((tags) => tags[1]);
      setRelays(relaysFromEvent);
    }
    
    // Update profile if it's a metadata event
    if (signedEvent.kind === Kind.Metadata) {
      const profileContent = JSON.parse(signedEvent.content);

      const parsedContent: ProfileContent = {
        name: profileContent?.name ?? "",
        about: profileContent?.about ?? "",
        picture: profileContent?.picture ?? "",
        banner: profileContent?.banner ?? "",
      };

      setProfile(parsedContent);
    }
  }
  
  const handleClose = () => {
    setSignEventOpen(false);
  };

  const formattedEvent = event !== null ? JSON.stringify(event, null, 2) : 'No event found';


  return (
      <CustomDialog
        fullScreen={fullScreen}
        open={signEventOpen}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        >
        <DialogTitle id="responsive-dialog-title" color={themeColors.textColor}>
          {"Sign Event and send to relays"}
        </DialogTitle>
        <DialogContent>
            <Paper sx={{paddingLeft: "10px", color: themeColors.textColor}}>
              <pre>{formattedEvent}</pre>
            </Paper>
        </DialogContent>
          <Box sx={{display: "flex", justifyContent: "space-between", padding: "15px"}}>
            <Button autoFocus onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={signEventManually} color="secondary" autoFocus>
              Sign
            </Button>
          </Box>
      </CustomDialog>
  );
}