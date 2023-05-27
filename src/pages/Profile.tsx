import { AppBar, Avatar, Box, Button, Chip, CircularProgress, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Toolbar} from '@mui/material'
import { EventTemplate, getEventHash, SimplePool, Event, Kind} from 'nostr-tools';
import { useEffect, useRef, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import "./Profile.css";
import { defaultRelays } from '../nostr/DefaultRelays';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { FullEventData, ReactionCounts } from '../nostr/Types';
import Note from '../components/Note';
import { useFollowers } from '../hooks/useFollowers';

interface ProfileProps {
    relays: string[];
    pool: SimplePool | null;
    pk: string;
    profile: ProfileContent;
    updateProfile: (name: string, about: string, picture: string, banner: string) => void;
}

interface ProfileContent {
    name: string;
    picture: string;
    about: string;
    banner: string;
}

export default function Profile({relays, pool, pk, profile, updateProfile}: ProfileProps) {
const privateKey = window.localStorage.getItem("localSk");
const profileRef = useRef<ProfileContent | null>(null);
const [getProfileEvent, setGetProfileEvent] = useState(true);
const [userNotes, setUserNotes] = useState<Event[]>([]);
const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
const { followers } = useFollowers({pool, relays, pk});
const [profileNameInput, setProfileNameInput] = useState("");
const [profileAboutInput, setProfileAboutInput] = useState("");
const [imageUrlInput, setImageUrlInput] = useState("");
const [bannerUrlInput, setBannerUrlInput] = useState("");



useEffect(() => {
    if (!pool || pk === "") return;

    const loadProfile = async () => {
        try {
            setProfileNameInput(profile.name);
            setProfileAboutInput(profile.about);
            setImageUrlInput(profile.picture);
            setBannerUrlInput(profile.banner);

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
            console.log(error);
        }
    }

    loadProfile();
}, [pool, relays, pk , profile])


const handleFormSubmit = async () => {
    if (!pool || pk === "") return;
    updateProfile(profileNameInput, profileAboutInput, imageUrlInput, bannerUrlInput);
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
                                src={profile.picture}
                                sx={{ width: 200, height: 200 }}
                                />
                        </div>
                        <Box sx={{ 
                                color: 'white', 
                                padding: '5px',
                                borderRadius: '5px',
                                fontSize: '14px',
                                textAlign: 'center',
                            }}>
                            <Chip label={"Followers: " + followers.length} />
                        </Box>
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
                                value={profileNameInput}
                                onChange={e => setProfileNameInput(e.target.value)}
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
                                value={profileAboutInput}
                                onChange={e => setProfileAboutInput(e.target.value)}
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
                                value={imageUrlInput}
                                onChange={e => setImageUrlInput(e.target.value)}
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
                                    value={bannerUrlInput}
                                    onChange={e => setBannerUrlInput(e.target.value)} 
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
                        {userNotes.length > 0 ? userNotes.map((event) => {

                            const fullEventData = setEventData(event);

                            return (
                            <Note pool={pool} relays={relays} eventData={fullEventData} setFollowing={() => {}} followers={[]} key={event.sig} setHashtags={() => {}} pk={pk} />
                            )
                        }) : <Box sx={{marginTop: "5px", display: "flex", justifyContent: "center"}}>
                                <CircularProgress color='primary'/>
                            </Box>}
                    </div>
                </Box>)
            }
        </Box>
    )
}