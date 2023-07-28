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
  replyEvents: Record<string, Event[]>;
  rootEvents: Record<string, Event[]>;
  metaData: Record<string, MetaData>;
  reactions: Record<string, Event[]>;
  open: boolean;
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
  replyEvents,
  rootEvents,
  metaData,
  reactions,
  fetchEvents,
  setFetchEvents,
  open,
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


  const getThread = () => {
    return (
      <Box>
        <Box>
          {rootEvents[event.id] && (rootEvents[event.id]?.length ?? 0) > 0 && 
            rootEvents[event.id].map((rootEvent: Event) => {
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
                      replyEvents={replyEvents}
                      rootEvents={rootEvents}
                      metaData={metaData}
                      reactions={reactions}
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
              replyEvents={replyEvents}
              rootEvents={rootEvents}
              fetchEvents={fetchEvents}
              metaData={metaData}
              reactions={reactions}
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
          {(replyEvents[event.id]?.length ?? 0) > 0 && (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <SouthIcon />
                </Box>
                {replyEvents[event.id].map((replyEvent) => {
                  return (
                    <Note 
                      event={replyEvent}
                      replyEvents={replyEvents}
                      rootEvents={rootEvents}
                      reactions={reactions}
                      metaData={metaData}
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
        open={open}
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
