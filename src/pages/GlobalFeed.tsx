import { Box, Stack, Tab, Tabs } from '@mui/material';
import { Event, Filter, nip19, SimplePool } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce';
import HashtagsFilter from '../components/HashtagsFilter';
import Loading from '../components/Loading';
import Note from '../components/Note';
import { FullEventData, MetaData, ReactionCounts } from '../nostr/Types';
import { DiceBears, insertEventIntoDescendingList, sanitizeEvent,} from '../util';
import "./GlobalFeed.css";
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { getEventOptions, getReactionEvents, getReplyThreadEvents } from '../nostr/FeedEvents';
import { useFollowers } from '../hooks/useFollowers';


type GlobalFeedProps = {
    pool: SimplePool | null;
    relays: string[];
  };
  
  const GlobalFeed: React.FC<GlobalFeedProps> = ({ pool, relays }) => {
    const { followers, setFollowers } = useFollowers({ pool, relays, tabIndex: 0 });
  
    const [eventsImmediate, setEvents] = useState<Event[]>([]);
    const [events] = useDebounce(eventsImmediate, 1500);
    const [metaData, setMetaData] = useState<Record<string,MetaData>>({});
    const metaDataFetched = useRef<Record<string,boolean>>({});
    const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
    const reactionsFetched = useRef<Record<string,boolean>>({});
    const replyThreadFetched = useRef<Record<string,boolean>>({});  
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [tabIndex, setTabIndex] = useState(0);
    const defaultAvatar = DiceBears();

    //subscribe to events
    useEffect(() => {
        if (!pool) {
            console.log("pool is null")
            return;
        }
        setEvents([]);

        const options: Filter = getEventOptions(hashtags, tabIndex, followers);

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

    //get reply threads
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

        const getReactions = async () => {
            const unprocessedEvents = events.filter((event) => !reactionsFetched.current[event.id]);
            if (unprocessedEvents.length === 0) return;

            const reactionEventObjects: Record<string, ReactionCounts> = await getReactionEvents(unprocessedEvents, pool, relays, reactions);
            if (!reactionEventObjects) return;

            // merge existing and new reactions
            setReactions((cur) => ({
                ...cur,
                ...reactionEventObjects,
            }));

            // update reactionsFetched ref
            unprocessedEvents.forEach((event) => {
                reactionsFetched.current[event.id] = true;
            });
        }

        getReactions();

        return () => {};
    },[pool, events, relays])

    //subscribe to metadata
    useEffect(() => {
        if (!pool) return;

        const pubkeysToFetch = events.filter((event) => metaDataFetched.current[event.pubkey] !== true).map((event) => event.pubkey);
        
        if (pubkeysToFetch.length === 0) return;
        
        const sub = pool.sub(relays, [{
            kinds: [0],
            authors: pubkeysToFetch,
        }])
        
        sub.on("event", (event: Event) => {
            
            const sanitizedEvent: Event = sanitizeEvent(event);
            if (sanitizedEvent.content !== "")
            {
                const metaDataParsedSanitized: MetaData = JSON.parse(sanitizedEvent.content) as MetaData;
                console.log("metaDataParsedSanitized " + metaDataParsedSanitized)
                setMetaData((cur) => ({
                    ...cur,
                    [event.pubkey]: metaDataParsedSanitized,
                }));
                metaDataFetched.current[event.pubkey] = true;
            }
        })
        
        sub.on("eose", () => {
            sub.unsub();
        })

        return () => {};
    },[events, pool, relays])

    //global or followers
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    //set follow
    const setFollower = async (pubkey: string) => {
        if (!pool) return;
        const newFollowerArray = followers.includes(pubkey) ? followers.filter((follower) => follower !== pubkey) : [...followers, pubkey];
        await setFollowers(newFollowerArray)
    }

    //set Events
    const setEventData = (event: Event) => {
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
        
        if (!referredEvent) return {fullEventData, referredEventFullData: undefined};

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

        return {fullEventData, referredEventFullData}
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

                const {fullEventData, referredEventFullData} = setEventData(event);

                if (referredEventFullData) {
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