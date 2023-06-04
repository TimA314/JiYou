import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Event, EventTemplate, SimplePool } from 'nostr-tools';
import { FullEventData, MetaData, ReactionCounts } from '../nostr/Types';
import Note from './Note';
import { Stack } from '@mui/material';
import SouthIcon from '@mui/icons-material/South';
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
  width: "95%",
  maxWidth: "1000px",
  boxShadow: 24,
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
  setReplyCount: (count: number) => void;
  setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
  pk: string;
  setEventToSign: React.Dispatch<React.SetStateAction<EventTemplate | null>>;
  setSignEventOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hashTags: string[];
}

export default function NoteModal({eventData,
                                    open, 
                                    setNoteDetailsOpen,
                                    pool,
                                    relays,
                                    followers,
                                    setFollowing,
                                    setReplyCount,
                                    setHashtags,
                                    pk,
                                    setEventToSign,
                                    setSignEventOpen,
                                    hashTags,
                                  }: NoteModalProps) {
  const [metaData, setMetaData] = useState<Record<string, MetaData>>({});
  const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
  const [rootEvents, setRootEvents] = useState<Event[]>([]);
  const [replyEvents, setReplyEvents] = useState<Event[]>([]);
  const [gettingThread, setGettingThread] = useState(true);
  const handleClose = () => setNoteDetailsOpen(false);
  
  // Use a media query to check if the device is a mobile or desktop
  const theme = useTheme();

  useEffect(() => {
    if (!pool) return;
    const getReplies = async () => {

      // Fetch replies
      const replyEvents = await pool.list(relays, [{ "kinds": [1], "#e": [eventData.eventId]}])
      const sanitizedReplyThreadEvents = replyEvents.map((event) => sanitizeEvent(event));
      
      //Fetch root events
      const eventTags= eventData.tags.filter((t) => t[0] === "e" && t[1] && t[1] !== eventData.eventId);
      let sanitizedRootEvents: Event[] = [];
      if (eventTags && eventTags.length > 0) {
        const recommendedRelays = [...new Set([...relays, ...eventTags.filter((t) => t[2] && t[2].startsWith("wss")).map((t) => t[2])])];
        const rootEvents = await pool.list(recommendedRelays, [{ "kinds": [1], ids: eventTags.map((t) => t[1])}]);
        sanitizedRootEvents = rootEvents.map((event) => sanitizeEvent(event));
      }

      // Fetch metadata
      const mappedReplyKeys = sanitizedReplyThreadEvents.map(reply => reply.pubkey);
      const mappedRootKeys = sanitizedRootEvents.map(root => root.pubkey);
      const authorPubkeys: string[] = [...mappedReplyKeys, ...mappedRootKeys, eventData.pubkey];
      const fetchedMetaDataEvents = await pool.list(relays, [{kinds: [0], authors: authorPubkeys}]);

      const metaDataMap: Record<string, MetaData> = {};
      fetchedMetaDataEvents.forEach((event) => {
        metaDataMap[event.pubkey] = JSON.parse(event.content);
      });
      
      // Fetch reactions
      const reactionPubkeys = [...sanitizedReplyThreadEvents.map(event => event.pubkey), ...sanitizedRootEvents.map(event => event.pubkey)];
      const replyEventsIds = [...sanitizedReplyThreadEvents.map(event => event.id), ...sanitizedRootEvents.map(event => event.id)];

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

      setRootEvents(sanitizedRootEvents);
      setReplyEvents(sanitizedReplyThreadEvents);
      setReplyCount(sanitizedReplyThreadEvents.length);
      setMetaData(metaDataMap);
      setReactions(retrievedReactionObjects);
      setGettingThread(false);
    }

    if(gettingThread){
      getReplies();
    }

  }, [pool]);

  return (
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
    <Box sx={{...style, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Box sx={{position: 'absolute', top: 8, right: 1}}>
            <ClearIcon style={{cursor: 'pointer'}} onClick={handleClose} />
        </Box>
        <Box sx={{overflowY: 'auto', width: '98%', maxHeight: "80vh"}}>
            <Stack direction="row" spacing={0} flexDirection="column">

                <Box>
                    {rootEvents.length > 0 && (
                        <>
                                {rootEvents.map((rootEvent) => {
                                    const fullRootEventData = setEventData(rootEvent, metaData[rootEvent.pubkey], reactions[rootEvent.id]);
                                    return (
                                        <Box 
                                          key={rootEvent.sig + Math.random()}                                        
                                          sx={{ 
                                            marginBottom: "10px", 
                                            justifyContent: "center", 
                                            flexDirection: "row", 
                                            alignItems: "center" 
                                            }}>
                                            <Note
                                                eventData={fullRootEventData}
                                                pool={pool}
                                                relays={relays}
                                                followers={followers}
                                                setFollowing={setFollowing}
                                                setHashtags={setHashtags}
                                                pk={pk}
                                                disableReplyIcon={false}
                                                gettingThread={gettingThread}
                                                setSignEventOpen={setSignEventOpen}
                                                setEventToSign={setEventToSign}
                                                hashTags={hashTags}
                                            />
                                            <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                                              <SouthIcon />
                                            </Box>
                                        </Box>
                                    )})}
                        </>
                    )}
                </Box>

                <Box>
                    <Note eventData={eventData}
                        pool={pool} relays={relays}
                        followers={followers}
                        setFollowing={setFollowing}
                        setHashtags={setHashtags}
                        pk={pk}
                        disableReplyIcon={false}
                        setSignEventOpen={setSignEventOpen}
                        setEventToSign={setEventToSign}
                        hashTags={hashTags}
                        key={eventData.sig + Math.random()}
                        />
                </Box>

                <Box>
                    {replyEvents.length > 0 && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <SouthIcon />
                          </Box>
                          {replyEvents.map((replyEvent) => {
                              const fullEventData = setEventData(replyEvent, metaData[replyEvent.pubkey], reactions[replyEvent.id]);
                              return (
                                  <Note 
                                      eventData={fullEventData}
                                      pool={pool}
                                      relays={relays}
                                      followers={followers}
                                      setFollowing={setFollowing}
                                      setHashtags={setHashtags}
                                      pk={pk}
                                      key={replyEvent.sig + Math.random()}
                                      disableReplyIcon={false}
                                      setSignEventOpen={setSignEventOpen}
                                      setEventToSign={setEventToSign}
                                      hashTags={hashTags}
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
