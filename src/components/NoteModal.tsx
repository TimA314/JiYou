import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Event, SimplePool } from 'nostr-tools';
import { FullEventData, MetaData, ReactionCounts, RelaySetting } from '../nostr/Types';
import Note from './Note';
import { Stack } from '@mui/material';
import SouthIcon from '@mui/icons-material/South';
import { useContext, useEffect, useRef, useState } from 'react';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { setEventData } from '../utils/eventUtils';
import ClearIcon from '@mui/icons-material/Clear';
import { ThemeContext } from '../theme/ThemeContext';
import CircularProgress from '@mui/material/CircularProgress';

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
  open: boolean;
  setNoteDetailsOpen: (open: boolean) => void;
  pool: SimplePool | null;
  relays: RelaySetting[];
  following: string[];
  updateFollowing: (pubkey: string) => void;
  setReplyCount: (count: number) => void;
  setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
  pk: string;
  hashTags: string[];
  imagesOnlyMode?: React.MutableRefObject<boolean>;
}

export default function NoteModal({
  eventData,
  fetchEvents,
  setFetchEvents,
  open, 
  setNoteDetailsOpen,
  pool,
  relays,
  following,
  updateFollowing,
  setReplyCount,
  setHashtags,
  pk,
  hashTags,
  imagesOnlyMode
}: NoteModalProps) {

  const [rootEvents, setRootEvents] = useState<FullEventData[]>([]);
  const [replyEvents, setReplyEvents] = useState<FullEventData[]>([]);
  const [gettingThread, setGettingThread] = useState(true);
  const handleClose = () => setNoteDetailsOpen(false);
  const { themeColors } = useContext(ThemeContext);

  const allRelayUrls = relays.map((r) => r.relayUrl);

  const getReplies = async () => {
    if (!pool) {
      console.log("No pool")
      return;
    }
    console.log("Getting thread")
    setGettingThread(true);
    
    // Fetch replies
    const replyEvents = await pool.list(allRelayUrls, [{ "kinds": [1], "#e": [eventData.eventId]}])
    const sanitizedReplyThreadEvents = replyEvents.map((event) => sanitizeEvent(event));
    console.log(sanitizedReplyThreadEvents.length + " replies fetched")

    //Fetch root events
    const eventTags= eventData.tags.filter((t) => t[0] === "e" && t[1] && t[1] !== eventData.eventId);
    let sanitizedRootEvents: Event[] = [];
    let recommendedRelays = allRelayUrls;
    if (eventTags && eventTags.length > 0) {
      recommendedRelays = [...new Set([...recommendedRelays, ...eventTags.filter((t) => t[2] && t[2].startsWith("wss")).map((t) => t[2])])];
      const rootEvents = await pool.list(recommendedRelays, [{ "kinds": [1], ids: eventTags.map((t) => t[1])}]);
      sanitizedRootEvents = rootEvents.map((event) => sanitizeEvent(event));
    }
    console.log(sanitizedRootEvents.length + " root events fetched")

    const mappedReplyKeys = sanitizedReplyThreadEvents.map(reply => reply.pubkey);
    const mappedRootKeys = sanitizedRootEvents.map(root => root.pubkey);
    const authorPubkeys: string[] = [...new Set([...mappedReplyKeys, ...mappedRootKeys, eventData.pubkey])];

    // Fetch metadata
    const fetchedMetaDataEvents = await pool.list(recommendedRelays, [{kinds: [0], authors: authorPubkeys}]);

    const metaDataMap: Record<string, MetaData> = {};
    fetchedMetaDataEvents.forEach((event) => {
      metaDataMap[event.pubkey] = JSON.parse(event.content);
    });
    
    // Fetch reactions
    const replyEventsIds = [...new Set([...sanitizedReplyThreadEvents.map(event => event.id), ...sanitizedRootEvents.map(event => event.id)])];

    const reactionEvents = await pool.list(recommendedRelays, [{ "kinds": [7], "#e": replyEventsIds, "#p": authorPubkeys}]);
    
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

    const rootEventDataSet = sanitizedRootEvents.map((e) => setEventData(e, metaDataMap[e.pubkey], retrievedReactionObjects[e.id]));
    const replyEventDataSet = sanitizedReplyThreadEvents.map((e) => setEventData(e, metaDataMap[e.pubkey], retrievedReactionObjects[e.id]));
    
    setRootEvents(rootEventDataSet);
    setReplyEvents(replyEventDataSet);
    setReplyCount(sanitizedReplyThreadEvents.length);
    setGettingThread(false);
  }
  useEffect(() => {
    if (!pool || !open || !gettingThread) return;
    console.log("open " + open)
    getReplies();

  }, [open]);

  const getThread = () => {
    if (gettingThread) {
      return (
        <Box sx={{height: 'auto', padding: 'auto'}}>
        <Note eventData={eventData}
            fetchEvents={fetchEvents}
            setFetchEvents={setFetchEvents}
            pool={pool} relays={relays}
            following={following}
            updateFollowing={updateFollowing}
            setHashtags={setHashtags}
            pk={pk}
            disableReplyIcon={false}
            hashTags={hashTags}
            key={eventData.sig + Math.random()}
            imagesOnlyMode={imagesOnlyMode}
            isInModal={true}
            />
        <Box sx={{ display: 'flex', justifyContent: "center", alignItems: 'center', margin: '10px' }}>
          <CircularProgress sx={{color: themeColors.primary}}/>
        </Box>
      </Box>
      )
    } else {
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
                        pool={pool}
                        relays={relays}
                        fetchEvents={fetchEvents}
                        setFetchEvents={setFetchEvents}
                        following={following}
                        updateFollowing={updateFollowing}
                        setHashtags={setHashtags}
                        pk={pk}
                        disableReplyIcon={false}
                        gettingThread={gettingThread}
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
              <Note eventData={eventData}
                  fetchEvents={fetchEvents}
                  setFetchEvents={setFetchEvents}
                  pool={pool} relays={relays}
                  following={following}
                  updateFollowing={updateFollowing}
                  setHashtags={setHashtags}
                  pk={pk}
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
                      pool={pool}
                      relays={relays}
                      fetchEvents={fetchEvents}
                      setFetchEvents={setFetchEvents}
                      following={following}
                      updateFollowing={updateFollowing}
                      setHashtags={setHashtags}
                      pk={pk}
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
