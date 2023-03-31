import { Box } from '@mui/material';
import { Event, Filter, SimplePool, validateEvent } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce';
import HashtagsFilter from '../components/HashtagsFilter';
import Note from '../components/Note';
import { defaultRelays } from '../nostr/Relays';
import { FullEventData, MetaData } from '../nostr/Types';
import { DiceBears, insertEventIntoDescendingList, sanitizeEvent, sanitizeString } from '../util';

interface Props {
    pool: SimplePool | null;
}

function GlobalFeed({pool}: Props) {
    const [eventsImmediate, setEvents] = useState<Event[]>([]);
    const [events] = useDebounce(eventsImmediate, 1500);
    const [metaData, setMetaData] = useState<Record<string,MetaData>>({});
    const metaDataFetched = useRef<Record<string,boolean>>({}); //used to prevent duplicate fetches
    const [hashtags, setHashtags] = useState<string[]>([]);
    const defaultAvatar = DiceBears();

    //subscribe to events
    useEffect(() => {
        if (!pool) return;
        console.log("hashtags: " + hashtags)
        setEvents([]);
        
        const sub = pool.sub(defaultRelays, [{
            kinds: [1],
            limit: 50,
            "#t": hashtags
        }])
        
        sub.on("event", (event: Event) => { 
            const sanitizedEvent: Event = sanitizeEvent(event);
            setEvents((prevEvents) => insertEventIntoDescendingList(prevEvents, sanitizedEvent))
        })

        return () => {
            sub.unsub();
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[hashtags, pool])


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
            {events
            .filter((event, index, self) => {
                return index === self.findIndex((e) => (
                e.sig === event.sig
                ))
            })
            .map((event) => {
                //console.log("event: " + JSON.stringify(event), "metaData: " + metaData[event.pubkey])
                const hashtagsFromEvent = event.tags.filter((tag) => tag[0] === "t").map((tag) => tag[1]);
                const fullEventData: FullEventData = {
                    content: event.content,
                    user: {
                        name: metaData[event.pubkey]?.name ?? "Satoshi",
                        picture: metaData[event.pubkey]?.picture ?? defaultAvatar,
                        about: metaData[event.pubkey]?.about ?? "I am Satoshi Nakamoto",
                        nip05: metaData[event.pubkey]?.nip05 ?? "",
                        pubKey: event.pubkey,
                    },
                    hashtags: hashtagsFromEvent,
                    eventId: event.id,
                    sig: event.sig,
                    isFollowing: false,
                    created_at: event.created_at
                }
                return (
                    <Note eventData={fullEventData} key={sanitizeString(event.sig)}/>
                )
            })}
        </Box>
    )
}

export default GlobalFeed