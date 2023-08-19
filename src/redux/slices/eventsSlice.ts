import { createSlice } from "@reduxjs/toolkit";
import { MetaData } from "../../nostr/Types";
import { Event } from "nostr-tools";

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
            if (!state.globalNotes.find(event => event && event.id && event.id === action.payload.id)) {
                state.globalNotes.push(action.payload);
            }
        },
        clearGlobalNotes: (state) => {
            state.globalNotes = [];
        },
        addRootNotes: (state, action) => {
            if (!state.rootNotes.find(event => event.id === action.payload.id)) {
                state.rootNotes.push(action.payload);
            }
        },
        addReplyNotes: (state, action) => {
            const repliedToEventIds = action.payload.tags.filter((t: string[]) => t[0] === "e" && t[1]);
            if (!repliedToEventIds || repliedToEventIds.length === 0) return;

            repliedToEventIds.forEach((id: string) => {
                const prevReplies = state.replyNotes[id] ? [...state.replyNotes[id]] : [];
                state.replyNotes[id] = [...new Set([...prevReplies, action.payload])];
            })
        },
        addUserNotes: (state, action) => {
            state.userNotes = [...new Set([...state.userNotes, action.payload])]
        },
        addCurrentProfileNotes: (state, action) => {
            state.currentProfileNotes = [...new Set([...state.currentProfileNotes, action.payload])]
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
            if (!likedEventId || !likedEventId[1]) return;
        
            const prevReactionEvents = state.reactions[likedEventId[1]] ? [...state.reactions[likedEventId[1]]] : [];

            if(!prevReactionEvents.some(event => event.id === action.payload.id)) {
                state.reactions[likedEventId[1]] = [...prevReactionEvents, action.payload];
            }
        },
        addZaps: (state, action) => {
            console.log("adding zaps")
            const zappedEventId = action.payload.tags.reverse().find((t: string[]) => t[0] === "e");
            if (!zappedEventId || !zappedEventId[1]) return;

            const prevZapEvents = state.zaps[zappedEventId[1]] ? [...state.zaps[zappedEventId[1]]] : [];

            state.zaps[zappedEventId[1]] = [...prevZapEvents, action.payload];
            
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
    setRefreshingCurrentProfileNotes
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
    refreshingFeedNotes: boolean,
    refreshCurrentProfileNotes: boolean,
    refreshingCurrentProfileNotes: boolean,
}
