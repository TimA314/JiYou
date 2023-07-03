import { AppBar, Avatar, Box, Button, Chip, IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, TextField, Toolbar} from '@mui/material'
import { Event, SimplePool } from 'nostr-tools';
import { useEffect, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import "./Profile.css";
import { FullEventData, MetaData, RelaySetting } from '../nostr/Types';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import UserNotes from '../components/UserNotes';
import Notifications from '../components/Notifications';

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
    imagesOnlyMode: React.MutableRefObject<boolean>;
    userNotes: FullEventData[];
    likedNotificationEvents: Event[];
    likedNotificationMetaData: Record<string, MetaData>;
}

interface ProfileContent {
    name: string;
    picture: string;
    about: string;
    banner: string;
}

export default function Profile({
    relays, 
    pool, 
    pk, 
    profile, 
    following, 
    followers, 
    fetchEvents, 
    setFetchEvents, 
    updateProfile, 
    getProfile, 
    imagesOnlyMode,
    userNotes,
    likedNotificationEvents,
    likedNotificationMetaData
}: ProfileProps) {
const [profileNameInput, setProfileNameInput] = useState("");
const [profileAboutInput, setProfileAboutInput] = useState("");
const [imageUrlInput, setImageUrlInput] = useState("");
const [bannerUrlInput, setBannerUrlInput] = useState("");
const { themeColors } = useContext(ThemeContext);
const [tabIndex, setTabIndex] = useState(0);


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

        } catch (error) {
            console.log(error);
        }
    }


    loadProfile();
}, [profile])

useEffect(() => {
    getProfile();
}, [pk])

const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
};

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
                <Box sx={{marginBottom: "50px"}}>
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
                            relays={relays} 
                            pk={pk} 
                            fetchEvents={fetchEvents} 
                            following={following} 
                            setFetchEvents={setFetchEvents}
                            userNotes={userNotes}
                            />                    
                    )}

                    {tabIndex === 1 && (
                        <Notifications 
                            likedNotificationEvents={likedNotificationEvents} 
                            likedNotificationMetaData={likedNotificationMetaData}  
                        />
                    )}

                </Box>)
            }
        </Box>
    )
}