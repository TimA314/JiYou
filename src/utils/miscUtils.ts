import { bech32 } from "bech32";

export const bech32ToHex = (str: string) => {
  try {
    const nKey = bech32.decode(str, 1_000);
    const buff = bech32.fromWords(nKey.words);
    return uint8ArrayToHex(Uint8Array.from(buff));
  } catch {
    return "";
  }
};

const uint8ArrayToHex = (buffer: Uint8Array) => {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
  
  export const GetImageFromPost = (content: string): string | null => {
    if (!content) return null;
  
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatches = content.match(urlRegex)?.filter(url => /\.(jpg|png|gif)$/.test(url));
  
    if (!urlMatches) return null;
  
    const url = urlMatches[0];
  
    // Check if the URL is valid
    try {
      const parsedUrl = new URL(url);
  
      // Check the protocol
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return null;
      }
  
      // Check the file extension
      const fileExtensions = ['jpg', 'png', 'gif'];
      if (!fileExtensions.includes(parsedUrl.pathname.split('.').pop() ?? '')) {
        return null;
      }
  
      return url;
    } catch (e) {
      return null;
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
  