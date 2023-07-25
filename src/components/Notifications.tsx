import { Stack } from "@mui/material";
import { Event } from "nostr-tools";
import UserNotificationNote from "./UserNotificationNote";
import { FullEventData, MetaData } from "../nostr/Types";
import { insertEventIntoDescendingList } from "../utils/eventUtils";

type Props = {
  userEvents: Event[];
  reactionEvents: Record<string, Event[]>;
  metaData: Record<string, MetaData>;
}

export default function Notifications({userEvents, reactionEvents, metaData}: Props) {

  for (let key in reactionEvents) {
    reactionEvents[key].sort((a, b) => b.created_at - a.created_at);
  }
  const entries = Object.entries(reactionEvents);
    entries.sort(([, aEvents], [, bEvents]) => bEvents[0].created_at - aEvents[0].created_at);

    const sortedReactionEvents: Record<string, Event[]> = Object.fromEntries(entries);

  return (
    <Stack>
      {Object.values(sortedReactionEvents).flat().map((event) => {
        const likedNoteEventId = event.tags.find((tag) => tag[0] === "e") || "";
        
        const likedNote = userEvents.find((note) => note.id === likedNoteEventId[1])

        if (!likedNote) return (<></>)

        return (
          <UserNotificationNote 
            key={event.sig} 
            event={event} 
            metaData={metaData} 
            userNote={likedNote}
            />
        )
      })}
    </Stack>
  )
}