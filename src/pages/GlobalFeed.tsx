import { Box, Fab, IconButton, Modal, Tab, Tabs } from '@mui/material';
import { useRef, useState } from 'react'
import SearchFilter from '../components/SearchFilter';
import Note from '../components/Note/Note';
import "./GlobalFeed.css";
import EditIcon from '@mui/icons-material/Edit';
import CreateNote from '../components/CreateNote';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { clearGlobalNotes, setIsRefreshingFeedNotes, toggleRefreshFeedNotes } from '../redux/slices/eventsSlice';
import { setTabIndex } from '../redux/slices/noteSlice';
import RefreshIcon from '@mui/icons-material/Refresh';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

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
};
  
const GlobalFeed: React.FC<GlobalFeedProps> = ({ 
    updateFollowing
}) => {
    const events = useSelector((state: RootState) => state.events);
    const note = useSelector((state: RootState) => state.note);
    const dispatch = useDispatch();
    const [createNoteOpen, setCreateNoteOpen] = useState(false);
    const { themeColors } = useContext(ThemeContext);

    const defaultHeight = 250;
    const initialHeights = events.globalNotes.map(() => defaultHeight);
    const [heights, setHeights] = useState<Record<number, number>>(initialHeights);


    //global or followers
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        dispatch(setTabIndex(newValue));
        dispatch(clearGlobalNotes());
        dispatch(toggleRefreshFeedNotes())
    };

    const handleCreateNoteOpen = () => {
        setCreateNoteOpen(true)
    }

    const handleCreateNoteClose = () => {
        setCreateNoteOpen(false)
    }

    const onNoteHeightChange = (index: number, height: number) => {

        setHeights((prev) => ({ ...prev, [index]: height }));
        
    }
    
    const Row = ({ index }: { index: number }) => {
        return (
            <div
                key={events.globalNotes[index].sig}
                style={{
                    transition: 'height 0.3s ease-in-out',
                    height: heights[index] || defaultHeight,
                    marginTop: "1rem",
                }}
            >
                <Note 
                    event={events.globalNotes[index]}
                    onNoteHeightChange={onNoteHeightChange}
                    updateFollowing={updateFollowing}
                    noteIndex={index} 
                />
            </div>
        );
    };

    const renderFeed = () => {
        if (events.globalNotes.length === 0) {
            return <></>;
        } else {
            return (
                <Box sx={{height: "100vh", display: "flex", flexGrow: 1}}>
                        <AutoSizer disableWidth>
                            {({ height }) => (
                                <VariableSizeList
                                    height={window.innerHeight - 125}
                                    width="100%"
                                    itemCount={events.globalNotes.length}
                                    itemSize={index => height}
                                    overscanCount={5}
                                >
                                    {Row}
                                </VariableSizeList>
                            )}
                        </AutoSizer>
                </Box>
            );
        }
    };


    //render
    return (
        <Box sx={{width: '100%', marginTop: "52px"}}>

            <SearchFilter />

            <IconButton 
                onClick={() => {
                    dispatch(toggleRefreshFeedNotes())
                    dispatch(setIsRefreshingFeedNotes(true))
                }} 
                disabled={events.refreshingFeedNotes}
                sx={{ 
                    color: themeColors.secondary, 
                    position: 'fixed', 
                    top: 70, 
                    right: 10, 
                    zIndex: 1000,
                    ...(events.refreshingFeedNotes && {
                        animation: 'spin 1s linear infinite'
                    })
                }}>
                <RefreshIcon />
            </IconButton>
            
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
                    <CreateNote setCreateNoteOpen={setCreateNoteOpen} />
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
                    value={note.tabIndex} 
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