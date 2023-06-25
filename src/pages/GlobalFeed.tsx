import { Box, Fab, IconButton, Modal, Tab, Tabs, Typography } from '@mui/material';
import { EventTemplate, SimplePool } from 'nostr-tools'
import { MutableRefObject, useState } from 'react'
import HashtagsFilter from '../components/HashtagsFilter';
import Note from '../components/Note';
import "./GlobalFeed.css";
import EditIcon from '@mui/icons-material/Edit';
import CreateNote from '../components/CreateNote';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { FullEventData } from '../nostr/Types';
import Loading from '../components/Loading';

const createNoteStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "95%",
    maxWidth: "600px",
    height: "70%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 2,
    overflowY: 'auto' as 'auto', //scrollable
  };


type GlobalFeedProps = {
    pool: SimplePool | null;
    relays: string[];
    pk: string;
    updateFollowing: (pubkey: string) => void;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
    following: string[];
    fetchEvents: React.MutableRefObject<boolean>;
    fetchingEventsInProgress: MutableRefObject<boolean>;
    hideExplicitContent: boolean;
    imagesOnlyMode: boolean;
    events: FullEventData[];
    hashtags: string[];
    tabIndex: number;
  };
  
  const GlobalFeed: React.FC<GlobalFeedProps> = ({ 
    pool, 
    relays, 
    pk, 
    following,
    fetchEvents,
    fetchingEventsInProgress,
    events,
    hashtags,
    tabIndex,
    updateFollowing,
    setTabIndex,
    setHashtags,
  }) => {

    const [createNoteOpen, setCreateNoteOpen] = useState(false);
    const { themeColors } = useContext(ThemeContext);

    //global or followers
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        fetchEvents.current = true;
    };

    const handleCreateNoteOpen = () => {
        setCreateNoteOpen(true)
    }

    const handleCreateNoteClose = () => {
        setCreateNoteOpen(false)
    }

    const setPostedNote = () => {
        setCreateNoteOpen(false);
    }

    const getFeed = () => {
        if (fetchingEventsInProgress.current) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                    <Loading />
                </Box>
            )
        } else if (events.length === 0) {
            return (
                <Typography 
                    variant="h6" 
                    color={themeColors.textColor} 
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                        No Notes Found
                </Typography>
            )
        } else {
            return (
                events.map((fullEventData) => {
                    return (
                        <Note 
                            pool={pool} 
                            relays={relays}
                            fetchEvents={fetchEvents}
                            eventData={fullEventData} 
                            updateFollowing={updateFollowing} 
                            following={following} 
                            setHashtags={setHashtags} 
                            key={fullEventData.sig + Math.random()} 
                            pk={pk}
                            hashTags={hashtags}
                        />
                    )
                })
            )
        }
    }




    //render
    return (
        <Box sx={{marginTop: "52px"}}>

            <HashtagsFilter 
                hashtags={hashtags} 
                setHashtags={setHashtags} 
                fetchEvents={fetchEvents}/>
            
            {getFeed()}

            <Modal
                open={createNoteOpen}
                onClose={handleCreateNoteClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={createNoteStyle}
                >
                <Box>
                    <IconButton 
                        aria-label="close" 
                        onClick={handleCreateNoteClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: themeColors.textColor
                        }}
                        >
                        <CloseIcon />
                    </IconButton>
                    <CreateNote 
                        replyEventData={null} 
                        pool={pool} 
                        relays={relays} 
                        pk={pk}
                        setPostedNote={setPostedNote} 
                        />
                </Box>
            </Modal>

            <Box sx={{
                    bgcolor: 'background.paper',
                    position: "fixed",
                    bottom: 50,
                    left: 0,
                    right: 0,
                    color: themeColors.textColor,
                }}
                >
                    
                <Fab 
                    color="secondary" 
                    aria-label="edit" 
                    sx={{ position: "fixed", bottom: 70, right: 10 }} 
                    onClick={handleCreateNoteOpen}>
                    <EditIcon /> 
                </Fab>

                <Tabs 
                    value={tabIndex} 
                    onChange={handleTabChange}
                    textColor='inherit'
                    indicatorColor='secondary'
                    centered>
                    <Tab 
                        label="Global"
                        />
                    <Tab label="Followers"/>
                </Tabs>

            </Box>
    </Box>
    )
}

export default GlobalFeed