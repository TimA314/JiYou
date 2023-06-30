import { AppBar, Avatar, Box, Button, Chip, CircularProgress, Divider, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Toolbar, Typography} from '@mui/material'
import { SimplePool, Event } from 'nostr-tools';
import { useEffect, useRef, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import "./Profile.css";
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { FullEventData, ReactionCounts, RelaySetting } from '../nostr/Types';
import Note from '../components/Note';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { GetImageFromPost } from '../utils/miscUtils';

interface ProfileProps {
    relays: RelaySetting[];
    pool: SimplePool | null;
    pk: string;
    profile: ProfileContent;
    following: string[];
    followers: string[];
    fetchEvents: boolean;
    setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
    updateProfile: (name: string, about: string, picture: string, banner: string) => void;
    getProfile: () => Promise<void>;
}

interface ProfileContent {
    name: string;
    picture: string;
    about: string;
    banner: string;
}

export default function Profile({relays, pool, pk, profile, following, followers, fetchEvents, setFetchEvents, updateProfile, getProfile }: ProfileProps) {
const profileRef = useRef<ProfileContent | null>(profile);
const [userNotes, setUserNotes] = useState<FullEventData[]>([]);
const [profileNameInput, setProfileNameInput] = useState("");
const [profileAboutInput, setProfileAboutInput] = useState("");
const [imageUrlInput, setImageUrlInput] = useState("");
const [bannerUrlInput, setBannerUrlInput] = useState("");
const [userEventsFetched, setUserEventsFetched] = useState<boolean>(false);
const { themeColors } = useContext(ThemeContext);
const allRelayUrls = relays.map((r) => r.relayUrl);


const setEventDataForUserEvents = (event: Event, reactions: Record<string, ReactionCounts>, profileData: ProfileContent) => {
    const fullEventData: FullEventData = {
        content: event.content,
        user: {
            name: profileData.name,
            picture: profileData.picture,
            about: profileData.about,
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


useEffect(() => {
    if (!pool || pk === "") return;

    const loadProfile = async () => {
        try {
            const profileContent = {
                name: profile.name,
                picture: profile.picture,
                about: profile.about,
                banner: profile.banner
            }

            setProfileNameInput(profileContent.name);
            setProfileAboutInput(profileContent.about);
            setImageUrlInput(profileContent.picture);
            setBannerUrlInput(profileContent.banner);
            setUserEventsFetched(false);
            // Fetch user notes
            const userNotes = await pool.list(allRelayUrls, [{kinds: [1], authors: [pk] }])
            const sanitizedEvents = userNotes.map((event) => sanitizeEvent(event));
            
            // Fetch reactions
            const eventIds = sanitizedEvents.map((event) => event.id);
            
            const reactionEvents = await pool.list(allRelayUrls, [{ "kinds": [7], "#e": eventIds, "#p": [pk]}]);
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
        setUserNotes(sanitizedEvents.map((event) => setEventDataForUserEvents(event, retrievedReactionObjects, profileContent)));

        } catch (error) {
            console.log(error);
        }
    }


    loadProfile();
}, [profile])

useEffect(() => {
    getProfile();
}, [pk])


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


    return (
        <Box justifyContent="center" >
            {pk !== "" && (
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
                                color: themeColors.textColor,
                                padding: '5px',
                                borderRadius: '5px',
                                fontSize: '14px',
                                textAlign: 'center',
                            }}>
                            <Chip 
                                label={"Following: " + following.length}
                                sx={{ margin: "1px", color: themeColors.textColor }}
                                 />
                            <Chip 
                                label={"Followers: " + followers.length}
                                sx={{ margin: "1px", color: themeColors.textColor }}
                                 />
                        </Box>
                        </AppBar>
                    </Paper>

                    <Box sx={{marginTop: "5px", marginBottom: "5px"}}>
                            <Stack direction="column" spacing={3} marginTop="35px">
                                <Box>
                                    <Paper sx={{}}>
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
                                    </Paper>
                                        <Paper sx={{marginTop: "10px"}}>
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
                                        </Paper>
                                        <Paper sx={{marginTop: "10px"}}>   
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
                                        </Paper>
                                        <Paper sx={{marginTop: "10px"}}>
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
                                        </Paper>
                                    </Box>
                                    <Button variant="contained" type='submit' color='success' onClick={handleFormSubmit}>
                                        SAVE
                                    </Button>
                            </Stack>
                    </Box>
                    <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                        <Box sx={{}}>
                            <Typography variant="h6" sx={{ color: themeColors.textColor }}>
                                User Notes
                            </Typography>
                        </Box>
                        {userNotes.length > 0 ? userNotes.map((event) => {
                            return (
                                <Box key={event.sig + Math.random()}>
                                    <Note 
                                        pool={pool} 
                                        relays={relays} 
                                        eventData={event}
                                        fetchEvents={fetchEvents}
                                        setFetchEvents={setFetchEvents}
                                        updateFollowing={() => {}} 
                                        following={following} 
                                        setHashtags={() => {}} 
                                        pk={pk}
                                        hashTags={[]}/>
                                </Box>
                            )
                        }) : <Box sx={{marginTop: "5px", display: "flex", justifyContent: "center"}}>
                                {userEventsFetched ? <Typography variant='caption' color={themeColors.textColor}>No Notes Found</Typography> : <CircularProgress color='primary'/>}
                            </Box>}
                    </Box>
                </Box>)
            }
        </Box>
    )
}