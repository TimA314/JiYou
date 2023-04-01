import { Box } from '@mui/material';
import { Event, Filter, Kind, SimplePool, validateEvent } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce';
import HashtagsFilter from '../components/HashtagsFilter';
import Loading from '../components/Loading';
import Note from '../components/Note';
import { defaultRelays } from '../nostr/Relays';
import { FullEventData, MetaData } from '../nostr/Types';
import { DiceBears, insertEventIntoDescendingList, sanitizeEvent, sanitizeString } from '../util';

interface Props {
    pool: SimplePool | null,
    relays: string[],
}

function GlobalFeed({pool, relays}: Props) {
    const [eventsImmediate, setEvents] = useState<Event[]>([]);
    const [events] = useDebounce(eventsImmediate, 1500);
    const [metaData, setMetaData] = useState<Record<string,MetaData>>({});
    const metaDataFetched = useRef<Record<string,boolean>>({}); //used to prevent duplicate fetches
    const [hashtags, setHashtags] = useState<string[]>([]);
    const defaultAvatar = DiceBears();

    //subscribe to events
    useEffect(() => {
        if (!pool) {
            console.log("pool is null")
            return;
        }

        console.log("hashtags: " + hashtags)
        
        const optionsWithHashtags: Filter = {
            kinds: [Kind.Text],
            limit: 100,
            "#t": hashtags
        }

        const options: Filter = {
            kinds: [Kind.Text],
            limit: 100,
        }

        setEvents([]);
        const sub = pool.sub(relays, [hashtags.length > 0 ? optionsWithHashtags : options])
        
        sub.on("event", (event: Event) => { 
            console.log("event: " + JSON.stringify(event));
            const sanitizedEvent: Event = sanitizeEvent(event);
            console.log("sanitizedEvent: " + JSON.stringify(sanitizedEvent));
            setEvents((prevEvents) => insertEventIntoDescendingList(prevEvents, sanitizedEvent))
        })

        return () => {
            sub.unsub();
        }


    },[pool, hashtags, relays])


    //subscribe to metadata
    useEffect(() => {
        if (!pool) return;

        const pubkeysToFetch = events
        .filter((event) => metaDataFetched.current[event.pubkey] !== true)
        .map((event) => event.pubkey);
  
        pubkeysToFetch.forEach(
            (pubkey) => (metaDataFetched.current[pubkey] = true)
        );

        const sub = pool.sub(defaultRelays, [{
            kinds: [0],
            authors: pubkeysToFetch,
        }])

        sub.on("event", (event: Event) => {
            const sanitizedEvent: Event = sanitizeEvent(event);
            if (sanitizedEvent.content !== "")
            {
                
                
                console.log("sanitized:" + validateEvent(sanitizeEvent(event)))
                const metaDataParsedSanitized = JSON.parse(sanitizedEvent.content) as MetaData;
                
                console.log("metaDataParsedSanitized: " + JSON.stringify(metaDataParsedSanitized))
                
                setMetaData((cur) => ({
                    ...cur,
                    [event.pubkey]: metaDataParsedSanitized,
                }));
            }
        })
        
        sub.on("eose", () => {
            console.log("eose")
            sub.unsub();
        })

        return () => {};
    },[events, pool])

    if (!pool) return null;

    //render
    return (
        <Box sx={{marginTop: "52px"}}>
            <HashtagsFilter hashtags={hashtags} onChange={setHashtags} />
            {events.length === 0 && <Box sx={{textAlign: "center"}}><Loading /></Box>}
            {events
            .map((event) => {
                const fullEventData: FullEventData = {
                    content: event.content,
                    user: {
                        name: metaData[event.pubkey]?.name ?? "Satoshi",
                        picture: metaData[event.pubkey]?.picture ?? defaultAvatar,
                        about: metaData[event.pubkey]?.about ?? "I am Satoshi Nakamoto",
                        nip05: metaData[event.pubkey]?.nip05 ?? "",
                        pubKey: event.pubkey,
                    },
                    hashtags: event.tags.filter((tag) => tag[0] === "t").map((tag) => tag[1]),
                    eventId: event.id,
                    sig: event.sig,
                    isFollowing: false,
                    created_at: event.created_at
                }
                return (
                    <Note pool={pool} eventData={fullEventData} key={event.sig}/>
                )
            })}
        </Box>
    )
}

export default GlobalFeed