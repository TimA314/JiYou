import { AppBar, Avatar, Box, Button, Chip, Collapse, IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, TextField, Toolbar} from '@mui/material'
import { useEffect, useState } from 'react'
import ImageIcon from '@mui/icons-material/Image';
import BadgeIcon from '@mui/icons-material/Badge';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import "./Profile.css";
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import UserNotes from '../components/UserNotes';
import Notifications from '../components/Notifications';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setKeys } from '../redux/slices/keySlice';
import { PoolContext } from '../context/PoolContext';
import { clearUserEvents, setIsRefreshingUserEvents, toggleRefreshUserNotes } from '../redux/slices/eventsSlice';
import RefreshIcon from '@mui/icons-material/Refresh';
import { setProfileEventToShow } from '../redux/slices/noteSlice';


interface ProfileProps {
    updateProfile: (name: string, about: string, picture: string, banner: string) => void;
}

export default function Profile({
    updateProfile, 
}: ProfileProps) {
const pool = useContext(PoolContext);
const events = useSelector((state: RootState) => state.events);
const nostr = useSelector((state: RootState) => state.nostr);
const keys = useSelector((state: RootState) => state.keys);
const note = useSelector((state: RootState) => state.note);
const [profileNameInput, setProfileNameInput] = useState("");
const [profileAboutInput, setProfileAboutInput] = useState("");
const [imageUrlInput, setImageUrlInput] = useState("");
const [bannerUrlInput, setBannerUrlInput] = useState("");
const { themeColors } = useContext(ThemeContext);
const navigate = useNavigate();
const [tabIndex, setTabIndex] = useState(0);
const dispatch = useDispatch();
const [showEditProfile, setShowEditProfile] = useState(false);

useEffect(() => {
    if (note.profileEventToShow === null) {
        setProfileNameInput(events.metaData[keys.publicKey.decoded]?.name ?? "");
        setProfileAboutInput(events.metaData[keys.publicKey.decoded]?.about ?? "");
        setImageUrlInput(events.metaData[keys.publicKey.decoded]?.picture ?? "");
        setBannerUrlInput(events.metaData[keys.publicKey.decoded]?.banner ?? "");
        return;
    }

    setProfileNameInput(events.metaData[note.profileEventToShow.pubkey]?.name ?? "");
    setProfileAboutInput(events.metaData[note.profileEventToShow.pubkey]?.about ?? "");
    setImageUrlInput(events.metaData[note.profileEventToShow.pubkey]?.picture ?? "");
    setBannerUrlInput(events.metaData[note.profileEventToShow.pubkey]?.banner ?? "");

}, [note.profileEventToShow])


useEffect(() => {
    if (!pool || keys.publicKey.decoded === "" || note.profileEventToShow !== null) return;

    const userMetaData = events.metaData[keys.publicKey.decoded];

    const loadProfile = async () => {
        try {

            setProfileNameInput(userMetaData?.name ?? "");
            setProfileAboutInput(userMetaData?.about ?? "");
            setImageUrlInput(userMetaData?.picture ?? "");
            setBannerUrlInput(userMetaData?.banner ?? "");

        } catch (error) {
            console.log(error);
        }
    }

    loadProfile();
}, [])

const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
};

const handleFormSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!pool) return;
    updateProfile(profileNameInput, profileAboutInput, imageUrlInput, bannerUrlInput);
}

const handleLogout = () => {
    if (note.profileEventToShow !== null) {
        dispatch(setProfileEventToShow(null));
        navigate("/");
        return;
    }
    localStorage.removeItem("pk");
    localStorage.removeItem("sk");
    dispatch(setKeys({publicKey: {decoded: "", encoded: ""}, privateKey: {decoded: "", encoded: ""}}))
    dispatch(clearUserEvents());
    console.log("Logged out");
    navigate("/start")
}

const handleEditOrSaveClick = () => {
    setShowEditProfile(!showEditProfile);
    if (showEditProfile) {
        handleFormSubmit({preventDefault: () => {}});
    }
}

    
// ----------------------------------------------------------------------
    
const styles = {
    banner: {
        height: 350,
        backgroundImage: `url(${bannerUrlInput})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        margin: -24,
        padding: 24,
    }
};


    return (
        <Box justifyContent="center" >
            {keys.publicKey.decoded !== "" && (
                <Box sx={{marginBottom: "50px"}}>

                        <Paper  style={styles.banner}>
                            <Box sx={{marginTop: "15px", display: "flex", justifyContent: "flex-end"}}>
                                <Button variant='contained' color="secondary" onClick={handleLogout}>
                                    {note.profileEventToShow !== null ? "Back" : "Logout"}
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
                                    src={imageUrlInput}
                                    sx={{ width: 200, height: 200 }}
                                    />
                            </div>
                            </AppBar>
                        </Paper>

                    <Box sx={{marginTop: "1rem", marginBottom: "1rem"}}>
                        <Stack direction="column" spacing={3} marginTop="1rem">
                            <Box>
                                <Box sx={{ 
                                        color: themeColors.textColor,
                                        textAlign: 'center',
                                        marginBottom: "0.5rem",
                                    }}>
                                    <Chip 
                                        label={"Following: " + nostr.following.length}
                                        sx={{ margin: "0.5rem", color: themeColors.textColor }}
                                        />
                                    <Chip
                                        label={"Followers: " + nostr.followers.length}
                                        sx={{ margin: "0.5rem", color: themeColors.textColor }}
                                        />
                                </Box>
                                
                                {note.profileEventToShow === null && (
                                    <Box>
                                        <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => handleEditOrSaveClick()}
                                        sx={{width: "100%", marginBottom: "1rem"}}
                                        >
                                        {showEditProfile ? "Save" : "Edit Profile"}
                                        </Button>

                                        <Collapse in={showEditProfile} timeout="auto" unmountOnExit>
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
                                                <Paper sx={{marginTop: "1rem"}}>
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
                                                <Paper sx={{marginTop: "1rem"}}>   
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
                                                <Paper sx={{marginTop: "1rem"}}>
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
                                            </Collapse>
                                        </Box>
                                    )}
                                </Box>
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
                            <IconButton
                                onClick={() => {
                                    dispatch(toggleRefreshUserNotes());
                                    dispatch(setIsRefreshingUserEvents(true));
                                }}
                                disabled={events.refreshingUserNotes}
                                sx={{
                                    color: themeColors.secondary, 
                                    marginLeft: "auto",
                                    ...(events.refreshingUserNotes && {
                                        animation: 'spin 1s linear infinite'
                                    })
                                }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tabs>
                    </Box>
                    
                    {tabIndex === 0 && (
                        <UserNotes />                    
                    )}

                    {tabIndex === 1 && (
                        <Notifications />
                    )}

                </Box>)
            }
        </Box>
    )
}