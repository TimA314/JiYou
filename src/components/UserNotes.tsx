import { Box } from '@mui/material'
import Note from './Note'
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type Props = {}

export default function UserNotes({}: Props) {
    const events = useSelector((state: RootState) => state.events);
    const [fetchEvents, setFetchEvents] = useState(false);

  return (
    <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                        {events.userNotes && events.userNotes.map((event) => {
                            
                            return (
                                <Box key={event.sig}>
                                    <Note 
                                        event={event}
                                        fetchEvents={fetchEvents}
                                        setFetchEvents={setFetchEvents}
                                        updateFollowing={() => {}} 
                                        disableReplyIcon={false}
                                        />
                                </Box>
                            )
                        })}
                    </Box>
  )
}