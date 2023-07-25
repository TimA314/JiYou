import { AppBar, Avatar, Box, Button, Chip, IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, TextField, Toolbar} from '@mui/material'
import { Event, Filter, SimplePool } from 'nostr-tools';
import { useEffect, useRef, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import "./Profile.css";
import { FullEventData, MetaData, RelaySetting } from '../nostr/Types';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import UserNotes from '../components/UserNotes';
import Notifications from '../components/Notifications';
import { useNavigate } from 'react-router-dom';
import { useListEvents } from '../hooks/useListEvents';

interface ProfileProps {
    setPk_decoded: React.Dispatch<React.SetStateAction<string>>;
    setSk_decoded: React.Dispatch<React.SetStateAction<string>>;
    relays: RelaySetting[];
    pool: SimplePool | null;
    setPool: React.Dispatch<React.SetStateAction<SimplePool>>;
    pk_decoded: string;
    sk_decoded: string;
    profile: ProfileContent;
    following: string[];
    followers: string[];
    fetchEvents: boolean;
    setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
    updateProfile: (name: string, about: string, picture: string, banner: string) => void;
    getProfile: () => Promise<void>;
    imagesOnlyMode: React.MutableRefObject<boolean>;
    hideExplicitContent: React.MutableRefObject<boolean>;
}

interface ProfileContent {
    name: string;
    picture: string;
    about: string;
    banner: string;
}

export default function Profile({
    setPk_decoded,
    setSk_decoded,
    relays, 
    pool,
    setPool,
    pk_decoded,
    sk_decoded,
    profile, 
    following, 
    followers, 
    fetchEvents, 
    setFetchEvents, 
    updateProfile, 
    getProfile, 
    hideExplicitContent,
}: ProfileProps) {
const [profileNameInput, setProfileNameInput] = useState("");
const [profileAboutInput, setProfileAboutInput] = useState("");
const [imageUrlInput, setImageUrlInput] = useState("");
const [bannerUrlInput, setBannerUrlInput] = useState("");
const { themeColors } = useContext(ThemeContext);
const navigate = useNavigate();
const fetchingEventsInProgress = useRef(false);
const hashtags: string[] = [];
const [tabIndex, setTabIndex] = useState(0);
const imagesOnlyMode = useRef<boolean>(false);
const userNotesFilter: Filter = { kinds: [1], authors: [pk_decoded]};
const { feedEvents: userEvents, rootEvents, replyEvents, metaData, reactions} = useListEvents({
    pool, 
    setPool,
    relays, 
    tabIndex: 3, 
    following, 
    hashtags,
    hideExplicitContent, 
    imagesOnlyMode, 
    fetchEvents,
    setFetchEvents, 
    fetchingEventsInProgress,
    filter: userNotesFilter
});

useEffect(() => {
    if (!pool || pk_decoded === "") return;

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

        } catch (error) {
            console.log(error);
        }
    }

    loadProfile();
}, [profile])

useEffect(() => {
    getProfile();
}, [pk_decoded])

const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
};

const handleFormSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!pool) return;
    updateProfile(profileNameInput, profileAboutInput, imageUrlInput, bannerUrlInput);
}

const handleLogout = () => {
    localStorage.removeItem("pk");
    localStorage.removeItem("sk");
    setPk_decoded("");
    setSk_decoded("");
    console.log("Logged out");
    navigate("/start")
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
            {pk_decoded !== "" && (
                <Box sx={{marginBottom: "50px"}}>
                    <Paper  style={styles.banner}>
                        <Box sx={{marginTop: "15px", display: "flex", justifyContent: "flex-end"}}>
                            <Button variant='contained' color="secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        </Box>
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
                        </AppBar>
                    </Paper>

                    <Box sx={{marginTop: "5px", marginBottom: "5px"}}>
                            <Stack direction="column" spacing={3} marginTop="35px">
                                <Box>
                                    <Box sx={{ 
                                            color: themeColors.textColor,
                                            textAlign: 'center',
                                            marginBottom: "3px",
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
                                    <Paper>
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
                    
                    <Box sx={{color: themeColors.textColor}}>
                        <Tabs
                            value={tabIndex}
                            textColor='inherit'
                            indicatorColor="secondary"
                            onChange={handleTabChange}
                            >
                            <Tab label="User Notes" />
                            <Tab label="Notifications" />   
                        </Tabs>
                    </Box>
                    
                    {tabIndex === 0 && (
                        <UserNotes 
                            pool={pool}
                            setPool={setPool}
                            relays={relays} 
                            pk={pk_decoded}
                            sk_decoded={sk_decoded}
                            following={following} 
                            hideExplicitContent={hideExplicitContent}
                            userEvents={userEvents}
                            replyEvents={replyEvents}
                            rootEvents={rootEvents}
                            reactions={reactions}
                            metaData={metaData}
                            />                    
                    )}

                    {tabIndex === 1 && (
                        <Notifications
                            userEvents={userEvents}
                            reactionEvents={reactions}
                            metaData={metaData} 
                        />
                    )}

                </Box>)
            }
        </Box>
    )
}