import { Box, Stack, Tab, Tabs } from '@mui/material';
import { Event, Filter, Kind, nip19, SimplePool } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce';
import HashtagsFilter from '../components/HashtagsFilter';
import Loading from '../components/Loading';
import Note from '../components/Note';
import { defaultRelays } from '../nostr/Relays';
import { FullEventData, MetaData, ReactionCounts } from '../nostr/Types';
import { DiceBears, insertEventIntoDescendingList, sanitizeEvent,} from '../util';
import "./GlobalFeed.css";
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { getFollowers, getReplyThreadEvents, setFollowing } from '../nostr/FeedEvents';


interface Props {
    pool: SimplePool | null,
    relays: string[],
}

function GlobalFeed({pool, relays}: Props) {
    const [eventsImmediate, setEvents] = useState<Event[]>([]);
    const [events] = useDebounce(eventsImmediate, 1500);
    const [metaData, setMetaData] = useState<Record<string,MetaData>>({});
    const metaDataFetched = useRef<Record<string,boolean>>({});
    const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
    const reactionsFetched = useRef<Record<string,boolean>>({});
    const replyThreadFetched = useRef<Record<string,boolean>>({});  
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [tabIndex, setTabIndex] = useState(0);
    const [followers, setFollowers] = useState<string[]>([]);
    const defaultAvatar = DiceBears();
    

    //subscribe to events
    useEffect(() => {
        if (!pool) {
            console.log("pool is null")
            return;
        }
        setEvents([]);
        
        const UserFollowers = async () => {
            const followerPks = await getFollowers(pool, relays, tabIndex);
            if (followerPks){
                setFollowers(followerPks);
            }
        }
        UserFollowers();


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
            if (sanitizedEvent.content !== "") {
                setEvents((prevEvents) => insertEventIntoDescendingList(prevEvents, sanitizedEvent));
            }
        })

        return () => {
            sub.unsub();
        }

    },[pool, hashtags, relays, tabIndex])

    useEffect(() => {
        if (!pool) return;
        
        const eventsToGetReplyThread = events.filter((event) => !replyThreadFetched.current[event.id]);

        const replyThreads = async () => {
            
            const replyThreadEvents = await getReplyThreadEvents(eventsToGetReplyThread, pool, relays);
            if (!replyThreadEvents) return;
            
            setEvents((prevEvents) => {
                let orderedEvents = [...prevEvents];
                
                replyThreadEvents.forEach((event) => {
                    replyThreadFetched.current[event.id] = true;
                    insertEventIntoDescendingList(orderedEvents, event)
                });
                
                return orderedEvents;
            });   
        }

        replyThreads();
    },[events])

    //get reactions
    useEffect(() => {
        if (!pool) return;

        const unprocessedEvents = events.filter((event) => !reactionsFetched.current[event.id]);
        if (unprocessedEvents.length === 0) return;
        
        const eventIds = unprocessedEvents.map((event) => event.id);
        const pubkeys = unprocessedEvents.map((event) => event.pubkey);

        const sub = pool.sub(relays, [{ "kinds": [7], "#e": eventIds, "#p": pubkeys}]);
        
        sub.on("event", (event: Event) => {
            if (!event.tags || reactionsFetched.current[event.id] === true) return;
            reactionsFetched.current[event.id] = true;

            const likedEventTags = event.tags.filter((tag) => tag[0] === "e");
            const likedEventId = likedEventTags[0][1];
            if (!likedEventId) return;

            const reactionObject: ReactionCounts = reactions[likedEventId] ?? {upvotes: 0, downvotes: 0};
            switch (event.content) {
                case "+":
                    reactionObject.upvotes++;
                    break;
                case "-":
                    reactionObject.downvotes++;
                    break;
                default:
                    break;
            }

            setReactions((cur) => ({
                ...cur,
                [likedEventId]: reactionObject,
            }));
        })

        sub.on("eose", () => {
            sub.unsub();
        })
    
    },[pool, events, relays])

    //subscribe to metadata
    useEffect(() => {
        if (!pool) return;

        const pubkeysToFetch = events.filter((event) => metaDataFetched.current[event.pubkey] !== true).map((event) => event.pubkey);
        
        if (pubkeysToFetch.length === 0) return;
        
        const sub = pool.sub(defaultRelays, [{
            kinds: [0],
            authors: pubkeysToFetch,
        }])
        
        sub.on("event", (event: Event) => {
            
            const sanitizedEvent: Event = sanitizeEvent(event);
            metaDataFetched.current[event.pubkey] = true;
            if (sanitizedEvent.content !== "")
            {
                const metaDataParsedSanitized = JSON.parse(sanitizedEvent.content) as MetaData;
                console.log("metaDataParsedSanitized " + metaDataParsedSanitized)
                setMetaData((cur) => ({
                    ...cur,
                    [event.pubkey]: metaDataParsedSanitized,
                }));
            }
        })
        
        sub.on("eose", () => {
            sub.unsub();
        })

        return () => {};
    },[events, pool, hashtags, tabIndex])

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const setFollower = async (pubkey: string) => {
        if (!pool) return;
        const newFollowers = await setFollowing(pubkey, pool, followers, relays)
        if (newFollowers){
            setFollowers(newFollowers);
        }
    }

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
                        name: metaData[event.pubkey]?.name ?? nip19.npubEncode(event.pubkey).slice(0, 10) + "...",
                        picture: metaData[event.pubkey]?.picture ?? defaultAvatar,
                        about: metaData[event.pubkey]?.about ?? "",
                        nip05: metaData[event.pubkey]?.nip05 ?? "",
                    },
                    pubkey: event.pubkey,
                    hashtags: event.tags.filter((tag) => tag[0] === "t").map((tag) => tag[1]),
                    eventId: event.id,
                    sig: event.sig,
                    created_at: event.created_at,
                    tags: event?.tags ?? [],
                    reaction: reactions[event.id] ?? {upvotes: 0, downvotes: 0},
                }
                const referredId =  event.tags.find((tag) => tag[0] === "e" && tag[1] !== "")?.[1];
                const referredEvent = events.find((e) => e.id === referredId);
                
                if (referredEvent) {
                    const referredEventFullData: FullEventData = {
                        content: referredEvent?.content ?? "",
                        user: {
                            name: metaData[referredEvent?.pubkey ?? ""]?.name ?? nip19.npubEncode(referredEvent?.pubkey ?? "").slice(0, 10) + "...",
                            picture: metaData[referredEvent?.pubkey ?? ""]?.picture ?? defaultAvatar,
                            about: metaData[referredEvent?.pubkey ?? ""]?.about ?? "I am Satoshi Nakamoto",
                            nip05: metaData[referredEvent?.pubkey ?? ""]?.nip05 ?? "",
                        },
                        pubkey: referredEvent?.pubkey ?? "",
                        hashtags: referredEvent?.tags.filter((tag) => tag[0] === "t").map((tag) => tag[1]) ?? [],
                        eventId: referredEvent?.id ?? "",
                        sig: referredEvent?.sig ?? "",
                        created_at: referredEvent?.created_at ?? 0,
                        tags: referredEvent?.tags ?? [],
                        reaction: reactions[referredEvent?.id] ?? {upvotes: 0, downvotes: 0},
                    }

                    return (
                        <div key={event.sig}>
                            <div className='referredEvent'>
                                <Note pool={pool} eventData={referredEventFullData} setFollowing={setFollower} followers={followers} />
                            </div>
                            <div className="primaryEventContainer">
                                <Stack direction="row" spacing={2} flexDirection="row">
                                    <SubdirectoryArrowRightIcon />
                                    <Note pool={pool} eventData={fullEventData} setFollowing={setFollower} followers={followers} key={event.sig} />
                                </Stack>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <Note pool={pool} eventData={fullEventData} setFollowing={setFollower} followers={followers} key={event.sig} />
                    )

                }
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
                    onChange={handleTabChange} 
                    centered>
                    <Tab label="Global"/>
                    <Tab label="Followers"/>
                </Tabs>

            </Box>
    </Box>
    )
}

export default GlobalFeed