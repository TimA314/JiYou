import { createSlice } from "@reduxjs/toolkit";
import { MetaData, Notes } from "../../nostr/Types";

const initialState: Notes = {
    globalNotes: [],
    rootNotes: {},
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
            state.globalNotes = [...state.globalNotes, action.payload];
        },
        addRootNotes: (state, action) => {
            state.rootNotes[action.payload.id] = [...(state.rootNotes[action.payload.id] || []), action.payload];
        },
        addReplyNotes: (state, action) => {
            state.replyNotes[action.payload.id] = [...(state.replyNotes[action.payload.id] || []), action.payload];
        },
        addUserNotes: (state, action) => {
            state.userNotes = [...state.userNotes, action.payload];
        },
        addMetaData: (state, action) => {
            console.log("Payload: ", action.payload); // Check what payload you're receiving
            state.metaData[action.payload.pubkey] = JSON.parse(action.payload.content) as MetaData;
            console.log("Updated state: ", state.metaData); // Check if state is updated as expected
        },
        addReactions: (state, action) => {
            state.reactions[action.payload.id] = action.payload;
        },
    }
})

export const { addGlobalNotes, addRootNotes, addReplyNotes, addUserNotes, addMetaData, addReactions } = notesSlice.actions;
export default notesSlice.reducer;