import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Event } from 'nostr-tools';
import Note from './Note';
import { Stack } from '@mui/material';
import SouthIcon from '@mui/icons-material/South';
import { useContext } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { ThemeContext } from '../theme/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setNoteModalEvent } from '../redux/slices/noteSlice';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  width: "95%",
  maxHeight: "95%",
  maxWidth: "95%",
  boxShadow: 24,
  overflowY: 'auto' as 'auto', //scrollable
};

interface NoteModalProps {
  updateFollowing: (pubkey: string) => void;
}

export default function NoteModal({
  updateFollowing,
}: NoteModalProps) {
  const note = useSelector((state: RootState) => state.note);  
  const dispatch = useDispatch();
  const { themeColors } = useContext(ThemeContext);
  const events = useSelector((state: RootState) => state.events);
  const idsFromTags = note.noteModalEvent?.tags.filter((t) => t[0] === "e" && t[1])?.map((t) => t[1]);
  const rootNotes = idsFromTags?.length ?? 0 > 0 ? events.rootNotes.filter((e) => idsFromTags!.includes(e.id)) : [];

  const handleClose = () => {
    dispatch(setNoteModalEvent(null));
  }

  const getThread = () => {
    if (note.noteModalEvent === null) return <></>;
    return (
      <Box sx={{ 
        maxWidth: "95%"
      }}>
        <Box>
          {(rootNotes?.length ?? 0) > 0 && 
            rootNotes.map((rootEvent: Event) => {
              return (
                <Box 
                  key={(rootEvent.sig + "RootEventInModal")}                                        
                  sx={{ 
                    maxWidth: "95%"
                  }}
                >
                  <Note
                      key={rootEvent.sig + "NoteModal"}
                      event={rootEvent}
                      updateFollowing={updateFollowing}
                      disableReplyIcon={false}
                      disableImagesOnly={true}
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
              event={note.noteModalEvent}
              updateFollowing={updateFollowing}
              disableReplyIcon={false}
              key={note.noteModalEvent.sig + "NoteModal"}
              isInModal={true}
              disableImagesOnly={true}
            />
        </Box>

        <Box>
          {(events.replyNotes[note.noteModalEvent.id]?.length ?? 0) > 0 && (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <SouthIcon />
                </Box>
                {events.replyNotes[note.noteModalEvent.id].map((replyEvent) => {
                  return (
                    <Note 
                      event={replyEvent}
                      updateFollowing={updateFollowing}
                      key={replyEvent.sig + "NoteModal"}
                      disableReplyIcon={false}
                      isInModal={true}
                      disableImagesOnly={true}
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
        open={note.noteModalEvent !== null}
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

        <Box sx={{overflowY: 'auto', width: '98%', maxHeight: "85%", maxWidth: "95%"}}>
            <Stack direction="row" spacing={0} flexDirection="column">

                {getThread()}

              </Stack>
          </Box>      
      </Box>
    </Modal>
  );
} 
