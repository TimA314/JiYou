import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Event, SimplePool } from 'nostr-tools';
import { MetaData, RelaySetting } from '../nostr/Types';
import Note from './Note';
import { Stack } from '@mui/material';
import SouthIcon from '@mui/icons-material/South';
import { useContext } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { ThemeContext } from '../theme/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  width: "95%",
  maxWidth: "1000px",
  boxShadow: 24,
  overflowY: 'auto' as 'auto', //scrollable
};

interface NoteModalProps {
  fetchEvents: boolean;
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
  event: Event;
  setNoteDetailsOpen: (open: boolean) => void;
  pool: SimplePool | null;
  relays: RelaySetting[];
  following: string[];
  updateFollowing: (pubkey: string) => void;
  setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
  hashTags: string[];
  imagesOnlyMode?: React.MutableRefObject<boolean>;
}

export default function NoteModal({
  event,
  fetchEvents,
  setFetchEvents,
  setNoteDetailsOpen,
  pool,
  relays,
  following,
  updateFollowing,
  setHashtags,
  hashTags,
  imagesOnlyMode
}: NoteModalProps) {
  const handleClose = () => setNoteDetailsOpen(false);
  const { themeColors } = useContext(ThemeContext);
  const notes = useSelector((state: RootState) => state.notes);
  const idsFromTags = event.tags.filter((t) => t[0] === "e" && t[1])?.map((t) => t[1]);
  const rootNotes = idsFromTags?.length ?? 0 > 0 ? notes.rootNotes.filter((e) => idsFromTags!.includes(e.id)) : [];
  const note = useSelector((state: RootState) => state.note);


  const getThread = () => {
    return (
      <Box>
        <Box>
          {(rootNotes?.length ?? 0) > 0 && 
            rootNotes.map((rootEvent: Event) => {
              return (
                <Box 
                  key={rootEvent.sig + Math.random()}                                        
                  sx={{ 
                    marginBottom: "10px", 
                    justifyContent: "center", 
                    flexDirection: "row", 
                    alignItems: "center" 
                  }}
                >
                  <Note
                      key={rootEvent.sig + Math.random()}
                      event={rootEvent}
                      pool={pool}
                      relays={relays}
                      fetchEvents={fetchEvents}
                      setFetchEvents={setFetchEvents}
                      following={following}
                      updateFollowing={updateFollowing}
                      setHashtags={setHashtags}
                      disableReplyIcon={false}
                      hashTags={hashTags}
                      imagesOnlyMode={imagesOnlyMode}
                      isInModal={true}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                    <SouthIcon sx={{color: themeColors.textColor}}/>
                  </Box>
                </Box>
              )
          })}
        </Box>

        <Box>
            <Note 
              event={event}
              fetchEvents={fetchEvents}
              setFetchEvents={setFetchEvents}
              pool={pool} relays={relays}
              following={following}
              updateFollowing={updateFollowing}
              setHashtags={setHashtags}
              disableReplyIcon={false}
              hashTags={hashTags}
              key={event.sig + "modal"}
              imagesOnlyMode={imagesOnlyMode}
              isInModal={true}
            />
        </Box>

        <Box>
          {(notes.replyNotes[event.id]?.length ?? 0) > 0 && (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <SouthIcon />
                </Box>
                {notes.replyNotes[event.id].map((replyEvent) => {
                  return (
                    <Note 
                      event={replyEvent}
                      pool={pool}
                      relays={relays}
                      fetchEvents={fetchEvents}
                      setFetchEvents={setFetchEvents}
                      following={following}
                      updateFollowing={updateFollowing}
                      setHashtags={setHashtags}
                      key={replyEvent.sig + Math.random()}
                      disableReplyIcon={false}
                      hashTags={hashTags}
                      imagesOnlyMode={imagesOnlyMode}
                      isInModal={true}
                    />
                    );
                  })}
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Modal
        open={Boolean(note.noteModalOpen.valueOf())}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
    <Box sx={{...style, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Box sx={{position: 'absolute', top: 8, right: 1}}>
            <ClearIcon            
              sx={{color: themeColors.textColor, cursor: 'pointer'}}
              onClick={handleClose} />
        </Box>

        <Box sx={{overflowY: 'auto', width: '98%', maxHeight: "80vh"}}>
            <Stack direction="row" spacing={0} flexDirection="column">

                {getThread()}

              </Stack>
          </Box>      
      </Box>
    </Modal>
  );
} 
