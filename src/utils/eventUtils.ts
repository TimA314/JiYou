import { Event, nip19 } from "nostr-tools";
import { FullEventData, MetaData, ReactionCounts } from "../nostr/Types";
import { DiceBears, GetImageFromPost } from "./miscUtils";

//set Events
export const setEventData = (event: Event, metaData: MetaData, reactions: ReactionCounts) => {
  const defaultAvatar = DiceBears();
  const fullEventData: FullEventData = {
      content: event.content,
      user: {
          name: metaData?.name ?? nip19.npubEncode(event.pubkey).slice(0, 10) + "...",
          picture: metaData?.picture ?? defaultAvatar,
          about: metaData?.about ?? "",
          nip05: metaData?.nip05 ?? "",
      },
      pubkey: event.pubkey,
      hashtags: event.tags.filter((tag) => tag[0] === "t").map((tag) => tag[1]),
      eventId: event.id,
      sig: event.sig,
      created_at: event.created_at,
      tags: event?.tags ?? [],
      reaction: reactions,
      images: GetImageFromPost(event.content)
  }
  
  return fullEventData;
}

//binary search to find the index to insert the event into the array
export function insertEventIntoDescendingList<T extends Event>(
    sortedArray: T[],
    event: T
  ) {
    let start = 0;
    let end = sortedArray.length - 1;
    let midPoint;
    let position = start;
  
    if (end < 0) {
      position = 0;
    } else if (event.created_at < sortedArray[end].created_at) {
      position = end + 1;
    } else if (event.created_at >= sortedArray[start].created_at) {
      position = start;
    } else
      while (true) {
        if (end <= start + 1) {
          position = end;
          break;
        }
        midPoint = Math.floor(start + (end - start) / 2);
        if (sortedArray[midPoint].created_at > event.created_at) {
          start = midPoint;
        } else if (sortedArray[midPoint].created_at < event.created_at) {
          end = midPoint;
        } else {
          // aMidPoint === num
          position = midPoint;
          break;
        }
      }
  
    // insert when num is NOT already in (no duplicates)
    if (sortedArray[position]?.id !== event.id) {
      return [
        ...sortedArray.slice(0, position),
        event,
        ...sortedArray.slice(position),
      ];
    }
  
    return sortedArray;
  }

  export function extractHashtags(content: string): string[] {
    const regex = /#(\w+)/g;
    const matches = content.match(regex);
    
    if (matches) {
      return matches.map(match => match.slice(1));
    }
    
    return [];
  }
  