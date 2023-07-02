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
    userNotes: FullEventData[];
}

export default function UserNotes({pool, relays, pk, fetchEvents, following, setFetchEvents, userNotes}: Props) {

  return (
    <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                        {userNotes && userNotes.map((event) => {
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
                        })}
                    </Box>
  )
}