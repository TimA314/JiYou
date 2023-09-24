import { bech32 } from "bech32";
import { RelaySetting } from "../nostr/Types";
import { Event, EventTemplate, Kind, getPublicKey, nip19, validateEvent, verifySignature } from "nostr-tools";

export const bech32ToHex = (str: string) => {
  try {
    const nKey = bech32.decode(str, 1_000);
    const buff = bech32.fromWords(nKey.words);
    return uint8ArrayToHex(Uint8Array.from(buff));
  } catch {
    return "";
  }
};

export function checkImageUrl(url: string, timeout = 5000): Promise<boolean> {
  return new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => {
          resolve(false); // Consider the image as non-working after the timeout
          img.src = ''; // Prevent the image from continuing to try loading
      }, timeout);

      img.onload = () => {
          clearTimeout(timer);
          resolve(true);   // Image loaded successfully
      };

      img.onerror = () => {
          clearTimeout(timer);
          resolve(false); // Error occurred while loading the image
      };

      img.src = url;
  });
}

export const metaDataAndRelayHelpingRelay = "wss://purplepag.es" // Helps find kinds 0 and 10002 Events. More info at https://purplepag.es/what

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const uint8ArrayToHex = (buffer: Uint8Array) => {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const generateKeyObject = (secretKeyDecoded: string) => {
  try{

    const pk = getPublicKey(secretKeyDecoded);
    return {
      publicKey: {
        decoded: pk,
        encoded: nip19.npubEncode(pk)
      },
      privateKey: {
        decoded: secretKeyDecoded,
        encoded: nip19.nsecEncode(secretKeyDecoded)
      }
    }
    
  } catch {
    return null;
  }
} 

export const generatePublicKeyOnlyObject = (publicKeyDecoded: string) => {
  return {
    publicKey: {
      decoded: publicKeyDecoded,
      encoded: nip19.npubEncode(publicKeyDecoded)
    },
    privateKey: {
      decoded: "",
      encoded: ""
    }
  }
} 
  
export const GetImageFromPost = (content: string): string[] => {
  if (!content) return [];
  const contentAdjusted = content + " ";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlMatches = contentAdjusted.match(urlRegex);

  if (!urlMatches) return [];
  
  const checkedUrls: string[] = [];
  const fileExtensions = ['jpg', 'png', 'gif', 'jpeg'];

  for (const url of urlMatches) {
    const parsedUrl = new URL(url);

    // Check the protocol
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      continue;
    }

    // Check the file extension
    const extension = parsedUrl.pathname.split('.').pop();
    if (!extension || !fileExtensions.includes(extension)) {
      continue;
    }
    
    // Skip the URL if it's already included
    if (checkedUrls.includes(url)) continue;

    // Add the URL to the checkedUrls array
    checkedUrls.push(url);
  }

  return checkedUrls;
};


  export const getYoutubeVideoFromPost = (content: string): string | null => {
    if (!content) return null;
  
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatches = content.match(urlRegex)?.filter(url => /youtu\.be\/[a-zA-Z0-9_-]{11}$/.test(url));
  
    if (!urlMatches) return null;
  
    const url = urlMatches[0];
  
    // Check if the URL is valid
    try {
      const parsedUrl = new URL(url);
  
      // Check the protocol
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return null;
      }
  
      // Extract the video id from the path
      const videoId = parsedUrl.pathname.split('/').pop() ?? '';
  
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
      return null;
    }
  };
  
  export function splitByUrl(str: string) {
    if (!str) return null;
      const urlRegex =
          /((?:http|ftp|https):\/\/(?:[\w+?.\w+])+(?:[a-zA-Z0-9~!@#$%^&*()_\-=+\\/?.:;',]*)?(?:[-A-Za-z0-9+&@#/%=~_|]))/i;
      return str.split(urlRegex)[0];
  }
  
  export function createCookie(name: string, value: any, days: number) {
    var expires: string = '';
    if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = ';expires=' + date.toUTCString;
    }

    //set cookie
    document.cookie = name + '=' + value + expires;
    }
  
    export function readCookie(name: string) {
      var nameEQ = name + '=';
      //reading the cookie
      var ca = document.cookie.split(';');
      //processing to get the content
      for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
      //returning actual content
      return c.substring(nameEQ.length, c.length);
      }
      }
      return "";
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

  export const RelayReadWriteOrBoth = (relaySetting: RelaySetting): string => {
    // empty can be read and write
    if ((relaySetting.read && relaySetting.write) || (!relaySetting.read && !relaySetting.write)){
      return "";
    }
    // is read only
    if (relaySetting.read){
      return "read";
    }
    // is write only
    if (relaySetting.write){
      return "write";
    }

    //never reach here
    return "";
  }

  export const getZapCallbackFromLnurl = async (lnurl: string) => {
    let res = await fetch(lnurl)
    let body = await res.json()
    console.log(JSON.stringify(body));

    if (body.allowsNostr && body.nostrPubkey) {
      return body.callback
    }
  }

  export function validateZapRequest(zapRequestString: string): string | null {
    let zapRequest: Event
  
    try {
      zapRequest = JSON.parse(zapRequestString)
    } catch (err) {
      return 'Invalid zap request JSON.'
    }
  
    if (!validateEvent(zapRequest)) return 'Zap request is not a valid Nostr event.'
  
    if (!verifySignature(zapRequest as Event)) return 'Invalid signature on zap request.'
  
    let p = zapRequest.tags.find(([t, v]) => t === 'p' && v)
    if (!p) return "Zap request doesn't have a 'p' tag."
    if (!p[1].match(/^[a-f0-9]{64}$/)) return "Zap request 'p' tag is not valid hex."
  
    let e = zapRequest.tags.find(([t, v]) => t === 'e' && v)
    if (e && !e[1].match(/^[a-f0-9]{64}$/)) return "Zap request 'e' tag is not valid hex."
  
    let relays = zapRequest.tags.find(([t, v]) => t === 'relays' && v)
    if (!relays) return "Zap request doesn't have a 'relays' tag."
  
    return null
  }
  
  export function makeZapReceipt({
    zapRequest,
    preimage,
    bolt11,
    paidAt,
  }: {
    zapRequest: string
    preimage?: string
    bolt11: string
    paidAt: Date
  }): EventTemplate<Kind.Zap> {
    let zr: Event<Kind.ZapRequest> = JSON.parse(zapRequest)
    let tagsFromZapRequest = zr.tags.filter(([t]) => t === 'e' || t === 'p' || t === 'a')
  
    let zap: EventTemplate<Kind.Zap> = {
      kind: 9735,
      created_at: Math.round(paidAt.getTime() / 1000),
      content: '',
      tags: [...tagsFromZapRequest, ['bolt11', bolt11], ['description', zapRequest]],
    }
  
    if (preimage) {
      zap.tags.push(['preimage', preimage])
    }
  
    return zap
  }

  export function makeZapRequest({
    profile,
    event,
    amount,
    relays,
    comment = '',
  }: {
    profile: string
    event: string | null
    amount: number
    comment: string
    relays: string[]
  }): EventTemplate<Kind.ZapRequest> {
    if (!amount) throw new Error('amount not given')
    if (!profile) throw new Error('profile not given')
  
    let zr: EventTemplate<Kind.ZapRequest> = {
      kind: 9734,
      created_at: Math.round(Date.now() / 1000),
      content: comment,
      tags: [
        ['p', profile],
        ['amount', amount.toString()],
        ['relays', relays.join(',')],
      ],
    }
  
    if (event) {
      zr.tags.push(['e', event])
    }
  
    return zr
  }

  