import { Box } from '@mui/material'
import Note from './Note'
import { FullEventData, MetaData, RelaySetting } from '../nostr/Types';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { useEffect, useRef, useState } from 'react';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { useListEvents } from '../hooks/useListEvents';

type Props = {
    pool: SimplePool | null;
    setPool:  React.Dispatch<React.SetStateAction<SimplePool>>;
    relays: RelaySetting[];
    pk: string;
    sk_decoded: string;
    following: string[]; 
    hideExplicitContent: React.MutableRefObject<boolean>;
    userEvents: Event[];
    replyEvents: Record<string, Event[]>;
    rootEvents: Record<string, Event[]>;
    reactions: Record<string, Event[]>;
    metaData: Record<string, MetaData>;
}

export default function UserNotes({
    pool,
    setPool,
    relays, 
    pk, 
    sk_decoded,  
    following, 
    userEvents,
    replyEvents,
    rootEvents,
    reactions,
    metaData
}: Props) {
    const allRelayUrls = relays.map((r) => r.relayUrl);
    const [fetchEvents, setFetchEvents] = useState(false);



  return (
    <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                        {userEvents && userEvents.map((event) => {
                            
                            return (
                                <Box key={event.sig + Math.random()}>
                                    <Note 
                                        pool={pool} 
                                        relays={relays} 
                                        event={event}
                                        replyEvents={replyEvents}
                                        rootEvents={rootEvents}
                                        fetchEvents={fetchEvents}
                                        reactions={reactions}
                                        metaData={metaData}
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