import { Stack } from "@mui/material";
import { Event } from "nostr-tools";
import UserNotificationNote from "./UserNotificationNote";
import { MetaData } from "../nostr/Types";

type Props = {
  likedNotificationEvents: Event[];
  likedNotificationMetaData: Record<string, MetaData>;
}

export default function Notifications({likedNotificationEvents, likedNotificationMetaData}: Props) {
  const uniqueEvents = [...new Set(likedNotificationEvents)];
  return (
    <Stack>
      {uniqueEvents.map((event) => {
        return (
          <UserNotificationNote key={event.sig} event={event} metaData={likedNotificationMetaData[event.pubkey]} />
        )
      })}
    </Stack>
  )
}