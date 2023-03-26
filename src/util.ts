import { bech32 } from "bech32";
import * as secp from "@noble/secp256k1";


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

export const bech32ToHex = (str: string) => {
    try {
        const nKey = bech32.decode(str, 1_000);
        const buff = bech32.fromWords(nKey.words);
        return secp.utils.bytesToHex(Uint8Array.from(buff));
    } catch {
        return "";
    }
}