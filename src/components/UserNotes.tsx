import { Box } from '@mui/material'
import Note from './Note'
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type Props = {}

export default function UserNotes({}: Props) {
    const keys = useSelector((state: RootState) => state.keys);
    const events = useSelector((state: RootState) => state.events);
    const note = useSelector((state: RootState) => state.note);

  return (
    <Box style={{marginBottom: "15px", marginTop: "15px"}}>
        {events.userNotes && events.userNotes.map((event) => {
            if (note.profileEventToShow === null && event.pubkey !== keys.publicKey.decoded) {
                return <></>
            }
            
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