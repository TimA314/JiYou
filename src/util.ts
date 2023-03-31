import { bech32 } from "bech32";
import * as secp from "@noble/secp256k1";
import { Event } from "nostr-tools";
import { MetaData } from "./nostr/Types";


export const sanitizeString = (str: string) => {
  const correctTypeInput = str + "";

  const tempDiv = document.createElement('div');
  tempDiv.textContent = correctTypeInput;
  const sanitizedStr = tempDiv.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return sanitizedStr;
}
  
export const sanitizeUrl = (url: string) => {
  const sanitizedString = sanitizeString(url);

  const parser = document.createElement("a");
  parser.href = sanitizedString;
  const sanitizedUrl =
    parser.protocol +
    "//" +
    parser.hostname +
    parser.pathname +
    parser.search +
    parser.hash;
  return sanitizedUrl;
}

export const sanitizeEvent = (event: Event) => {
  let sanitizedProfileContent = "";

  if (event.kind === 0){
    const contentObject = JSON.parse(event.content);
    const sanitizedContentObject: MetaData = {
      name: sanitizeString(contentObject.name),
      picture: sanitizeUrl(contentObject.picture),
      banner: sanitizeUrl(contentObject.banner),
      about: sanitizeString(contentObject.about),
      nip05: sanitizeUrl(contentObject.nip05),
      lud16: sanitizeString(contentObject.lud16),
    }
    sanitizedProfileContent = JSON.stringify(sanitizedContentObject);
  }

  const sanitizedContent: string = sanitizedProfileContent !== "" ? sanitizedProfileContent : sanitizeString(event.content);
  
  return { 
    id: sanitizeString(event.id),
    content: sanitizedContent,
    sig: sanitizeString(event.sig),
    pubkey: sanitizeString(event.pubkey),
    tags: event.tags.map(tag => [sanitizeString(tag[0]), sanitizeString(tag[1])]),
    kind: typeof(event.kind) === "number" ? event.kind : 256,
    created_at: typeof(event.created_at) === "number" ? event.created_at : 0,
  }
 }  

export const bech32ToHex = (str: string) => {
  try {
      const nKey = bech32.decode(str, 1_000);
      const buff = bech32.fromWords(nKey.words);
      return secp.utils.bytesToHex(Uint8Array.from(buff));
  } catch {
      return "";
  }
}

export const GetImageFromPost = (content: string) => {
  if(!content) return null;
  const sanitizedContent = sanitizeString(content);
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  let splitArray = splitByUrl(sanitizedContent);
  if(!splitArray || splitArray.length === 0) return null;

  for (let i = 0; i < splitArray.length; i++){
      if (validExtensions.includes(splitArray[i])){
          return splitArray[i];
      }
  }
  return null;
}

export function splitByUrl(str: string) {
  if (!str) return null;
    const urlRegex =
        /((?:http|ftp|https):\/\/(?:[\w+?.\w+])+(?:[a-zA-Z0-9~!@#$%^&*()_\-=+\\/?.:;',]*)?(?:[-A-Za-z0-9+&@#/%=~_|]))/i;
    return str.split(urlRegex)[0];
}



export const DiceBears = () => {
  const dicebearArray = [
    // "https://api.dicebear.com/5.x/bottts/svg?seed=Bubba&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    // "https://api.dicebear.com/5.x/bottts/svg?seed=Snowball&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    // "https://api.dicebear.com/5.x/bottts/svg?seed=Baby&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    // "https://api.dicebear.com/5.x/bottts/svg?seed=Misty&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    // "https://api.dicebear.com/5.x/bottts/svg?seed=Missy&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    // "https://api.dicebear.com/5.x/bottts/svg?seed=Pumpkin&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    // "https://api.dicebear.com/5.x/bottts/svg?seed=Simon&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    // "https://api.dicebear.com/5.x/bottts/svg?seed=Cookie&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Lucky&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01"
  ]

  return dicebearArray[Math.floor(Math.random() * dicebearArray.length)]
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