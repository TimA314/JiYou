import { AppBar, Avatar, Box, Button, Chip, CircularProgress, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Toolbar} from '@mui/material'
import { SimplePool, Event, EventTemplate} from 'nostr-tools';
import { useEffect, useRef, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import "./Profile.css";
import { defaultRelays } from '../nostr/DefaultRelays';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { FullEventData, ReactionCounts } from '../nostr/Types';
import Note from '../components/Note';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { GetImageFromPost } from '../utils/miscUtils';

interface ProfileProps {
    relays: string[];
    pool: SimplePool | null;
    pk: string;
    profile: ProfileContent;
    following: string[];
    fetchEvents: React.MutableRefObject<boolean>;
    updateProfile: (name: string, about: string, picture: string, banner: string) => void;
}

interface ProfileContent {
    name: string;
    picture: string;
    about: string;
    banner: string;
}

export default function Profile({relays, pool, pk, profile, following, fetchEvents, updateProfile }: ProfileProps) {
const profileRef = useRef<ProfileContent | null>(profile);
const [userNotes, setUserNotes] = useState<Event[]>([]);
const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
const [profileNameInput, setProfileNameInput] = useState("");
const [profileAboutInput, setProfileAboutInput] = useState("");
const [imageUrlInput, setImageUrlInput] = useState("");
const [bannerUrlInput, setBannerUrlInput] = useState("");
const [userEventsFetched, setUserEventsFetched] = useState<boolean>(false);
const { themeColors } = useContext(ThemeContext);



useEffect(() => {
    if (!pool || pk === "") return;

    const loadProfile = async () => {
        try {
            setProfileNameInput(profile.name);
            setProfileAboutInput(profile.about);
            setImageUrlInput(profile.picture);
            setBannerUrlInput(profile.banner);
            setUserEventsFetched(false);
            // Fetch user notes
            const userNotes = await pool.list(defaultRelays, [{kinds: [1], authors: [pk] }])
            const sanitizedEvents = userNotes.map((event) => sanitizeEvent(event));
            
            // Fetch reactions
            const eventIds = sanitizedEvents.map((event) => event.id);
            
            const reactionEvents = await pool.list([...new Set([...relays, ...defaultRelays])], [{ "kinds": [7], "#e": eventIds, "#p": [pk]}]);
            const retrievedReactionObjects: Record<string, ReactionCounts> = {};
            reactionEvents.forEach((event) => {
                const eventTagThatWasLiked = event.tags.filter((tag: string[]) => tag[0] === "e");
                eventTagThatWasLiked.forEach((tag: (string | number)[] | undefined) => {
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

        setUserEventsFetched(true);
        setReactions(retrievedReactionObjects);
        setUserNotes(sanitizedEvents);
        } catch (error) {
            console.log(error);
        }
    }

    loadProfile();
}, [pool, relays, profile])


const handleFormSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!pool) return;
    updateProfile(profileNameInput, profileAboutInput, imageUrlInput, bannerUrlInput);
}
    
// ----------------------------------------------------------------------
    
const styles = {
    banner: {
        height: 350,
        backgroundImage: `url(${profile.banner})`,
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
        images: GetImageFromPost(event.content)
    }
    return fullEventData;
}

    return (
        <Box justifyContent="center" >
            {pk !== "" && (
                <Paper>
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
                                color: themeColors.textColor,
                                padding: '5px',
                                borderRadius: '5px',
                                fontSize: '14px',
                                textAlign: 'center',
                            }}>
                            <Chip 
                                label={"Following: " + following.length}
                                sx={{ color: themeColors.textColor }}
                                 />
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
                                InputLabelProps={{style: {color: themeColors.textColor}}} 
                                color='primary'
                                value={profileNameInput}
                                onChange={e => setProfileNameInput(e.target.value)}
                                fullWidth
                                InputProps={{
                                    style: { color: themeColors.textColor},
                                    startAdornment: 
                                    <InputAdornment position="start">
                                        <BadgeIcon sx={{ color: themeColors.textColor }}/>
                                    </InputAdornment>
                                }}
                                />
                                <TextField 
                                id="profileAboutInput"
                                label="About"
                                InputLabelProps={{style: {color: themeColors.textColor}}} 
                                color='primary'
                                value={profileAboutInput}
                                onChange={e => setProfileAboutInput(e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                InputProps={{
                                    style: { color: themeColors.textColor},
                                    startAdornment: 
                                    <InputAdornment position="start">
                                        <AutoStoriesIcon sx={{ color: themeColors.textColor }}/>
                                    </InputAdornment>
                                }}
                                />     
                                <TextField 
                                id="profileImageUrlInput"
                                label="Profile Image URL"
                                InputLabelProps={{style: {color: themeColors.textColor}}} 
                                color='primary'
                                value={imageUrlInput}
                                onChange={e => setImageUrlInput(e.target.value)}
                                fullWidth
                                InputProps={{
                                    style: { color: themeColors.textColor},
                                    startAdornment: 
                                    <InputAdornment position="start">
                                        <ImageIcon sx={{ color: themeColors.textColor }}/>
                                    </InputAdornment>
                                }}
                                />
                                <TextField
                                    id="bannerImageUrlInput"
                                    label="Banner Image URL"
                                    InputLabelProps={{sx: { color: themeColors.textColor }}}
                                    fullWidth
                                    color="primary"
                                    value={bannerUrlInput}
                                    onChange={e => setBannerUrlInput(e.target.value)} 
                                    InputProps={{
                                        style: { color: themeColors.textColor},
                                        startAdornment: 
                                        <InputAdornment position="start">
                                            <ImageIcon sx={{ color: themeColors.textColor }} />
                                        </InputAdornment>
                                    }}
                                    />
                            </Stack>
                    </div>
                    <div style={{marginBottom: "15px"}}>
                        {userNotes.length > 0 ? userNotes.map((event) => {

                            const fullEventData = setEventData(event);

                            return (
                            <Note 
                                pool={pool} 
                                relays={relays} 
                                eventData={fullEventData}
                                fetchEvents={fetchEvents}
                                updateFollowing={() => {}} 
                                following={following} 
                                key={event.sig + Math.random()} 
                                setHashtags={() => {}} 
                                pk={pk}
                                hashTags={[]}/>
                            )
                        }) : <Box sx={{marginTop: "5px", display: "flex", justifyContent: "center"}}>
                                {userEventsFetched ? <div></div> : <CircularProgress color='primary'/>}
                            </Box>}
                    </div>
                </Paper>)
            }
        </Box>
    )
}