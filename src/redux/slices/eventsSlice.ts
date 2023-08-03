import { createSlice } from "@reduxjs/toolkit";
import { MetaData } from "../../nostr/Types";
import { Event } from "nostr-tools";

const initialState: EventsType = {
    globalNotes: [],
    rootNotes: [],
    replyNotes: {},
    userNotes: [],
    metaData: {},
    reactions: {},
    refreshUserNotes: false,
    refreshFeedNotes: true
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
            const existingNote = state.userNotes.find(event => event.id === action.payload.id);
            if (!existingNote) {
                state.userNotes.push(action.payload);
            }
        },
        addMetaData: (state, action) => {
            state.metaData[action.payload.pubkey] = JSON.parse(action.payload.content) as MetaData;
        },
        addReactions: (state, action) => {
            // Get the last 'e' tag, which should be the event ID.
            const likedEventId = action.payload.tags.reverse().find((t: string[]) => t[0] === "e")?.[1];
            console.log("likedEventId " + likedEventId)
            if (!likedEventId) return;
        
            const prevReactionEvents = state.reactions[likedEventId] ? [...state.reactions[likedEventId]] : [];
        
            // Remove duplicates based on ID
            state.reactions[likedEventId] = prevReactionEvents.filter((event, index, self) =>
                index === self.findIndex((t) => (
                    t.id === event.id
                ))
            );
        
            state.reactions[likedEventId].push(action.payload);
        },
        
        toggleRefreshUserNotes: (state) => {
            state.refreshUserNotes = !state.refreshUserNotes;
        },
        toggleRefreshFeedNotes: (state) => {
            state.refreshUserNotes = !state.refreshUserNotes
        },
        clearUserEvents: (state) => {
            state.userNotes = [];
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
    addReactions, 
    toggleRefreshUserNotes,
    toggleRefreshFeedNotes,
    clearUserEvents
} = eventsSlice.actions;

export default eventsSlice.reducer;

export type EventsType = {
  globalNotes: Event[],
  rootNotes: Event[],
  replyNotes:  Record<string, Event[]>,
  userNotes: Event[],
  metaData:  Record<string, MetaData>,
  reactions:  Record<string, Event[]>,
  refreshUserNotes: boolean,
  refreshFeedNotes: boolean
}
