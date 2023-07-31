import { AppBar, Avatar, Box, Button, Chip, IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, TextField, Toolbar} from '@mui/material'
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
const [profileNameInput, setProfileNameInput] = useState(events.metaData[keys.publicKey.decoded]?.name ?? "");
const [profileAboutInput, setProfileAboutInput] = useState(events.metaData[keys.publicKey.decoded]?.about ?? "");
const [imageUrlInput, setImageUrlInput] = useState(events.metaData[keys.publicKey.decoded]?.picture ?? "");
const [bannerUrlInput, setBannerUrlInput] = useState(events.metaData[keys.publicKey.decoded]?.banner ?? "");
const { themeColors } = useContext(ThemeContext);
const navigate = useNavigate();
const [tabIndex, setTabIndex] = useState(0);
const dispatch = useDispatch();



useEffect(() => {
    if (!pool || keys.publicKey.decoded === "") return;

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
    localStorage.removeItem("pk");
    localStorage.removeItem("sk");
    dispatch(setKeys({publicKey: {decoded: "", encoded: ""}, privateKey: {decoded: "", encoded: ""}}))
    console.log("Logged out");
    navigate("/start")
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
                                src={imageUrlInput}
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
                                            label={"Following: " + nostr.following.length}
                                            sx={{ margin: "1px", color: themeColors.textColor }}
                                            />
                                        <Chip
                                            label={"Followers: " + nostr.followers.length}
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