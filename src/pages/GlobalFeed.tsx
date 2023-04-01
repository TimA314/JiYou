import { Box, Tab, Tabs } from '@mui/material';
import { Event, Filter, Kind, SimplePool, validateEvent } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce';
import HashtagsFilter from '../components/HashtagsFilter';
import Loading from '../components/Loading';
import Note from '../components/Note';
import { defaultRelays } from '../nostr/Relays';
import { FullEventData, MetaData } from '../nostr/Types';
import { DiceBears, insertEventIntoDescendingList, sanitizeEvent,} from '../util';
import * as secp from "@noble/secp256k1";

interface Props {
    pool: SimplePool | null,
    relays: string[],
}

function GlobalFeed({pool, relays}: Props) {
    const [eventsImmediate, setEvents] = useState<Event[]>([]);
    const [events] = useDebounce(eventsImmediate, 1000);
    const [metaData, setMetaData] = useState<Record<string,MetaData>>({});
    const metaDataFetched = useRef<Record<string,boolean>>({}); //used to prevent duplicate fetches
    const [hashtags, setHashtags] = useState<string[]>([]);
    const defaultAvatar = DiceBears();
    const [tabIndex, setTabIndex] = useState(0);
    const [followers, setFollowers] = useState<string[]>([]);

    //subscribe to events
    useEffect(() => {
        if (!pool) {
            console.log("pool is null")
            return;
        }
        setEvents([]);

        const getFollowers = async () => {

            if (!window.nostr) {
                alert("You need to install a Nostr extension to provide your pubkey.")
                return [];
            }
            try {
                const pk = await window.nostr.getPublicKey();
                
                const userFollowerEvent: Event[] = await pool.list(relays, [{kinds: [3], authors: [pk], limit: 1 }])
                let followerPks: string[] = [];
                if (!userFollowerEvent[0] || !userFollowerEvent[0].tags) return [];
                
                const followerArray: string[][] = userFollowerEvent[0].tags.filter((tag) => tag[0] === "p");
                for(let i=0; i<followerArray.length;i++){
                    if(secp.utils.isValidPrivateKey(followerArray[i][1])){
                        followerPks.push(followerArray[i][1]);
                        console.log("followerArrayItem " + followerArray[i][1])
                    }
                }
                setFollowers(followerPks);
            } catch (error) {
                alert(error)
                console.log(error);
            }
        }

        getFollowers();
        
        console.log("hashtags: " + hashtags)

        let options: Filter = {
            kinds: [Kind.Text],
            limit: 100,
            since: Math.floor((Date.now() / 1000) - (5 * 24 * 60 * 60)) //5 days ago
        }
        
        switch (tabIndex) {
            case 0: //Global
                if(hashtags.length > 0) {
                    options["#t"] = hashtags;
                }
                break;
            case 1: //Followers
                if(hashtags.length > 0) {
                    options["#t"] = hashtags;
                }
                if(followers.length > 0){
                    options.authors = followers;
                }
                break;
            default:
                break;
        }

        const sub = pool.sub(relays, [options]);
        
        sub.on("event", (event: Event) => { 
            const sanitizedEvent: Event = sanitizeEvent(event);
            setEvents((prevEvents) => insertEventIntoDescendingList(prevEvents, sanitizedEvent))
        })

        return () => {
            sub.unsub();
        }


    },[pool, hashtags, relays, tabIndex])


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
                const metaDataParsedSanitized = JSON.parse(sanitizedEvent.content) as MetaData;
                
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
    },[events, pool, hashtags, tabIndex])
    
    
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
      };

      
      //render
    if (!pool) return null;
    return (
        <Box sx={{marginTop: "52px"}}>

            <HashtagsFilter hashtags={hashtags} onChange={setHashtags} />

            {events.length === 0 && <Box sx={{textAlign: "center"}}><Loading /></Box>}

            {events.filter(
                (e, i, arr) => arr.findIndex(t => t.id === e.id) === i //remove duplicates
            )
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
            <Box sx={{
                    bgcolor: 'background.paper',
                    position: "fixed",
                    bottom: 50,
                    left: 0,
                    right: 0,
                }}
                >
                
                <Tabs 
                    value={tabIndex} 
                    onChange={handleChange} 
                    centered>
                    <Tab label="Global"/>
                    <Tab label="Followers"/>
                </Tabs>

            </Box>
    </Box>
    )
}

export default GlobalFeed