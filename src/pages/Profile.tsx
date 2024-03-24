import { AppBar, Avatar, Box, Button, Collapse, IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, TextField, Toolbar, Typography, useMediaQuery, useTheme} from '@mui/material'
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
import { EventsType, addMetaData, clearCurrentProfileNotes, clearUserEvents, setIsRefreshingUserEvents, setRefreshingCurrentProfileNotes, toggleProfileRefreshAnimation, toggleRefreshCurrentProfileNotes, toggleRefreshUserNotes } from '../redux/slices/eventsSlice';
import RefreshIcon from '@mui/icons-material/Refresh';
import { addMessage, setProfileToShow } from '../redux/slices/noteSlice';
import { fetchNostrBandMetaData, getMediaNostrBandImageUrl } from '../utils/eventUtils';
import { DiceBears, checkImageUrl } from '../utils/miscUtils';
import { nip19 } from 'nostr-tools';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { MetaData } from '../nostr/Types';
import FollowChip from '../components/FollowChip';


interface ProfileProps {
    updateProfile: (profileContent: MetaData) => void;
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
const [lud16Input, setLud16Input] = useState("");
const [lud06Input, setLud06Input] = useState("");
const { themeColors } = useContext(ThemeContext);
const navigate = useNavigate();
const [tabIndex, setTabIndex] = useState(0);
const dispatch = useDispatch();
const [showEditProfile, setShowEditProfile] = useState(false);
const [imageSrc, setImageSrc] = useState(imageUrlInput);
const [bannerSrc, setBannerSrc] = useState(bannerUrlInput);
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


useEffect(() => {
    if (note.profilePublicKeyToShow !== null) {

        if (!events.metaData[note.profilePublicKeyToShow]){
            const nostrBandMetaData = fetchNostrBandMetaData(note.profilePublicKeyToShow);
            if (nostrBandMetaData) {
                nostrBandMetaData.then((data) => {
                    if (data) {
                        dispatch(addMetaData(data))
                    }
                })
            }
        }

        setProfileNameInput(events.metaData[note.profilePublicKeyToShow]?.name ?? nip19.npubEncode(note.profilePublicKeyToShow) ?? keys.publicKey.encoded);
        setProfileAboutInput(events.metaData[note.profilePublicKeyToShow]?.about ?? "");
        setImageUrlInput(getMediaNostrBandImageUrl(note.profilePublicKeyToShow, "picture", 192));
        setBannerUrlInput(getMediaNostrBandImageUrl(note.profilePublicKeyToShow, "banner", 1200));
        setImageSrc(getMediaNostrBandImageUrl(note.profilePublicKeyToShow, "picture", 192));
        setBannerSrc(getMediaNostrBandImageUrl(note.profilePublicKeyToShow, "banner", 1200));
        setLud16Input(events.metaData[note.profilePublicKeyToShow]?.lud16 ?? "");
        setLud06Input(events.metaData[note.profilePublicKeyToShow]?.lud06 ?? "");
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
    setLud16Input(userMetaData?.lud16 ?? "");
    setLud06Input(userMetaData?.lud06 ?? "");
    
}, [pool,events.metaData, keys.publicKey.decoded, note.profilePublicKeyToShow])


const handleTabChange = (event: any, newValue: number) => {
    setTabIndex(newValue);
};

const handleFormSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!pool) return;

    if (profileNameInput === events.metaData[keys.publicKey.decoded]?.name  &&
        profileAboutInput === events.metaData[keys.publicKey.decoded]?.about  &&
        imageUrlInput === events.metaData[keys.publicKey.decoded]?.picture  &&
        bannerUrlInput === events.metaData[keys.publicKey.decoded]?.banner && 
        lud16Input === events.metaData[keys.publicKey.decoded]?.lud16 &&
        lud06Input === events.metaData[keys.publicKey.decoded]?.lud06 ) return;

    if (profileNameInput.trim() === "" &&
        profileAboutInput.trim() === "" && 
        imageUrlInput.trim() === "" && 
        bannerUrlInput.trim() === "" &&
        lud16Input.trim() === "" &&
        lud06Input.trim() === "") return;

    const profileContent: MetaData = {
        name: profileNameInput,
        about: profileAboutInput,
        picture: imageUrlInput,
        banner: bannerUrlInput,
        lud16: lud16Input,
        lud06: lud06Input,
    }

    dispatch(addMessage({message: "Updating Profile", isError: false}))
    updateProfile(profileContent);
    setProfileNameInput(profileNameInput);
    setProfileAboutInput(profileAboutInput);
    setImageUrlInput(imageUrlInput);
    setBannerUrlInput(bannerUrlInput);
    setLud16Input(lud16Input);
    setLud06Input(lud06Input);
}

