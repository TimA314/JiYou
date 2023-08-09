import { AppBar, Avatar, Box, Button, Chip, Collapse, IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, TextField, Toolbar, Typography} from '@mui/material'
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
import { EventsType, addMetaData, clearCurrentProfileNotes, clearUserEvents, setIsRefreshingUserEvents, setRefreshingCurrentProfileNotes, toggleRefreshCurrentProfileNotes, toggleRefreshUserNotes } from '../redux/slices/eventsSlice';
import RefreshIcon from '@mui/icons-material/Refresh';
import { setProfileEventToShow } from '../redux/slices/noteSlice';
import { fetchNostrBandMetaData, getMediaNostrBandImageUrl } from '../utils/eventUtils';
import { checkImageUrl } from '../utils/miscUtils';
import { nip19 } from 'nostr-tools';


interface ProfileProps {
    updateProfile: (name: string, about: string, picture: string, banner: string) => void;
}

export default function Profile({
    updateProfile, 
}: ProfileProps) {
const pool = useContext(PoolContext);
const events: EventsType = useSelector((state: RootState) => state.events);
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

const [imageSrc, setImageSrc] = useState(imageUrlInput);
const [bannerSrc, setBannerSrc] = useState(bannerUrlInput);


useEffect(() => {
    if (note.profileEventToShow !== null) {
        if (!events.metaData[note.profileEventToShow.pubkey]){
            const nostrBandMetaData = fetchNostrBandMetaData(note.profileEventToShow.pubkey);
            if (nostrBandMetaData) {
                nostrBandMetaData.then((data) => {
                    if (data) {
                        dispatch(addMetaData(data))
                    }
                })
            }
        }

        setProfileNameInput(events.metaData[note.profileEventToShow.pubkey]?.name ?? nip19.npubEncode(note.profileEventToShow.pubkey));
        setProfileAboutInput(events.metaData[note.profileEventToShow.pubkey]?.about ?? "");
        setImageUrlInput(getMediaNostrBandImageUrl(note.profileEventToShow.pubkey, "picture", 192));
        setBannerUrlInput(getMediaNostrBandImageUrl(note.profileEventToShow.pubkey, "banner", 1200));
        setImageSrc(getMediaNostrBandImageUrl(note.profileEventToShow.pubkey, "picture", 192));
        setBannerSrc(getMediaNostrBandImageUrl(note.profileEventToShow.pubkey, "banner", 1200));
        return;
    }
    
    if (!pool || !events.metaData[keys.publicKey.decoded]) return;
    
    const userMetaData = events.metaData[keys.publicKey.decoded];
    
    setProfileNameInput(userMetaData?.name ?? nip19.npubEncode(keys.publicKey.decoded));
    setProfileAboutInput(userMetaData?.about ?? "");
    setImageUrlInput(userMetaData?.picture ?? "");
    setBannerUrlInput(userMetaData?.banner ?? "");
    setImageSrc(userMetaData?.picture ?? "");
    setBannerSrc(userMetaData?.banner ?? "");
    
}, [pool,events.metaData, keys.publicKey.decoded, note.profileEventToShow])


const handleTabChange = (event: any, newValue: number) => {
    setTabIndex(newValue);
};

const handleFormSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!pool) return;

    if (profileNameInput === events.metaData[keys.publicKey.decoded]?.name  &&
        profileAboutInput === events.metaData[keys.publicKey.decoded]?.about  &&
        imageUrlInput === events.metaData[keys.publicKey.decoded]?.picture  &&
        bannerUrlInput === events.metaData[keys.publicKey.decoded]?.banner ) return;

    if (profileNameInput === "" && profileAboutInput === "" && imageUrlInput === "" && bannerUrlInput === "") return;
    console.log("Updating profile")
    updateProfile(profileNameInput, profileAboutInput, imageUrlInput, bannerUrlInput);
    setProfileNameInput(profileNameInput);
    setProfileAboutInput(profileAboutInput);
    setImageUrlInput(imageUrlInput);
    setBannerUrlInput(bannerUrlInput);
}

