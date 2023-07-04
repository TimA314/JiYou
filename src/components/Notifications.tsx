import { Stack } from "@mui/material";
import { Event } from "nostr-tools";
import UserNotificationNote from "./UserNotificationNote";
import { FullEventData, MetaData } from "../nostr/Types";

type Props = {
  likedNotificationEvents: Event[];
  likedNotificationMetaData: Record<string, MetaData>;
  userNotes: FullEventData[];
}

export default function Notifications({likedNotificationEvents, likedNotificationMetaData, userNotes}: Props) {
  const uniqueEvents = likedNotificationEvents.filter((value, index, self) => 
    self.findIndex(m => m.id === value.id) === index
  );

  return (
    <Stack>
      {uniqueEvents.map((event) => {
        const likedNoteEventId = event.tags.find((tag) => tag[0] === "e") || "";
        
        const likedNote = userNotes.find((note) => note.eventId === likedNoteEventId[1])

        if (!likedNote) return (<></>)

        return (
          <UserNotificationNote 
            key={event.sig} 
            event={event} 
            metaData={likedNotificationMetaData[event.pubkey]} 
            userNote={likedNote}
            />
        )
      })}
    </Stack>
  )
}