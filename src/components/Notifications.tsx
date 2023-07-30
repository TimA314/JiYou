import { Stack } from "@mui/material";
import { Event } from "nostr-tools";
import UserNotificationNote from "./UserNotificationNote";
import { MetaData } from "../nostr/Types";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

type Props = {}

export default function Notifications({}: Props) {
  const notes = useSelector((state: RootState) => state.notes);
  const [userReactionNotes, setReactionNotes] = useState<Event[]>([]);

  useEffect(() => {
    const reactionEvents: Event[] = []
    notes.userNotes.forEach((e: Event) => {
      if (notes.reactions[e.id]){
        notes.reactions[e.id].forEach((e) =>{
          reactionEvents.push(e)
        })
      }
    })
    
    setReactionNotes((prev: Event[]) => [...new Set([...prev, ...reactionEvents])])
  },[notes.userNotes])

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