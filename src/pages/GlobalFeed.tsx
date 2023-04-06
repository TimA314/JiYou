import { Box, Divider, Stack, Tab, Tabs } from '@mui/material';
import { Event, EventTemplate, Filter, getEventHash, Kind, nip19, SimplePool } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce';
import HashtagsFilter from '../components/HashtagsFilter';
import Loading from '../components/Loading';
import Note from '../components/Note';
import { defaultRelays } from '../nostr/Relays';
import { FullEventData, MetaData, ReactionCounts } from '../nostr/Types';
import { DiceBears, GetImageFromPost, insertEventIntoDescendingList, sanitizeEvent,} from '../util';
import "./GlobalFeed.css";
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { GetReactions } from '../nostr/Reactions';
import { getFollowers } from '../nostr/FeedEvents';


interface Props {
    pool: SimplePool | null,
    relays: string[],
}

function GlobalFeed({pool, relays}: Props) {
    const [eventsImmediate, setEvents] = useState<Event[]>([]);
    const [events] = useDebounce(eventsImmediate, 1000);
    const [metaData, setMetaData] = useState<Record<string,MetaData>>({});
    const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
    const metaDataFetched = useRef<Record<string,boolean>>({});
    const reactionsFetched = useRef<Record<string,boolean>>({});
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
        
        const UserFollowers = async (pool: SimplePool, relays: string[], tabIndex: number) => {
            const followerPks = await getFollowers(pool, relays, tabIndex);
            if (followerPks){
                setFollowers(followerPks);
            }
        }
        UserFollowers(pool, relays, tabIndex);

        const getReplyThread = async (event: Event) => {
            if (!event.tags) return;
            const replyThreadId = event.tags.filter((tag) => tag[0] === "e");
            if (!replyThreadId[0][1]) return;
            const replyThreadEvent: Event[] = await pool.list(relays, [{kinds: [Kind.Text], ids: [replyThreadId[0][1]], limit: 1 }])
            if (!replyThreadEvent[0]) return;
            const sanitizedEvent: Event = sanitizeEvent(replyThreadEvent[0]);
            setEvents((prevEvents) => insertEventIntoDescendingList(prevEvents, sanitizedEvent))
        }

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
            
            getReplyThread(sanitizedEvent);
            setEvents((prevEvents) => insertEventIntoDescendingList(prevEvents, sanitizedEvent))

        })

        return () => {
            sub.unsub();
        }

    },[pool, hashtags, relays, tabIndex])

    //get reactions
    useEffect(() => {
        if (!pool) return;
    
        const unprocessedEvents = events.filter((event) => !reactionsFetched.current[event.id]);
        if (unprocessedEvents.length === 0) return;
        
        const getReactions = async () => {
            const reactionObject: Record<string, ReactionCounts> = await GetReactions(pool, unprocessedEvents, relays, reactionsFetched.current);
            setReactions((prevReactions) => {
                const newReactions = { ...prevReactions };
                Object.keys(reactionObject).forEach((eventId) => {
                    if (!reactionsFetched.current[eventId]) {
                        newReactions[eventId] = reactionObject[eventId];
                    }
                });
                return newReactions;
            });
        }
    
        getReactions();
    
    },[pool, events, relays, reactionsFetched])

    //subscribe to metadata
    useEffect(() => {
        if (!pool) return;

        const pubkeysToFetch = events
        .filter((event) => metaDataFetched.current[event.pubkey] !== true)
        .map((event) => event.pubkey);
        
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
    
    const setFollowing = async (followerPubkey: string) => {
        if (!pool) {
            alert("pool is null")
            return;
        }

        let unFollow = false;
        if (followers.includes(followerPubkey)) {
            unFollow = true;
        }

        console.log("setIsFollowing " + followerPubkey)
        if (!window.nostr) {
            alert("You need to install a Nostr extension to provide your pubkey.")
            return;
        }
        try {
            const pubkey = await window.nostr.getPublicKey();
            const userFollowerEvent: Event[] = await pool.list(defaultRelays, [{kinds: [3], authors: [pubkey], limit: 1 }])
            console.log("user follower event " + userFollowerEvent)
            
            let newTags: string[][] = [];
            if (userFollowerEvent[0]) {
                newTags = [...userFollowerEvent[0].tags];
            }
            if (unFollow) {
                newTags = newTags.filter((tag) => tag[1] !== followerPubkey);
            } else {
                newTags.push(["p", followerPubkey]);
            }

            console.log(newTags)
            const _baseEvent = {
                kind: Kind.Contacts,
                content: userFollowerEvent[0]?.content ?? "",
                created_at: Math.floor(Date.now() / 1000),
                tags: newTags,
            } as EventTemplate

            const sig = (await window.nostr.signEvent(_baseEvent)).sig;

            const newEvent: Event = {
                ..._baseEvent,
                id: getEventHash({..._baseEvent, pubkey}),
                sig,
                pubkey,
            }

            const pubs = pool.publish(relays, newEvent)
            
            pubs.on("ok", () => {
                alert("Posted to relays")
                console.log("Posted to relays")
            })
    
            pubs.on("failed", (error: string) => {
            alert("Failed to post to relays" + error)
            })

            setFollowers(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]));
        } catch (error) {
            alert(error)
            console.log(error);
        }
    }

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
                    reaction: reactions[event.id]
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
                        reaction: reactions[referredEvent?.id]
                    }

                    return (
                        <div key={event.sig}>
                            <div className='referredEvent'>
                                <Note pool={pool} eventData={referredEventFullData} setFollowing={setFollowing} followers={followers} />
                            </div>
                            <div className="primaryEventContainer">
                                <Stack direction="row" spacing={2} flexDirection="row">
                                    <SubdirectoryArrowRightIcon />
                                    <Note pool={pool} eventData={fullEventData} setFollowing={setFollowing} followers={followers} key={event.sig} />
                                </Stack>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <Note pool={pool} eventData={fullEventData} setFollowing={setFollowing} followers={followers} key={event.sig} />
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