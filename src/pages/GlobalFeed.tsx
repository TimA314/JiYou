import { Box, Stack, Tab, Tabs } from '@mui/material';
import { Event, Filter, nip19, SimplePool } from 'nostr-tools'
import { useState } from 'react'
import HashtagsFilter from '../components/HashtagsFilter';
import Loading from '../components/Loading';
import Note from '../components/Note';
import { FullEventData } from '../nostr/Types';
import "./GlobalFeed.css";
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { getEventOptions } from '../nostr/FeedEvents';
import { useFollowers } from '../hooks/useFollowers';
import { DiceBears } from '../utils/miscUtils';
import { useListEvents } from '../hooks/useListEvents';



type GlobalFeedProps = {
    pool: SimplePool | null;
    relays: string[];
  };
  
  const GlobalFeed: React.FC<GlobalFeedProps> = ({ pool, relays }) => {
    const { followers, setFollowing } = useFollowers({pool, relays});
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [tabIndex, setTabIndex] = useState(0);
    const { events, setEvents, reactions, metaData } = useListEvents({ pool, relays, tabIndex, followers, hashtags});
    const defaultAvatar = DiceBears();


    //global or followers
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        setEvents([]);
    };

    const setFollowers = (pubkey: string) => {
        setFollowing(pubkey, pool, relays);
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

    return (
        <Box sx={{marginTop: "52px"}}>

            <HashtagsFilter hashtags={hashtags} setHashtags={setHashtags} />

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
                                <Note pool={pool} eventData={referredEventFullData} setFollowing={setFollowers} followers={followers} />
                            </div>
                            <div className="primaryEventContainer">
                                <Stack direction="row" spacing={2} flexDirection="row">
                                    <SubdirectoryArrowRightIcon />
                                    <Note pool={pool} eventData={fullEventData} setFollowing={setFollowers} followers={followers} key={event.sig} />
                                </Stack>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <Note pool={pool} eventData={fullEventData} setFollowing={setFollowers} followers={followers} key={event.sig} />
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