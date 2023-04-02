import { AppBar, Avatar, Box, Button, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Toolbar} from '@mui/material'
import { EventTemplate, getEventHash, SimplePool, Event, Kind} from 'nostr-tools';
import { useEffect, useRef, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { sanitizeEvent } from '../util';
import "./Profile.css";
import { defaultRelays } from '../nostr/Relays';

interface ProfileProps {
    relays: string[];
    pool: SimplePool | null;
}

interface ProfileContent {
    name: string;
    picture: string;
    about: string;
    banner: string;
}

export default function Profile({relays, pool}: ProfileProps) {
const privateKey = window.localStorage.getItem("localSk");
const profileRef = useRef<ProfileContent | null>(null);
const [getProfileEvent, setGetProfileEvent] = useState(true);


useEffect(() => {
    if (!pool) return;

    if (!window.nostr) {
        alert("You need to install a Nostr extension to provide your pubkey.")
        return;
    }

    const getProfile = async () => {
        const profileNameInput = document.getElementById("profileNameInput") as HTMLInputElement;
        const profileAboutInput = document.getElementById("profileAboutInput") as HTMLInputElement;
        const imageUrlInput = document.getElementById("profileImageUrlInput") as HTMLInputElement;
        const bannerUrlInput = document.getElementById("bannerImageUrlInput") as HTMLInputElement;

        try {
            const pk = await window.nostr.getPublicKey();
            const profileEvent: Event[] = await pool.list(defaultRelays, [{kinds: [0], authors: [pk], limit: 1 }])

            console.log(profileEvent)
            
            if (!profileEvent || profileEvent.length < 1) return;

            const sanitizedEvent = sanitizeEvent(profileEvent[0]);

            const content = JSON.parse(sanitizedEvent.content);

            const profileContent: ProfileContent = {
                name: content.name ? content.name : "",
                picture: content.picture ? content.picture : "",
                about: content.about ? content.about : "",
                banner: content.banner ? content.banner : ""
            }
            console.log("profileContent: " + JSON.stringify(profileContent))

            profileNameInput.value = profileContent.name;
            profileAboutInput.value = profileContent.about;
            imageUrlInput.value = profileContent.picture;
            bannerUrlInput.value = profileContent.banner;

            profileRef.current = profileContent;
            setGetProfileEvent(false);
        } catch (error) {
            alert(error)
            console.log(error);
        }
    }

    if (!getProfileEvent) return;
    getProfile();
}, [pool, relays])



const handleFormSubmit = () => {
    updateProfileEvent();
}

const updateProfileEvent = async () => {
    if (!pool) return;
    
    if (!window.nostr) {
        alert("You need to install a Nostr extension to post to the relays")
        return;
    }

    const profileNameInput = document.getElementById("profileNameInput") as HTMLInputElement;
    const profileAboutInput = document.getElementById("profileAboutInput") as HTMLInputElement;
    const imageUrlInput = document.getElementById("profileImageUrlInput") as HTMLInputElement;
    const bannerUrlInput = document.getElementById("bannerImageUrlInput") as HTMLInputElement;
    
    try {
        
        const updatedProfileContent: ProfileContent = {
            name: profileNameInput.value,
            about: profileAboutInput.value,
            picture: imageUrlInput.value,
            banner: bannerUrlInput.value
        }
        
        const newContent = JSON.stringify(updatedProfileContent);  
        
        const _baseEvent = {
            kind: Kind.Metadata,
            content: newContent,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
        } as EventTemplate

        const pubkey = await window.nostr.getPublicKey();
        const sig = (await window.nostr.signEvent(_baseEvent)).sig;
        
        const newEvent: Event = {
            ..._baseEvent,
            id: getEventHash({..._baseEvent, pubkey}),
            sig,
            pubkey,
        }

        const pubs = pool.publish(relays, newEvent)
      
        pubs.on("ok", () => {
            alert("Posted to relays")
            console.log("Posted to relays")
            profileRef.current = updatedProfileContent;
            setGetProfileEvent(true);
        })
  
        pubs.on("failed", (error: string) => {
          alert("Failed to post to relays" + error)
        })

    } catch (error) {
        alert(error);
        return;
    }       
}
    
    // ----------------------------------------------------------------------
    
    const styles = {
      banner: {
          height: 350,
          backgroundImage: `url(${profileRef.current?.banner ?? ""})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: -24,
          padding: 24,
      }
    };
    
    // ----------------------------------------------------------------------
    
    return (
        <Box width="100%">
            {privateKey && (
                <Box>
                    <Paper  style={styles.banner}>
                        <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none'}} >
                        <Toolbar >
                            <IconButton edge="start" color="inherit" aria-label="menu">
                            <MenuItem />
                            </IconButton>
                        </Toolbar>
                        <div className="avatarContainer">
                            <Avatar
                                src={profileRef.current?.picture ?? ""}
                                sx={{ width: 200, height: 200 }}
                                />
                        </div>
                        </AppBar>
                    </Paper>

                    <div className='profileForm'>
                            <Stack direction="column" spacing={3} marginTop="35px">
                            <Button variant="contained" type='submit' color='success' onClick={handleFormSubmit}>
                                SAVE
                                </Button>
                                <TextField 
                                id="profileNameInput"
                                label="Name"
                                color='secondary'
                                defaultValue={profileRef.current?.name ?? ""} 
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
                                defaultValue={profileRef.current?.about ?? ""} 
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
                                defaultValue={profileRef.current?.picture ?? ""} 
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
                                    defaultValue={profileRef.current?.banner ?? ""} 
                                    InputProps={{
                                        startAdornment: 
                                        <InputAdornment position="start">
                                            <ImageIcon />
                                        </InputAdornment>
                                    }}
                                    />
                            </Stack>
                    </div>
                </Box>)
            }
        </Box>
    )
}