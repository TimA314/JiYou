import { bech32 } from "bech32";
import * as secp from "@noble/secp256k1";
import { EventWithProfile } from "./nostr/Types";
import { Event } from "nostr-tools";


export const sanitizeString = (str: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  
  export const sanitizeUrl = (url: string) => {
    const parser = document.createElement("a");
    parser.href = url;
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
    return { 
      id: sanitizeString(event.id),
      content: sanitizeString(event.content),
      sig: sanitizeString(event.sig),
      pubkey: sanitizeString(event.pubkey),
      tags: event.tags.map(tag => [sanitizeString(tag[0]), sanitizeString(tag[1])]),
      kind: typeof(event.kind) === "number" ? event.kind : 0,
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
  let dicebearArray = [
    "https://api.dicebear.com/5.x/bottts/svg?seed=Bubba&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Snowball&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Baby&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Misty&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Missy&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Pumpkin&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Simon&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Cookie&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01",
    "https://api.dicebear.com/5.x/bottts/svg?seed=Lucky&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01"
  ]

  return dicebearArray[Math.floor(Math.random() * dicebearArray.length)]
}