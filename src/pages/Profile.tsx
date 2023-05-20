import { AppBar, Avatar, Box, Button, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Toolbar} from '@mui/material'
import { EventTemplate, getEventHash, SimplePool, Event, Kind} from 'nostr-tools';
import { useEffect, useRef, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import "./Profile.css";
import { defaultRelays } from '../nostr/Relays';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { FullEventData, ReactionCounts } from '../nostr/Types';
import Note from '../components/Note';

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
const [userNotes, setUserNotes] = useState<Event[]>([]);
const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});


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
            // Fetch user profile
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

            // Fetch user notes
            const userNotes = await pool.list(defaultRelays, [{kinds: [1], authors: [pk] }])
            const sanitizedEvents = userNotes.map((event) => sanitizeEvent(event));
            console.log("user notes: " + JSON.stringify(sanitizedEvents));
            setUserNotes(sanitizedEvents);

            // Fetch reactions
            const eventIds = sanitizedEvents.map((event) => event.id);

            const reactionEvents = await pool.list([...new Set([...relays, ...defaultRelays])], [{ "kinds": [7], "#e": eventIds, "#p": [pk]}]);
            console.log("reaction events: " + JSON.stringify(reactionEvents));
            const retrievedReactionObjects: Record<string, ReactionCounts> = {};
            reactionEvents.forEach((event) => {
            const eventTagThatWasLiked = event.tags.filter((tag) => tag[0] === "e");
            eventTagThatWasLiked.forEach((tag) => {
                const isValidEventTagThatWasLiked = tag !== undefined && tag[1] !== undefined && tag[1] !== null;
                if (isValidEventTagThatWasLiked) {
                if (!retrievedReactionObjects[tag[1]]) {
                    retrievedReactionObjects[tag[1]] = {upvotes: 1, downvotes: 0};
                }
                if (event.content === "+") {
                    retrievedReactionObjects[tag[1]].upvotes++;
                } else if(event.content === "-") {
                    retrievedReactionObjects[tag[1]].downvotes++;
                }
                }
            });});
            setReactions(retrievedReactionObjects);
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
    
    const setEventData = (event: Event) => {
        const fullEventData: FullEventData = {
            content: event.content,
            user: {
                name: profileRef.current?.name ?? "",
                picture: profileRef.current?.picture ?? "",
                about: profileRef.current?.about ?? "",
                nip05: "",
            },
            pubkey: event.pubkey,
            hashtags: event.tags.filter((tag) => tag[0] === "t").map((tag) => tag[1]),
            eventId: event.id,
            sig: event.sig,
            created_at: event.created_at,
            tags: event?.tags ?? [],
            reaction: reactions[event?.id] ?? {upvotes: 0, downvotes: 0},
        }
        return fullEventData;
    }

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
                    <div style={{marginBottom: "15px"}}>
                        {userNotes ? userNotes.map((event) => {

                            const fullEventData = setEventData(event);

                            return (
                            <Note pool={pool} relays={relays} eventData={fullEventData} setFollowing={() => {}} followers={[]} key={event.sig} />
                            )
                        }) : <div></div>}
                    </div>
                </Box>)
            }
        </Box>
    )
}