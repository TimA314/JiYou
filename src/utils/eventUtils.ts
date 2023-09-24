import { Event, EventTemplate, Kind } from "nostr-tools";
import { MetaData } from "../nostr/Types";

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

  const explicitTags: string[] = [
    "nsfw",
    "gore",
    "nudity",
    "nude",
    "blood",
    "nudestr"
  ]

  export function eventContainsExplicitContent(event: Event): boolean {
    return event.tags.filter((t) => t[0] === "content-warning" || explicitTags.includes(t[1].toLowerCase())).length > 0
  }

 export const getMediaNostrBandImageUrl = (pubkeyToFetch: string, type: string, size: number) => {
    return `https://media.nostr.band/thumbs/${pubkeyToFetch.substring(pubkeyToFetch.length - 4)}/${pubkeyToFetch}-${type}-${size}`;
  }

  export const getMetaDataNostrBandUrl = (pubkeyToFetch: string) => {
    return `https://media.nostr.band/thumbs/${pubkeyToFetch.substring(pubkeyToFetch.length - 4)}/${pubkeyToFetch}.json`;
  }
  
  export const fetchNostrBandMetaData = async (pubkeyToFetch: string): Promise<MetaData | null> => {
    const url = getMetaDataNostrBandUrl(pubkeyToFetch);
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return data;

    } catch (error) {
        return null;
    }
}
