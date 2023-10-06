import { createSlice } from "@reduxjs/toolkit";
import { MetaData } from "../../nostr/Types";
import { Event } from "nostr-tools";
import { addEventIfNotExist, addEventToRecord } from "../../utils/miscUtils";

const initialState: EventsType = {
    globalNotes: [],
    rootNotes: [],
    replyNotes: {},
    userNotes: [],
    currentProfileNotes: [],
    metaData: {},
    reactions: {},
    zaps: {},
    refreshUserNotes: false,
    refreshingUserNotes: false,
    profileRefreshAnimation: false,
    refreshFeedNotes: true,
    refreshingFeedNotes: false,
    refreshCurrentProfileNotes: false,
    refreshingCurrentProfileNotes: false,
}


export const eventsSlice = createSlice({
    name: "events",
    initialState,
    reducers: {
        addGlobalNotes: (state, action) => {
            addEventIfNotExist(state.globalNotes, action.payload);
        },
        clearGlobalNotes: (state) => {
            state.globalNotes = [];
        },
        addRootNotes: (state, action) => {
            addEventIfNotExist(state.rootNotes, action.payload);
        },
        addReplyNotes: (state, action) => {
            const repliedToEventIds = action.payload.tags.filter((t: string[]) => t[0] === "e" && t[1]);
            if (repliedToEventIds.length === 0) return;

            repliedToEventIds.forEach((id: string) => {
                addEventToRecord(state.replyNotes, id, action.payload);
            });
        },
        addUserNotes: (state, action) => {
            addEventIfNotExist(state.userNotes, action.payload);
        },
        addCurrentProfileNotes: (state, action) => {
            addEventIfNotExist(state.currentProfileNotes, action.payload);
        },
        clearCurrentProfileNotes: (state) => {
            state.currentProfileNotes = [];
        },
        addMetaData: (state, action) => {
            state.metaData[action.payload.pubkey] = JSON.parse(action.payload.content) as MetaData;
        },
        addParsedMetaData: (state, action) => {
            state.metaData[action.payload.pubkey] = action.payload as MetaData;
        },
        addReactions: (state, action) => {
            // Get the last 'e' tag, which should be the event ID.
            const likedEventId = action.payload.tags.reverse().find((t: string[]) => t[0] === "e");
            if (likedEventId && likedEventId[1]) {
                addEventToRecord(state.reactions, likedEventId[1], action.payload);
            }
        },
        addZaps: (state, action) => {
            const zappedEventId = action.payload.tags.reverse().find((t: string[]) => t[0] === "e");
            if (zappedEventId && zappedEventId[1]) {
                addEventToRecord(state.zaps, zappedEventId[1], action.payload);
            } 
        },
        toggleRefreshUserNotes: (state) => {
            state.refreshUserNotes = !state.refreshUserNotes;
        },
        toggleRefreshFeedNotes: (state) => {
            state.refreshFeedNotes = !state.refreshFeedNotes
        },
        clearUserEvents: (state) => {
            state.userNotes = [];
        },
        setIsRefreshingUserEvents: (state, action) => {
            state.refreshingUserNotes = action.payload;
        },
        setIsRefreshingFeedNotes: (state, action) => {
            state.refreshingFeedNotes = action.payload;
        },
        setRefreshingCurrentProfileNotes: (state, action) => {
            state.refreshingCurrentProfileNotes = action.payload;
        },
        toggleRefreshCurrentProfileNotes: (state) => {
            state.refreshCurrentProfileNotes = !state.refreshCurrentProfileNotes;
        },
        toggleProfileRefreshAnimation: (state) => {
            state.profileRefreshAnimation = !state.profileRefreshAnimation;
        }
    }
});


export const { 
    addGlobalNotes, 
    clearGlobalNotes, 
    addRootNotes, 
    addReplyNotes, 
    addUserNotes, 
    addMetaData,
    addParsedMetaData,
    addReactions,
    addZaps,
    toggleRefreshUserNotes,
    toggleRefreshFeedNotes,
    clearUserEvents,
    setIsRefreshingUserEvents,
    setIsRefreshingFeedNotes,
    addCurrentProfileNotes,
    clearCurrentProfileNotes,
    toggleRefreshCurrentProfileNotes,
    setRefreshingCurrentProfileNotes,
    toggleProfileRefreshAnimation
} = eventsSlice.actions;

export default eventsSlice.reducer;

export type EventsType = {
    globalNotes: Event[],
    rootNotes: Event[],
    replyNotes:  Record<string, Event[]>,
    userNotes: Event[],
    currentProfileNotes: Event[],
    metaData:  Record<string, MetaData>,
    reactions:  Record<string, Event[]>,
    zaps:  Record<string, Event[]>,
    refreshUserNotes: boolean,
    refreshFeedNotes: boolean,
    refreshingUserNotes: boolean,
    profileRefreshAnimation: boolean,
    refreshingFeedNotes: boolean,
    refreshCurrentProfileNotes: boolean,
    refreshingCurrentProfileNotes: boolean,
}
