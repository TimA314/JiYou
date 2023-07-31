import { Stack } from "@mui/material";
import { Event } from "nostr-tools";
import UserNotificationNote from "./UserNotificationNote";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

type Props = {}

export default function Notifications({}: Props) {
  const events = useSelector((state: RootState) => state.events);
  const [userReactionNotes, setReactionNotes] = useState<Event[]>([]);

  useEffect(() => {
    const reactionEvents: Event[] = []
    events.userNotes.forEach((e: Event) => {
      if (events.reactions[e.id]){
        events.reactions[e.id].forEach((e) =>{
          reactionEvents.push(e)
        })
      }
    })
    
    setReactionNotes((prev: Event[]) => [...new Set([...prev, ...reactionEvents])])
  },[events.userNotes])

  return (
    <Stack>
      {userReactionNotes.map((event) => {
        const likedNoteEventId = event.tags.find((tag) => tag[0] === "e") || "";
        
        const likedNote = events.userNotes.find((note) => note.id === likedNoteEventId[1])

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