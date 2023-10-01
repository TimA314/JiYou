import { Box } from '@mui/material'
import Note from './Note'
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type Props = {}

export default function UserNotes({}: Props) {
    const events = useSelector((state: RootState) => state.events);
    const note = useSelector((state: RootState) => state.note);

    if (note.profileEventToShow !== null) {
        return (
            <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                {events.currentProfileNotes && [...new Set(events.currentProfileNotes)].map((event) => {
        
                    return (
                        <Box key={event.sig}>
                            <Note
                                event={event}
                                updateFollowing={() => {}} 
                                disableReplyIcon={false}
                                disableImagesOnly={true}
                                />
                        </Box>
                    )
                })}
            </Box>
        )

    } else {

        return (
            <Box style={{marginBottom: "15px", marginTop: "15px"}}>
                {events.userNotes && [...new Set(events.userNotes)].map((event) => {
                    
                    return (
                        <Box key={event.sig}>
                            <Note
                                event={event}
                                updateFollowing={() => {}} 
                                disableReplyIcon={false}
                                disableImagesOnly={true}
                                />
                        </Box>
                    )
                })}
            </Box>
        )
    }
}