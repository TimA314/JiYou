import { Event, EventTemplate } from "nostr-tools";

export type EventWithProfile = Event & {
    profileEvent?: Event;
    isFollowing?: boolean;
};

export interface FullEventData {
    content: string;
    user: {
      name: string;
      picture: string;
      about: string;
      nip05: string;
      pubKey: string;
    }
    hashtags: string[];
    eventId: string;
    sig: string;
    isFollowing: boolean; 
    created_at: number;
}

declare global {
  interface Window {
    nostr: Nostr;
  }
}

type Nostr = {
  getPublicKey(): Promise<string>;
  signEvent(event: EventTemplate): Promise<Event>;
}
