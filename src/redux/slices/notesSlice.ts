import { createSlice } from "@reduxjs/toolkit";
import { MetaData } from "../../nostr/Types";
import { Event } from "nostr-tools";

const initialState: Notes = {
    globalNotes: [],
    rootNotes: [],
    replyNotes: {},
    userNotes: [],
    metaData: {},
    reactions: {},
}

export const notesSlice = createSlice({
    name: "notes",
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
            if (!state.userNotes.find(event => event.id === action.payload.id)) {
                state.userNotes.push(action.payload);
            }
        },
        addMetaData: (state, action) => {
            state.metaData[action.payload.pubkey] = JSON.parse(action.payload.content) as MetaData;
        },
        addReactions: (state, action) => {
            const likedEventId = action.payload.tags.find((t: string[]) => t[0] === "e")?.[1];
            if (!likedEventId) return;
            const prevReactionEvents = state.reactions[likedEventId] ? [...state.reactions[likedEventId]] : [];

            state.reactions[likedEventId] = [...new Set([...prevReactionEvents, action.payload])];
        },
    }
});


export const { addGlobalNotes, clearGlobalNotes, addRootNotes, addReplyNotes, addUserNotes, addMetaData, addReactions } = notesSlice.actions;
export default notesSlice.reducer;

export type Notes = {
  globalNotes: Event[],
  rootNotes: Event[],
  replyNotes:  Record<string, Event[]>,
  userNotes: Event[],
  metaData:  Record<string, MetaData>,
  reactions:  Record<string, Event[]>
}
