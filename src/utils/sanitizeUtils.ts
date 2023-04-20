import { Event } from "nostr-tools";
import { MetaData } from "../nostr/Types";


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
        nip05: sanitizeString(contentObject.nip05),
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
    } as Event;
   }  
  