const handleLogout = () => {
    if (note.profilePublicKeyToShow !== null) {
        dispatch(setProfileToShow(null));
        dispatch(clearCurrentProfileNotes());
        navigate("/");
        return;
    }

    localStorage.removeItem("pk");
    localStorage.removeItem("sk");

    dispatch(setKeys({publicKey: {decoded: "", encoded: ""}, privateKey: {decoded: "", encoded: ""}}))
    dispatch(clearUserEvents());
    navigate("/start")
    console.log("Logged out");
}

const handleEditOrSaveClick = () => {
    setShowEditProfile(!showEditProfile);
    if (showEditProfile) {
        handleFormSubmit({preventDefault: () => {}});
    }
}

const handleRefreshUserNotesClicked = () => {
    if (note.profilePublicKeyToShow !== null) {
        dispatch(setRefreshingCurrentProfileNotes((prev: boolean) => !prev));
        dispatch(toggleRefreshCurrentProfileNotes());
        dispatch(toggleProfileRefreshAnimation());
        return;
    }
    dispatch(toggleProfileRefreshAnimation());
    dispatch(setIsRefreshingUserEvents(true));
    dispatch(toggleRefreshUserNotes());
}


const handleBannerError = () : string => {
    if (note.profilePublicKeyToShow !== null && events.metaData[note.profilePublicKeyToShow]?.banner !== undefined) {
        console.log("banner " + events.metaData[note.profilePublicKeyToShow]?.banner)
        checkImageUrl(events.metaData[note.profilePublicKeyToShow]?.banner ?? "").then(isWorking => {
            if (isWorking) {
                setBannerSrc(events.metaData[note.profilePublicKeyToShow!].banner!);
                return events.metaData[note.profilePublicKeyToShow!].banner!;
            };
        })
    } 

    if (note.profilePublicKeyToShow === null && events.metaData[keys.publicKey.decoded]?.banner !== undefined) {
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
                                {note.profilePublicKeyToShow !== null ? "Back" : "Logout"}
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
                                onError={() => note.profilePublicKeyToShow ? setImageSrc(events.metaData[note.profilePublicKeyToShow ?? ""]?.picture ?? "") : setImageSrc(events.metaData[keys.publicKey.decoded]?.picture ?? "")}
                                />
                        </div>
                        </AppBar>
                    </Box>

                    <Box sx={{marginTop: "0.1rem", marginBottom: "1rem", alignItems: 'center', justifyContent: "center", display: "flex"}}>
                        <Stack direction="column" spacing={1} marginTop="1rem">
                            <Box>
                                <Stack direction={isMobile ? "column" : "row"} spacing={1} >
                                    <FollowChip chipName='Following' followPks={note.profilePublicKeyToShow ? nostr.currentProfileFollowing : nostr.following}/>
                                    <FollowChip chipName="Followers" followPks={note.profilePublicKeyToShow ? nostr.currentProfileFollowers: nostr.followers}/>
                                </Stack>

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

                                {note.profilePublicKeyToShow === null && (
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
                                            <Paper sx={{marginTop: "1rem"}}>
                                                <TextField
                                                    id="lud16Input"
                                                    fullWidth
                                                    label="LUD-16 (ex. ...@walletofsatoshi.com )"
                                                    InputLabelProps={{sx: { color: themeColors.textColor }}}
                                                    color="primary"
                                                    value={lud16Input}
                                                    onChange={e => setLud16Input(e.target.value)} 

                                                    InputProps={{
                                                        style: { color: themeColors.textColor},
                                                        startAdornment: 
                                                        <InputAdornment position="start">
                                                            <ElectricBoltIcon sx={{ color: themeColors.textColor }} />
                                                        </InputAdornment>
                                                    }}
                                                    />
                                            </Paper>
                                            <Paper sx={{marginTop: "1rem"}}>
                                                <TextField
                                                    id="lud06Input"
                                                    fullWidth
                                                    label="LNURL (LUD-06)"
                                                    InputLabelProps={{sx: { color: themeColors.textColor }}}
                                                    color="primary"
                                                    value={lud06Input}
                                                    onChange={e => setLud06Input(e.target.value)} 

                                                    InputProps={{
                                                        style: { color: themeColors.textColor},
                                                        startAdornment: 
                                                        <InputAdornment position="start">
                                                            <ElectricBoltIcon sx={{ color: themeColors.textColor }} />
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
                            disabled={events.profileRefreshAnimation}
                            sx={{
                                color: themeColors.secondary, 
                                marginLeft: "auto",
                                ...((events.profileRefreshAnimation) && {
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