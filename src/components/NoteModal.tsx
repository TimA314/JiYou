import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { SimplePool } from 'nostr-tools';
import { FullEventData, RelaySetting } from '../nostr/Types';
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
  eventData: FullEventData;
  replyEvents: FullEventData[];
  rootEvents: FullEventData[];
  open: boolean;
  setNoteDetailsOpen: (open: boolean) => void;
  pool: SimplePool | null;
  relays: RelaySetting[];
  following: string[];
  updateFollowing: (pubkey: string) => void;
  setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
  pk: string;
  sk_decoded: string;
  hashTags: string[];
  imagesOnlyMode?: React.MutableRefObject<boolean>;
}

export default function NoteModal({
  pk,
  sk_decoded,
  eventData,
  replyEvents,
  rootEvents,
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
          {rootEvents && rootEvents.length > 0 && 
            rootEvents.map((rootEvent: FullEventData) => {
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
                      key={eventData.sig + Math.random()}
                      eventData={rootEvent}
                      replyEvents={replyEvents}
                      rootEvents={rootEvents}
                      pool={pool}
                      relays={relays}
                      fetchEvents={fetchEvents}
                      setFetchEvents={setFetchEvents}
                      following={following}
                      updateFollowing={updateFollowing}
                      setHashtags={setHashtags}
                      pk={pk}
                      sk_decoded={sk_decoded}
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
              eventData={eventData}
              replyEvents={replyEvents}
              rootEvents={rootEvents}
              fetchEvents={fetchEvents}
              setFetchEvents={setFetchEvents}
              pool={pool} relays={relays}
              following={following}
              updateFollowing={updateFollowing}
              setHashtags={setHashtags}
              pk={pk}
              sk_decoded={sk_decoded}
              disableReplyIcon={false}
              hashTags={hashTags}
              key={eventData.sig + Math.random()}
              imagesOnlyMode={imagesOnlyMode}
              isInModal={true}
            />
        </Box>

        <Box>
          {replyEvents.length > 0 && (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <SouthIcon />
                </Box>
                {replyEvents.map((replyEvent) => {
                  return (
                    <Note 
                    eventData={replyEvent}
                    replyEvents={replyEvents}
                    rootEvents={rootEvents}
                    pool={pool}
                    relays={relays}
                    fetchEvents={fetchEvents}
                    setFetchEvents={setFetchEvents}
                    following={following}
                    updateFollowing={updateFollowing}
                    setHashtags={setHashtags}
                    pk={pk}
                    sk_decoded={sk_decoded}
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
