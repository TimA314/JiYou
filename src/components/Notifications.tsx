import { Stack } from "@mui/material";
import { Event } from "nostr-tools";
import UserNotificationNote from "./UserNotificationNote";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

type Props = {}

export default function Notifications({}: Props) {
  const events = useSelector((state: RootState) => state.events);
  const note = useSelector((state: RootState) => state.note);
  const [reactionNotes, setReactionNotes] = useState<Event[]>([]);

  useEffect(() => {
    const reactionEvents: Event[] = [];

    if(note.profilePublicKeyToShow !== null){

      events.currentProfileNotes.forEach((e: Event) => {
        if (events.reactions[e.id]?.length > 0){
          events.reactions[e.id].forEach((r) =>{
            reactionEvents.push(r)
          })
        }
      })

    } else {

      events.userNotes.forEach((e: Event) => {

        if (events.reactions[e.id]?.length > 0){

          events.reactions[e.id].forEach((r) =>{
            reactionEvents.push(r)
          })

        }
      })

    }
    
    setReactionNotes([...new Set([...reactionEvents])])

  },[events.userNotes, events.currentProfileNotes, events.reactions, note.profilePublicKeyToShow])
  return (
    <Stack>
      {reactionNotes.map((r: Event) => {
        const likedNoteEventId = r.tags.find((tag) => tag[0] === "e" && tag[1]);
        const likedNote = likedNoteEventId && events.userNotes.find((note) => note.id === likedNoteEventId[1]);

        return likedNote && (
          <UserNotificationNote 
            key={r.sig + "notificationNote"} 
            event={r} 
            userNote={likedNote}
          />
        );
      })}
    </Stack>
)

}