import { Stack } from "@mui/material";
import { Event } from "nostr-tools";
import UserNotificationNote from "./UserNotificationNote";
import { MetaData } from "../nostr/Types";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";

type Props = {}

export default function Notifications({}: Props) {
  const notes = useSelector((state: RootState) => state.notes);
  const userReactionNotes: Event[] = []
  notes.userNotes.forEach((e: Event) => {
    if (notes.reactions[e.id]){
      notes.reactions[e.id].forEach((e) =>{
        userReactionNotes.push(e)
      })
    }
  })
  
  userReactionNotes.sort((a, b) => b.created_at - a.created_at);

  return (
    <Stack>
      {userReactionNotes.map((event) => {
        const likedNoteEventId = event.tags.find((tag) => tag[0] === "e") || "";
        
        const likedNote = notes.userNotes.find((note) => note.id === likedNoteEventId[1])

        if (!likedNote) return (<></>)

        return (
          <UserNotificationNote 
            key={event.sig} 
            event={event} 
            userNote={likedNote}
            />
        )
      })}
    </Stack>
  )
}