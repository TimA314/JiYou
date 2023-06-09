import { Box, Fab, IconButton, Modal, Tab, Tabs, Typography } from '@mui/material';
import { Filter, SimplePool } from 'nostr-tools'
import { MutableRefObject, useState } from 'react'
import SearchFilter from '../components/SearchFilter';
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
    height: "325px",
    p: 2,
  };


type GlobalFeedProps = {
    pool: SimplePool | null;
    relays: RelaySetting[];
    pk: string;
    sk_decoded: string;
    updateFollowing: (pubkey: string) => void;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
    following: string[];
    fetchEvents: boolean;
    filter: MutableRefObject<Filter | null>;
    setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
    fetchingEventsInProgress: MutableRefObject<boolean>;
    hideExplicitContent: MutableRefObject<boolean>;
    imagesOnlyMode: MutableRefObject<boolean>;
    threadEvents: {
        feedEvents: Map<string, FullEventData>, 
        replyEvents: Map<string, FullEventData>, 
        rootEvents: Map<string, FullEventData>
      };
    hashtags: string[];
    tabIndex: number;
  };
  
  const GlobalFeed: React.FC<GlobalFeedProps> = ({ 
    pool, 
    relays, 
    pk,
    sk_decoded,
    following,
    fetchEvents,
    setFetchEvents,
    filter,
    fetchingEventsInProgress,
    threadEvents,
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

    const renderFeed = () => {
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
        } else if (threadEvents.feedEvents.size === 0 && !fetchingEventsInProgress.current) {
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
                Array.from(threadEvents.feedEvents.values()).map((fullEventData) => {
                    const rootEventIds = fullEventData.tags.filter((t) => t[0] === "e" && t[1] && t[1] !== fullEventData.eventId).map((t) => t[1]);
                    const eventRootNotes: FullEventData[] = rootEventIds.map((id) => threadEvents.rootEvents.get(id)).filter((event): event is FullEventData => Boolean(event));
                    const eventReplyNotes: FullEventData[] = Array.from(threadEvents.replyEvents.values()).filter((r) => r.tags.some((t) => t[0] === "e" && t[1] && t[1] === fullEventData.eventId));
            
                    return (
                        <Note 
                            pool={pool} 
                            relays={relays}
                            fetchEvents={fetchEvents}
                            setFetchEvents={setFetchEvents}
                            eventData={fullEventData}
                            replyEvents={eventReplyNotes}
                            rootEvents={eventRootNotes}
                            updateFollowing={updateFollowing} 
                            following={following} 
                            setHashtags={setHashtags} 
                            key={fullEventData.sig} 
                            pk={pk}
                            hashTags={hashtags}
                            imagesOnlyMode={imagesOnlyMode}
                            sk_decoded={sk_decoded}
                        />
                    )
                })
            )
        }
    }




    //render
    return (
        <Box sx={{marginTop: "52px"}}>

            <SearchFilter 
                hashtags={hashtags} 
                setHashtags={setHashtags} 
                setFetchEvents={setFetchEvents}
                filter={filter}
                />
            
            {renderFeed()}

            <Modal
                open={createNoteOpen}
                onClose={handleCreateNoteClose}
                sx={{...createNoteStyle, backgroundColor: themeColors.paper}}
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
                        sk_decoded={sk_decoded}
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