import { createSlice } from "@reduxjs/toolkit";
import { Notes } from "../../nostr/Types";

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
        setGlobalNotes: (state, action) => {
            state.globalNotes = action.payload;
        },
        setRootNotes: (state, action) => {
            state.rootNotes = action.payload;
        },
        setReplyNotes: (state, action) => {
            state.replyNotes = action.payload;
        },
        setUserNotes: (state, action) => {
            state.userNotes = action.payload;
        },
        setMetaData: (state, action) => {
            state.metaData = action.payload;
        },
        setReactions: (state, action) => {
            state.reactions = action.payload;
        },
    }
})

export const { setGlobalNotes, setRootNotes, setReplyNotes, setUserNotes, setMetaData, setReactions } = notesSlice.actions;
export default notesSlice.reducer;