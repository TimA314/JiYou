import { Box } from '@mui/material'
import Note from './Note'
import { FullEventData, RelaySetting } from '../nostr/Types';
import { SimplePool } from 'nostr-tools';
import { fetchNostrEvent } from '../nostr/FetchEvent';
import { useEffect, useState } from 'react';

type Props = {
    pool: SimplePool | null;
    relays: RelaySetting[];
    pk: string;
    sk_decoded: string;
    fetchEvents: boolean;
    following: string[]; 
    setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
    userNotes: FullEventData[];
    hideExplicitContent: React.MutableRefObject<boolean>;
}

export default function UserNotes({
    pool, 
    relays, 
    pk, 
    sk_decoded, 
    fetchEvents, 
    following, 
    setFetchEvents, 
    userNotes,
    hideExplicitContent
}: Props) {
    const [replyEvents, setReplyEvents] = useState<FullEventData[]>([]);
    const [rootEvents, setRootEvents] = useState<FullEventData[]>([]);
    const allRelayUrls = relays.map((r) => r.relayUrl);

    const fetchThreadEvents = async (eventDataSet: FullEventData[]) => {
        if (!pool) return;
    
        //Reply Events
        const replyFilter = { "kinds": [1], "#e": eventDataSet.map((e) => e.eventId)};
    
        const fetchedReplyEvents = await fetchNostrEvent(pool, allRelayUrls, allRelayUrls, replyFilter, hideExplicitContent.current)
        const newReplyEvents = [...new Set([...replyEvents, ...fetchedReplyEvents])];
        setReplyEvents(newReplyEvents);
    
        //Root Events
        const rootEventIdsToFetch: string[] = [];
        const relaysToFetchFrom: string[] = [];
    
        eventDataSet.forEach((f) => {
          const eventIdsFromTags = f.tags.filter((t) => t[0] === "e" && t[1] && t[1] !== f.eventId).map((t) => t[1]);
          const recommendedEventRelays = f.tags.filter((t) => t[2] && t[2].startsWith("wss")).map((t) => t[2]);
    
          rootEventIdsToFetch.push(...eventIdsFromTags);
          relaysToFetchFrom.push(...recommendedEventRelays);
        });
    
        const filteredRootEventsToFetch = [...new Set(rootEventIdsToFetch)].filter((r) => !rootEvents.some((e) => e.eventId === r));
        const rootFilter = { "kinds": [1], ids: filteredRootEventsToFetch};
    
        const fetchedRootEvents = await fetchNostrEvent(pool, [...new Set([...allRelayUrls, ...relaysToFetchFrom])], allRelayUrls, rootFilter, hideExplicitContent.current)
        const newRootEvents = [...new Set([...rootEvents, ...fetchedRootEvents])];
        setRootEvents(newRootEvents);
        console.log('Root Events: ', newRootEvents.length, " Reply Events: ", newReplyEvents.length)
      }

    useEffect(() => {
        fetchThreadEvents(userNotes);
    }, [userNotes])

  return (
    <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                        {userNotes && userNotes.map((event) => {
                            const rootEventIds = event.tags.filter((t) => t[0] === "e" && t[1] && t[1] !== event.eventId).map((t) => t[1]);
                            const eventRootNotes: FullEventData[] = rootEvents.filter((e) => rootEventIds.includes(e.eventId));
                            const eventReplyNotes: FullEventData[] = replyEvents.filter((r) => r.tags.some((t) => t[0] === "e" && t[1] && t[1] === event.eventId));
                            
                            return (
                                <Box key={event.sig + Math.random()}>
                                    <Note 
                                        pool={pool} 
                                        relays={relays} 
                                        eventData={event}
                                        replyEvents={eventReplyNotes}
                                        rootEvents={eventRootNotes}
                                        fetchEvents={fetchEvents}
                                        setFetchEvents={setFetchEvents}
                                        updateFollowing={() => {}} 
                                        following={following} 
                                        setHashtags={() => {}} 
                                        pk={pk}
                                        sk_decoded={sk_decoded}
                                        hashTags={[]}
                                        />
                                </Box>
                            )
                        })}
                    </Box>
  )
}