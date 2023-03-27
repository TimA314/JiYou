import { AppBar, Avatar, Box, Button, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Toolbar, useMediaQuery} from '@mui/material'
import { styled } from '@mui/system';
import { EventTemplate, getEventHash, getPublicKey, signEvent, SimplePool, UnsignedEvent, validateEvent, verifySignature, Event, Kind} from 'nostr-tools';
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router';
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { defaultRelays } from '../nostr/Relays';
import { sanitizeString, sanitizeUrl } from '../util';
import * as secp from "@noble/secp256k1";

interface ProfileContent {
    name: string;
    picture: string;
    about: string;
    banner: string;
}

export default function Profile() {
const smallScreen = useMediaQuery('(max-width:600px)');
const privateKey = window.localStorage.getItem("localSk");
const [getProfileEvent, setGetProfileEvent] = useState(true);
const defaultProfile: ProfileContent = {
    name: "User",
    picture: "https://api.dicebear.com/5.x/bottts/svg?seed=Cookie&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    about: "about",
    banner: "banner",
};
const profileString = window.localStorage.getItem("profile") ?? "";
const parsedProfile = profileString ? JSON.parse(profileString) : defaultProfile;
const profileRef = useRef<ProfileContent>(parsedProfile);
const navigate = useNavigate();
console.log(smallScreen ? "small screen" : "larger screen")
const pool = new SimplePool();
const localRelays: string | null = localStorage.getItem('relays');
const relays: string[] = !localRelays || JSON.parse(localRelays)?.length === 0 ? defaultRelays : JSON.parse(localRelays);

// ----------------------------------------------------------------------

const MediumToLargeScreenStyle = styled('div')(({ theme }) => ({
  maxWidth: 600,
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(5, 0),
}));

const MediumToLargeAvatar = styled('div')(({ theme }) => ({
  display: "flex",
  margin: "auto",
  flexDirection: "column",
  justifyContent: "center"
}));

const SmallScreenStyle = styled('div')(({ theme }) => ({
  maxWidth: 400,
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(5, 0),
}));

const SmallScreenAvatar = styled('div')(({ theme }) => ({
  maxWidth: 400,
  margin: "auto",
  display: 'flex',
  justifyContent: 'center',
  flexDirection:'column',
}));

const styles = {
  banner: {
      height: 350,
      backgroundImage: `url(${sanitizeUrl(sanitizeString(profileRef.current.banner))})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      margin: -24,
      padding: 24,
  }
};

const StyledContent = smallScreen ? SmallScreenStyle : MediumToLargeScreenStyle;
const StyledToolbar = smallScreen ? SmallScreenAvatar : MediumToLargeAvatar;

// ----------------------------------------------------------------------


useEffect(() => {
    if (!secp.utils.isValidPrivateKey(privateKey ?? "")) navigate("/signin", {replace: true});
  
  const getUserProfile = async () => {
      let prof = await pool.list(relays, [{kinds: [0], authors: [getPublicKey(privateKey!)], limit: 1 }])
      
      if (prof && prof[0] && prof[0].content) {
          
          let parsedProf = JSON.parse(prof[0].content);
          
          if (!parsedProf || parsedProf.length < 1) return;
          
          const sanitizedProfileContent: ProfileContent = {
            name: sanitizeString(parsedProf.name),
            picture: sanitizeUrl(sanitizeString(parsedProf.picture)),
            about: sanitizeString(parsedProf.about),
            banner: sanitizeUrl(sanitizeString(parsedProf.banner))
          }

          profileRef.current = sanitizedProfileContent;
          window.localStorage.setItem("profile", JSON.stringify(sanitizedProfileContent));
          console.log(sanitizedProfileContent)
          setGetProfileEvent(!getProfileEvent)
        }
    }
    
    if (!getProfileEvent) return;
    getUserProfile();
})


    const handleFormSubmit = () => {
        let profileNameInput = document.getElementById("profileNameInput") as HTMLInputElement;
        let profileAboutInput = document.getElementById("profileAboutInput") as HTMLInputElement;
        let imageUrlInput = document.getElementById("profileImageUrlInput") as HTMLInputElement;
        let bannerUrlInput = document.getElementById("bannerImageUrlInput") as HTMLInputElement;
        updateProfileEvent(profileNameInput.value, profileAboutInput.value, imageUrlInput.value, bannerUrlInput.value);
    }

    const updateProfileEvent = async (profileNameInput: string, profileAboutInput: string, imageUrlInput: string, bannerUrlInput: string) => {
        let prof = await pool.list(relays, [{kinds: [0], authors: [getPublicKey(privateKey!)], limit: 1 }])

        let updatedProfileContent: ProfileContent = {
            name: profileNameInput,
            about: profileAboutInput,
            picture: imageUrlInput.toString(),
            banner: bannerUrlInput
        }

        const newContent = JSON.stringify(updatedProfileContent);  

        const newProfileEvent: EventTemplate | UnsignedEvent | Event = {
            kind: Kind.Metadata,
            tags: [],
            content: newContent,
            created_at: Math.floor(Date.now() / 1000),
            pubkey: getPublicKey(privateKey!)
        }

        const signedEvent: Event = {
            ...newProfileEvent,
            id: getEventHash(newProfileEvent),
            sig: signEvent(newProfileEvent, privateKey!),
        };
        
        if(!validateEvent(signedEvent) || !verifySignature(signedEvent)) {
            console.log("Event is Invalid")
            return;
        }

        console.log("Event is valid")

        let pubs = pool.publish(relays, signedEvent);
    
        pubs.on("ok", () => {
            console.log(`Published Event`);
            window.localStorage.setItem("profile", newContent)
            setGetProfileEvent(true);
            return;
        })

        pubs.on("failed", (reason: string) => {
            console.log("failed: " + reason);
            return;
        })
    }

    const handleLogout = () => {
        alert("Logged out.");
        window.localStorage.clear();
        navigate("/", {replace: true});
    }

    return (
        <Box width="100%">
            {privateKey && (
                <Box>
                    <Paper  style={styles.banner}>
                        <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none'}} >
                        <Box>
                            <Button type="button" onClick={handleLogout}>Logout</Button>
                        </Box>
                        <Toolbar >
                            <IconButton edge="start" color="inherit" aria-label="menu">
                            <MenuItem />
                            </IconButton>
                        </Toolbar>
                        <StyledToolbar>
                            <Avatar
                                src={profileRef.current.picture ? sanitizeUrl(sanitizeString(profileRef.current.picture)) : "https://api.dicebear.com/5.x/bottts/svg?seed=Cookie&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01"}
                                sx={{ width: 200, height: 200}}
                                />
                        </StyledToolbar>
                        </AppBar>
                    </Paper>

                    <StyledContent>
                            <Stack direction="column" spacing={5} marginBottom="10px">
                            <Button variant="contained" type='submit' color='success' onClick={handleFormSubmit}>
                                SAVE
                                </Button>
                                <TextField 
                                id="profileNameInput"
                                label="Name"
                                color='secondary'
                                defaultValue={profileRef.current.name} 
                                fullWidth
                                InputProps={{
                                    startAdornment: 
                                    <InputAdornment position="start">
                                        <BadgeIcon />
                                    </InputAdornment>
                                }}
                                />
                                <TextField 
                                id="profileAboutInput"
                                label="About"
                                color='secondary'
                                defaultValue={profileRef.current.about} 
                                fullWidth
                                multiline
                                rows={4}
                                InputProps={{
                                    startAdornment: 
                                    <InputAdornment position="start">
                                        <AutoStoriesIcon />
                                    </InputAdornment>
                                }}
                                />     
                                <TextField 
                                id="profileImageUrlInput"
                                label="Profile Image URL"
                                color='secondary'
                                defaultValue={profileRef.current.picture} 
                                fullWidth
                                InputProps={{
                                    startAdornment: 
                                    <InputAdornment position="start">
                                        <ImageIcon />
                                    </InputAdornment>
                                }}
                                />
                                <TextField
                                    id="bannerImageUrlInput"
                                    label="Banner Image URL"
                                    fullWidth
                                    color="secondary"
                                    defaultValue={profileRef.current.banner} 
                                    InputProps={{
                                    startAdornment: 
                                    <InputAdornment position="start">
                                            <ImageIcon />
                                        </InputAdornment>
                                    }}
                                    />
                            </Stack>
                    </StyledContent>
                </Box>)
            }
        </Box>
    )
}