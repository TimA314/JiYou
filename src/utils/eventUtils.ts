import { Event } from "nostr-tools";
import { MetaData } from "../nostr/Types";
import { bech32 } from '@scure/base'
export const utf8Decoder = new TextDecoder('utf-8')

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

  export async function getZapEndpoint(metadata: MetaData): Promise<null | string> {
    try {
      let lnurl: string = ''
      console.log("zap metadata: ", metadata)
      if (metadata.lud06) {
        let { words } = bech32.decode(metadata.lud06, 1000)
        let data = bech32.fromWords(words)
        lnurl = utf8Decoder.decode(data)
        console.log(lnurl)
      } else if (metadata.lud16) {
        let [name, domain] = metadata.lud16.split('@')
        lnurl = `https://${domain}/.well-known/lnurlp/${name}`
        console.log(lnurl)
      } else {
        return null
      }
  
      let res = await fetch(lnurl)
      let body = await res.json()
  
      if (body.allowsNostr && body.nostrPubkey) {
        return body.callback
      }
    } catch (err) {
      console.error(err);
    }
  
    return null
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
