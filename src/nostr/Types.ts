import { Event, EventTemplate } from "nostr-tools";

export type EventWithProfile = Event & {
    profileEvent?: Event;
    isFollowing?: boolean;
};

export type Notes = {
  globalNotes: Event[],
  rootNotes: Event[],
  replyNotes:  Record<string, Event[]>,
  userNotes: Event[],
  metaData:  Record<string, MetaData>,
  reactions:  Record<string, Event[]>
}

declare global {
  interface Window {
    nostr: Nostr;
  }
}

export type Keys = {
  publicKey: {
    decoded: string,
    encoded: string
  },
  privateKey: {
    decoded: string,
    encoded: string
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