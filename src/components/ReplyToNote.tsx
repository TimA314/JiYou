import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Note from './Note';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreateNote from './CreateNote';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setReplyToNoteEvent } from '../redux/slices/noteSlice';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "95%",
  maxWidth: "600px",
  height: "90%",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  overflowY: 'auto' as 'auto', //scrollable
};

interface ReplyToNoteProps {
  updateFollowing: (pubkey: string) => void;
}

export default function ReplyToNote({updateFollowing}: ReplyToNoteProps) {
  const note = useSelector((state: RootState) => state.note);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setReplyToNoteEvent(null));
  }

  const getNote = () => {

    if (note.replyToNoteEvent){
      return (
        <Box>
          <Note 
          event={note.replyToNoteEvent}
          updateFollowing={updateFollowing} 
          disableReplyIcon={true}
          />
          <CreateNote />
      </Box>
      )
    } else {
      return <></>
    }
  }

  return (
    <div>
      <Modal
        open={note.replyToNoteEvent ? true : false}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
            <IconButton 
            aria-label="close" 
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
            {getNote()}
        </Box>
      </Modal>
    </div>
  );
}