import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Event, SimplePool } from 'nostr-tools';
import { FullEventData, GettingReplies, MetaData, ReactionCounts } from '../nostr/Types';
import Note from './Note';
import { Stack } from '@mui/material';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { setEventData } from '../utils/eventUtils';
import { defaultRelays } from '../nostr/DefaultRelays';
import ClearIcon from '@mui/icons-material/Clear';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto' as 'auto', //scrollable
};

interface NoteModalProps {
  eventData: FullEventData;
  open: boolean;
  setNoteDetailsOpen: (open: boolean) => void;
  pool: SimplePool | null;
  relays: string[];
  followers: string[];
  setFollowing: (pubkey: string) => void;
  setReplies: (replies: Event[]) => void;
  setGettingReplies: (gettingReplies: GettingReplies) => void;
  replies: Event[];
  gettingReplies: GettingReplies;
  setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
  pk: string;
}

export default function NoteModal({eventData,
                                    open, 
                                    setNoteDetailsOpen,
                                    pool,
                                    relays,
                                    followers,
                                    setFollowing,
                                    replies,
                                    setReplies,
                                    setGettingReplies,
                                    setHashtags,
                                    pk}: NoteModalProps) {
  const [metaData, setMetaData] = useState<Record<string, MetaData>>({});
  const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
  const handleClose = () => setNoteDetailsOpen(false);
  
  // Use a media query to check if the device is a mobile or desktop
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!pool) return;
    const getReplies = async () => {
      setGettingReplies(GettingReplies.requestingReplies);
      const replyEvents = await pool.list(relays, [{ "kinds": [1], "#e": [eventData.eventId]}])
      const sanitizedReplyThreadEvents = replyEvents.map((event) => sanitizeEvent(event));
      setReplies(sanitizedReplyThreadEvents);

      // Fetch metadata
      const authorPubkeys: string[] = sanitizedReplyThreadEvents.map(event => event.pubkey);
      const fetchedMetaDataEvents = await pool.list(relays, [{kinds: [0], authors: authorPubkeys}]);

      const metaDataMap: Record<string, MetaData> = {};
      fetchedMetaDataEvents.forEach((event) => {
        metaDataMap[event.pubkey] = JSON.parse(event.content);
      });
      setMetaData(metaDataMap);
      
      // Fetch reactions
      const reactionPubkeys = sanitizedReplyThreadEvents.map(event => event.pubkey);
      const replyEventsIds = sanitizedReplyThreadEvents.map(event => event.id);

      const reactionEvents = await pool.list([...new Set([...relays, ...defaultRelays])], 
        [{ "kinds": [7], "#e": replyEventsIds, "#p": reactionPubkeys}]);
      
      const retrievedReactionObjects: Record<string, ReactionCounts> = {};
      reactionEvents.forEach((event) => {
        const eventTagThatWasLiked = event.tags.filter((tag) => tag[0] === "e");
        eventTagThatWasLiked.forEach((tag) => {
          const isValidEventTagThatWasLiked = tag !== undefined && tag[1] !== undefined && tag[1] !== null;
          if (isValidEventTagThatWasLiked) {
            if (!retrievedReactionObjects[tag[1]]) {
              retrievedReactionObjects[tag[1]] = {upvotes: 1, downvotes: 0};
            }
            if (event.content === "+") {
              retrievedReactionObjects[tag[1]].upvotes++;
            } else if(event.content === "-") {
              retrievedReactionObjects[tag[1]].downvotes++;
            }
          }
        });
      });
      setReactions(retrievedReactionObjects);
      setGettingReplies(GettingReplies.requestComplete);
    }
    getReplies();

  }, [open, pool]);

  return (
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
    <Box sx={{...style, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Box sx={{position: 'absolute', top: 8, right: 8}}>
            <ClearIcon style={{cursor: 'pointer'}} onClick={handleClose} />
        </Box>
        <Box sx={{overflowY: 'auto', width: '100%', maxHeight: isMobile ? "80vh" : "70vh"}}>
            <Stack direction="row" spacing={2} flexDirection="column">
                <Note eventData={eventData}
                    pool={pool} relays={relays}
                    followers={followers}
                    setFollowing={setFollowing}
                    setHashtags={setHashtags}
                    pk={pk}
                    disableReplyIcon={false}
                />

                <Box>
                    {replies.length !== 0 && (
                        <>
                            <SubdirectoryArrowRightIcon />
                            {replies.map((event) => {
                                const fullEventData = setEventData(event, metaData[event.pubkey], reactions[event.id]);
                                return (
                                    <Note 
                                        eventData={fullEventData}
                                        pool={pool}
                                        relays={relays}
                                        followers={followers}
                                        setFollowing={setFollowing}
                                        setHashtags={setHashtags}
                                        pk={pk}
                                        key={event.sig}
                                        disableReplyIcon={false}
                                    />
                                );
                            })}
                        </>
                      )}
                  </Box>
              </Stack>
          </Box>      
      </Box>
    </Modal>
  );
} 
