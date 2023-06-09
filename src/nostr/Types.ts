import { Event, EventTemplate } from "nostr-tools";

export type EventWithProfile = Event & {
    profileEvent?: Event;
    isFollowing?: boolean;
};

export type ReactionCounts = {
    upvotes: number;
    downvotes: number;
};

export interface FullEventData {
    content: string;
    user: {
      name: string;
      picture: string;
      about: string;
      nip05: string;
    }
    pubkey: string;
    hashtags: string[];
    eventId: string;
    sig: string;
    created_at: number;
    tags: string[][];
    reaction: ReactionCounts;
    images: string[];
}

declare global {
  interface Window {
    nostr: Nostr;
  }
}

export type RelaySetting = {
  relayUrl: string;
  read: boolean;
  write: boolean;
}

type Nostr = {
  getPublicKey(): Promise<string>;
  signEvent(event: EventTemplate): Promise<Event>;
}

export interface MetaData {
  name?: string,
  about?: string,
  picture?: string,
  banner?: string,
  nip05?: string,
  lud16?: string,
}

export type NoteUrls = {
  image: string;
  youtubeVideo: string;
}

export interface RelaySwitches {
  [relayUrl: string]: boolean;
}

export interface ProfileContent {
  name: string;
  picture: string;
  about: string;
  banner: string;
}