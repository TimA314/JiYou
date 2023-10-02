import { bech32 } from "bech32";
import { RelaySetting } from "../nostr/Types";
import { getPublicKey, nip19} from "nostr-tools";

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
  
const urlRegex = /(https?:\/\/[^\s]+)/g;
const fileExtensions = new Set(['jpg', 'png', 'gif', 'jpeg']);
export const GetImageFromPost = (content: string): string[] => {
  try {
    if (!content || content.trim() === "") return [];

    const urlMatches = content.match(urlRegex);
    if (!urlMatches) return [];

    const checkedUrls = new Set<string>();

    for (const url of urlMatches) {
      try {
        const parsedUrl = new URL(url);

        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          continue;
        }

        const pathParts = parsedUrl.pathname.split('.');
        const extension = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

        if (!extension || !fileExtensions.has(extension)) {
          continue;
        }

        if (!checkedUrls.has(url)) {
          checkedUrls.add(url);
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    }

    return Array.from(checkedUrls);
  } catch (e) {
    console.log(`Error getting image from content: ${content}`);
    console.error(e);
    return [];
  }
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
    return "https://api.dicebear.com/5.x/bottts/svg?seed=Lucky&mouth=smile01,smile02&sides=antenna01,cables01,cables02,round,square,squareAssymetric&top=antenna,antennaCrooked,glowingBulb01,glowingBulb02,lights,radar,bulb01";
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
  