const handleLogout = () => {
    if (note.profileEventToShow !== null) {
        dispatch(setProfileEventToShow(null));
        dispatch(clearCurrentProfileNotes());
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

const handleRefreshUserNotesClicked = () => {
    if (note.profileEventToShow !== null) {
        dispatch(setRefreshingCurrentProfileNotes(true));
        dispatch(toggleRefreshCurrentProfileNotes());
        return;
    }
    dispatch(setIsRefreshingUserEvents(true));
    dispatch(toggleRefreshUserNotes());
}

const handleBannerError = () : string => {
    if (note.profileEventToShow !== null && events.metaData[note.profileEventToShow.pubkey]?.banner !== undefined) {
        console.log("banner " + events.metaData[note.profileEventToShow.pubkey]?.banner)
        checkImageUrl(events.metaData[note.profileEventToShow.pubkey]?.banner ?? "").then(isWorking => {
            if (isWorking) {
                setBannerSrc(events.metaData[note.profileEventToShow!.pubkey].banner!);
                return events.metaData[note.profileEventToShow!.pubkey].banner!;
            };
        })
    } 

    if (note.profileEventToShow === null && events.metaData[keys.publicKey.decoded]?.banner !== undefined) {
        checkImageUrl(events.metaData[keys.publicKey.decoded].banner!).then(isWorking => {
            if (isWorking) {
                setBannerSrc(events.metaData[keys.publicKey.decoded].banner!);
                return events.metaData[keys.publicKey.decoded].banner!;
            };
        })
    }

    setBannerSrc("");
    return "";
}
    
// ----------------------------------------------------------------------


    return (
        <Box justifyContent="center" >
            {keys.publicKey.decoded !== "" && (
                <Box sx={{marginBottom: "50px"}}>

                    <Box style={{
                        position: 'relative',
                        height: 350,                                          
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        }}>
                           {bannerSrc !== "" && 
                                <Box
                                    component="img"
                                    src={bannerSrc}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        position: 'absolute',
                                        zIndex: -1,
                                        borderRadius: "0px 0px 20px 20px",
                                    }}
                                    onError={() => handleBannerError()}
                                />
                            } 
                        <Box sx={{display: "flex", justifyContent: "flex-end", padding: "1rem"}}>
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
                                src={imageSrc}
                                sx={{ width: 200, height: 200 }}
                                onError={() => note.profileEventToShow ? setImageSrc(events.metaData[note.profileEventToShow?.pubkey ?? ""]?.picture ?? "") : setImageSrc(events.metaData[keys.publicKey.decoded]?.picture ?? "")}
                                />
                        </div>
                        </AppBar>
                    </Box>

                    <Box sx={{marginTop: "1rem", marginBottom: "1rem"}}>
                        <Stack direction="column" spacing={3} marginTop="1rem">
                            <Box>
                                <Box sx={{ 
                                        color: themeColors.textColor,
                                        textAlign: 'center',
                                        marginBottom: "0.5rem",
                                    }}>
                                    <Chip 
                                        label={"Following: " + (note.profileEventToShow ? nostr.currentProfileFollowing.length : nostr.following.length)}
                                        sx={{ margin: "0.5rem", color: themeColors.textColor }}
                                        />
                                    <Chip
                                        label={"Followers: " + (note.profileEventToShow ? nostr.currentProfileFollowers.length : nostr.followers.length)}
                                        sx={{ margin: "0.5rem", color: themeColors.textColor }}
                                        />
                                </Box>
                                <Box sx={{ 
                                        color: themeColors.textColor,
                                        textAlign: 'center',
                                        marginBottom: "0.5rem",
                                    }}>
                                    <Typography variant='h5' color={themeColors.primary}>
                                        {profileNameInput}
                                    </Typography>
                                    <Typography variant='body2' color={themeColors.textColor}>
                                        {profileAboutInput}
                                    </Typography>
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
                                                fullWidth
                                                label="Name"
                                                InputLabelProps={{style: {color: themeColors.textColor}}} 
                                                color='primary'
                                                value={profileNameInput}
                                                onChange={e => setProfileNameInput(e.target.value)}
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
                                                    fullWidth
                                                    label="About"
                                                    InputLabelProps={{style: {color: themeColors.textColor}}} 
                                                    color='primary'
                                                    value={profileAboutInput}
                                                    onChange={e => setProfileAboutInput(e.target.value)}
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
                                                    fullWidth
                                                    label="Profile Image URL"
                                                    InputLabelProps={{style: {color: themeColors.textColor}}} 
                                                    color='primary'
                                                    value={imageUrlInput}
                                                    onChange={e => setImageUrlInput(e.target.value)}
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
                                                        fullWidth
                                                        label="Banner Image URL"
                                                        InputLabelProps={{sx: { color: themeColors.textColor }}}
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
                    
                    <Box sx={{color: themeColors.textColor,  display: 'flex'}}>
                        <Tabs
                            value={tabIndex}
                            textColor='inherit'
                            indicatorColor="secondary"
                            onChange={handleTabChange}
                            >
                            <Tab label="User Notes" />
                            <Tab label="Notifications" />   
                        </Tabs>
                        <IconButton
                            onClick={() => handleRefreshUserNotesClicked()}
                            disabled={events.refreshingUserNotes || events.refreshingCurrentProfileNotes}
                            sx={{
                                color: themeColors.secondary, 
                                marginLeft: "auto",
                                ...((events.refreshingUserNotes || events.refreshingCurrentProfileNotes) && {
                                    animation: 'spin 1s linear infinite'
                                })
                            }}>
                            <RefreshIcon />
                        </IconButton>
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