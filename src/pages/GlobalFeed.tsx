import { Box, Fab, IconButton, Modal, Tab, Tabs, Typography } from '@mui/material';
import { SimplePool } from 'nostr-tools'
import { MutableRefObject, useState } from 'react'
import HashtagsFilter from '../components/HashtagsFilter';
import Note from '../components/Note';
import "./GlobalFeed.css";
import EditIcon from '@mui/icons-material/Edit';
import CreateNote from '../components/CreateNote';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { FullEventData, RelaySetting } from '../nostr/Types';
import Loading from '../components/Loading';

const createNoteStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "95%",
    maxWidth: "600px",
    height: "auto",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 2,
    overflowY: 'auto' as 'auto', //scrollable
  };


type GlobalFeedProps = {
    pool: SimplePool | null;
    relays: RelaySetting[];
    pk: string;
    updateFollowing: (pubkey: string) => void;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
    following: string[];
    fetchEvents: boolean;
    setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
    fetchingEventsInProgress: MutableRefObject<boolean>;
    hideExplicitContent: MutableRefObject<boolean>;
    imagesOnlyMode: MutableRefObject<boolean>;
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
    setFetchEvents,
    fetchingEventsInProgress,
    events,
    hashtags,
    tabIndex,
    updateFollowing,
    setTabIndex,
    setHashtags,
    imagesOnlyMode,
  }) => {

    const [createNoteOpen, setCreateNoteOpen] = useState(false);
    const { themeColors } = useContext(ThemeContext);

    //global or followers
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        setFetchEvents(true);
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
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    width: '100vw',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }} >
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
                            setFetchEvents={setFetchEvents}
                            eventData={fullEventData} 
                            updateFollowing={updateFollowing} 
                            following={following} 
                            setHashtags={setHashtags} 
                            key={fullEventData.sig + Math.random()} 
                            pk={pk}
                            hashTags={hashtags}
                            imagesOnlyMode={imagesOnlyMode}
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
                fetchEvents={fetchEvents}
                setFetchEvents={setFetchEvents}
                />
            
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
                    <Tab label="Following"/>
                </Tabs>

            </Box>
    </Box>
    )
}

export default GlobalFeed