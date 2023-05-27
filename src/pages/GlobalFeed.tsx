import { Box, Fab, IconButton, Modal, Tab, Tabs } from '@mui/material';
import { SimplePool } from 'nostr-tools'
import { useState } from 'react'
import HashtagsFilter from '../components/HashtagsFilter';
import Loading from '../components/Loading';
import Note from '../components/Note';
import "./GlobalFeed.css";
import { useFollowers } from '../hooks/useFollowers';
import { useListEvents } from '../hooks/useListEvents';
import { setEventData } from '../utils/eventUtils';
import EditIcon from '@mui/icons-material/Edit';
import CreateNote from '../components/CreateNote';
import CloseIcon from '@mui/icons-material/Close';


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
  };
  
  const GlobalFeed: React.FC<GlobalFeedProps> = ({ pool, relays, pk }) => {
    const { followers, setFollowing } = useFollowers({pool, relays, pk});
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [tabIndex, setTabIndex] = useState(0);
    const { events, setEvents, reactions, metaData } = useListEvents({ pool, relays, tabIndex, followers, hashtags});
    const [createNoteOpen, setCreateNoteOpen] = useState(false);


    //global or followers
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        setEvents([]);
    };

    const setFollowers = (pubkey: string) => {
        setFollowing(pubkey, pool, relays);
    }

    const handleCreateNoteOpen = () => {
        setCreateNoteOpen(true)
    }

    const handleCreateNoteClose = () => {
        setCreateNoteOpen(false)
    }

    const setPostedNote = () => {
        setCreateNoteOpen(false);
    }


    //render

    return (
        <Box sx={{marginTop: "52px"}}>

            <HashtagsFilter hashtags={hashtags} setHashtags={setHashtags} />

            {events.length === 0 && <Box sx={{textAlign: "center"}}><Loading /></Box>}
            
            {events.filter(
                (e, i, arr) => arr.findIndex(t => t.id === e.id) === i //remove duplicates
            )
            .map((event) => {
                const fullEventData = setEventData(event, metaData[event.pubkey], reactions[event.id]);
                return (
                    <Note pool={pool} relays={relays} eventData={fullEventData} setFollowing={setFollowers} followers={followers} setHashtags={setHashtags} key={event.sig} pk={pk} />
                )
            })}
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
                        }}
                        >
                        <CloseIcon />
                    </IconButton>
                    <CreateNote replyEventData={null} 
                                pool={pool} 
                                relays={relays} 
                                pk={pk}
                                setPostedNote={setPostedNote} />
                </Box>
            </Modal>

            <Box sx={{
                    bgcolor: 'background.paper',
                    position: "fixed",
                    bottom: 50,
                    left: 0,
                    right: 0,
                }}
                >
                <Fab color="secondary" aria-label="edit" sx={{ position: "fixed", bottom: 70, right: 10 }} onClick={handleCreateNoteOpen}>
                    <EditIcon /> 
                </Fab>
                <Tabs 
                    value={tabIndex} 
                    onChange={handleTabChange} 
                    centered>
                    <Tab label="Global"/>
                    <Tab label="Followers"/>
                </Tabs>

            </Box>
    </Box>
    )
}

export default GlobalFeed