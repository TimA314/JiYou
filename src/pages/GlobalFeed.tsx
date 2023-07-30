import { Box, Fab, IconButton, Modal, Tab, Tabs, Typography } from '@mui/material';
import { Filter } from 'nostr-tools'
import { MutableRefObject, useState } from 'react'
import SearchFilter from '../components/SearchFilter';
import Note from '../components/Note';
import "./GlobalFeed.css";
import EditIcon from '@mui/icons-material/Edit';
import CreateNote from '../components/CreateNote';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

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
    updateFollowing: (pubkey: string) => void;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>;
    following: string[];
    fetchEvents: boolean;
    setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
    fetchingEventsInProgress: MutableRefObject<boolean>;
    hideExplicitContent: MutableRefObject<boolean>;
    imagesOnlyMode: MutableRefObject<boolean>;
    tabIndex: number;
  };
  
  const GlobalFeed: React.FC<GlobalFeedProps> = ({ 
    following,
    fetchEvents,
    setFetchEvents,
    fetchingEventsInProgress,
    tabIndex,
    updateFollowing,
    setTabIndex,
    imagesOnlyMode,
  }) => {
    const notes = useSelector((state: RootState) => state.notes);
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
        if (notes.globalNotes.length === 0) {
            return (
                <Typography
                    variant="h6" 
                    color={themeColors.textColor} 
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                        No Notes
                </Typography>
            )
        } else {
            return (
                notes.globalNotes.map((event) => {
                    return (
                        <Note 
                            fetchEvents={fetchEvents}
                            setFetchEvents={setFetchEvents}
                            event={event}
                            updateFollowing={updateFollowing} 
                            following={following} 
                            key={event.sig}
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

            <SearchFilter 
                setFetchEvents={setFetchEvents}
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
                    <CreateNote />
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