import { Box } from '@mui/material'
import Note from './Note'
import { RelaySetting } from '../nostr/Types';
import { SimplePool } from 'nostr-tools';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type Props = {
    pool: SimplePool | null;
    setPool:  React.Dispatch<React.SetStateAction<SimplePool>>;
    relays: RelaySetting[];
    following: string[]; 
    hideExplicitContent: React.MutableRefObject<boolean>;
}

export default function UserNotes({
    pool,
    setPool,
    relays, 
    following
}: Props) {
    const notes = useSelector((state: RootState) => state.notes);

    const [fetchEvents, setFetchEvents] = useState(false);



  return (
    <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                        {notes.userNotes && notes.userNotes.map((event) => {
                            
                            return (
                                <Box key={event.sig + Math.random()}>
                                    <Note 
                                        pool={pool} 
                                        relays={relays} 
                                        event={event}
                                        fetchEvents={fetchEvents}
                                        setFetchEvents={setFetchEvents}
                                        updateFollowing={() => {}} 
                                        following={following} 
                                        setHashtags={() => {}} 
                                        hashTags={[]}
                                        />
                                </Box>
                            )
                        })}
                    </Box>
  )
}