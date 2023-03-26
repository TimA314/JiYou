import { Event } from "nostr-tools";

export type EventWithProfile = Event & {
    profileEvent?: Event;
    isFollowing?: boolean;
};