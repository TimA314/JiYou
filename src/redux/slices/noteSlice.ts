import { createSlice } from "@reduxjs/toolkit";
import { Event } from "nostr-tools";


const initialState: NoteSlice = {
    noteModalOpen: false,
    replyToNote: null
}

export const noteSlice = createSlice({
    name: "note",
    initialState,
    reducers: {
        toggleNoteModalOpen: (state) => {
            state.noteModalOpen = !state.noteModalOpen;
        },
        setReplyToNote: (state, action) => {
            state.replyToNote = action.payload;
        }
    }
});


export const { toggleNoteModalOpen, setReplyToNote } = noteSlice.actions;
export default noteSlice.reducer;

export type NoteSlice = {
  noteModalOpen: Boolean
  replyToNote: Event | null
}
