import { Box } from '@mui/material'
import Note from './Note'
import { RelaySetting } from '../nostr/Types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type Props = {
    following: string[]; 
    hideExplicitContent: React.MutableRefObject<boolean>;
}

export default function UserNotes({
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
                                        event={event}
                                        fetchEvents={fetchEvents}
                                        setFetchEvents={setFetchEvents}
                                        updateFollowing={() => {}} 
                                        following={following} 
                                        setHashtags={() => {}} 
                                        hashTags={[]}
                                        disableReplyIcon={false}
                                        />
                                </Box>
                            )
                        })}
                    </Box>
  )
}