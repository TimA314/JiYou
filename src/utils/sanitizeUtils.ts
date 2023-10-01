import { Event } from "nostr-tools";
import { MetaData } from "../nostr/Types";

// Shared DOM element to avoid creating new elements for sanitization
const tempDiv = document.createElement('div');
const urlParser = document.createElement("a");

export const sanitizeString = (str: string) => {
  tempDiv.textContent = str;
  return tempDiv.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

export const sanitizeUrl = (url: string) => {
  urlParser.href = sanitizeString(url);
  return `${urlParser.protocol}//${urlParser.hostname}${urlParser.pathname}${urlParser.search}${urlParser.hash}`;
};

export const sanitizeEvent = (event: Event) => {
  let sanitizedProfileContent = "";

  if (event.kind === 0) {
    const contentObject = JSON.parse(event.content);
    const sanitizedContentObject: MetaData = {
      name: sanitizeString(contentObject.name),
      picture: sanitizeUrl(contentObject.picture),
      banner: sanitizeUrl(contentObject.banner),
      about: sanitizeString(contentObject.about),
      nip05: sanitizeString(contentObject.nip05),
      lud16: sanitizeString(contentObject.lud16),
    };
    sanitizedProfileContent = JSON.stringify(sanitizedContentObject);
  }

  const sanitizedContent = sanitizedProfileContent || sanitizeString(event.content);

  return {
    id: sanitizeString(event.id),
    content: sanitizedContent,
    sig: sanitizeString(event.sig),
    pubkey: sanitizeString(event.pubkey),
    tags: event.tags.map(tag => tag.map(innerTag => sanitizeString(innerTag))),
    kind: typeof(event.kind) === "number" ? event.kind : 256,
    created_at: typeof(event.created_at) === "number" ? event.created_at : 0,
  } as Event;
};


  