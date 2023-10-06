import { Box, Fab, IconButton, Modal, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react'
import SearchFilter from '../components/SearchFilter';
import Note from '../components/Note';
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
import { VariableSizeList as List } from 'react-window';

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
    const listRef = useRef<List>(null);
    const [heights, setHeights] = useState<Record<number, number>>({});

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

    const observeHeight = (index: number) => {
        let resizeObserver: ResizeObserver | null = null;
        return (node: HTMLElement | null) => {
            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }
            if (node !== null) {
                resizeObserver = new ResizeObserver(([entry]) => {
                    setHeights((prev) => {
                        const newHeights = { ...prev, [index]: Math.ceil(entry.contentRect.height) };
                        if (listRef.current) {
                            listRef.current.resetAfterIndex(index);
                        }
                        return newHeights;
                    });
                });
                resizeObserver.observe(node);
            }
        };
    };
    
    
    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        return (
          <div ref={observeHeight(index)} key={events.globalNotes[index].sig}>
            <Note 
              event={events.globalNotes[index]}
              onNoteHeightChange={onNoteHeightChange} // Pass the callback here
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
                <List
                ref={listRef}
                height={window.innerHeight - 100}
                width="100%"
                itemCount={events.globalNotes.length}
                itemSize={index => heights[index] ?? 225}  // default height if not available
                >
                    {Row}
                </List>
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