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
import { setEventData } from '../utils/eventUtils';



type GlobalFeedProps = {
    pool: SimplePool | null;
    relays: string[];
  };
  
  const GlobalFeed: React.FC<GlobalFeedProps> = ({ pool, relays }) => {
    const { followers, setFollowing } = useFollowers({pool, relays});
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [tabIndex, setTabIndex] = useState(0);
    const { events, setEvents, reactions, metaData } = useListEvents({ pool, relays, tabIndex, followers, hashtags});


    //global or followers
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        setEvents([]);
    };

    const setFollowers = (pubkey: string) => {
        setFollowing(pubkey, pool, relays);
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
                const fullEventData = setEventData(event, metaData[event.pubkey], reactions[event.id]);
                return (
                    <Note pool={pool} relays={relays} eventData={fullEventData} setFollowing={setFollowers} followers={followers} setHashtags={setHashtags} key={event.sig} />
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