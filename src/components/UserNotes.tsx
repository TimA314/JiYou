import { Box, CircularProgress, Typography } from '@mui/material'
import Note from './Note'
import { ThemeContext } from '../theme/ThemeContext';
import { useContext, useEffect, useState } from 'react';
import { FullEventData, RelaySetting } from '../nostr/Types';
import { fetchNostrEvent } from '../nostr/FetchEvent';
import { SimplePool } from 'nostr-tools';

type Props = {
    pool: SimplePool | null;
    relays: RelaySetting[];
    pk: string;
    fetchEvents: boolean;
    following: string[]; 
    setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UserNotes({pool, relays, pk, fetchEvents, following, setFetchEvents}: Props) {
    const { themeColors } = useContext(ThemeContext);
    const [userNotes, setUserNotes] = useState<FullEventData[]>([]);
    const [userEventsFetched, setUserEventsFetched] = useState<boolean>(false);
    const allRelayUrls = relays.map((r) => r.relayUrl);

    const getUserNotes = async () => {
        if (!pool) return;
        setUserNotes([]);
        const filter = {kinds: [1], authors: [pk] };
        const notes = await fetchNostrEvent(pool, allRelayUrls,allRelayUrls, filter, false)
        setUserNotes(notes);
        setUserEventsFetched(true);
    }

    useEffect(() => {
        setUserEventsFetched(false);
        getUserNotes()
    }, [pk, relays])

  return (
    <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                        <Box sx={{}}>
                            <Typography variant="h6" sx={{ color: themeColors.textColor }}>
                                User Notes
                            </Typography>
                        </Box>
                        {userNotes.length > 0 ? userNotes.map((event) => {
                            return (
                                <Box key={event.sig + Math.random()}>
                                    <Note 
                                        pool={pool} 
                                        relays={relays} 
                                        eventData={event}
                                        fetchEvents={fetchEvents}
                                        setFetchEvents={setFetchEvents}
                                        updateFollowing={() => {}} 
                                        following={following} 
                                        setHashtags={() => {}} 
                                        pk={pk}
                                        hashTags={[]}
                                        />
                                </Box>
                            )
                        }) : <Box sx={{marginTop: "5px", display: "flex", justifyContent: "center"}}>
                                {userEventsFetched ? <Typography variant='caption' color={themeColors.textColor}>No Notes Found</Typography> : <CircularProgress color='primary'/>}
                            </Box>}
                    </Box>
  )
}