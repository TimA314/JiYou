import { createSlice } from "@reduxjs/toolkit";
import { Event } from "nostr-tools";


const initialState: NoteSlice = {
    noteModalEvent: null,
    replyToNoteEvent: null

}

export const noteSlice = createSlice({
    name: "note",
    initialState,
    reducers: {
        setNoteModalEvent: (state, action) => {
            state.noteModalEvent = action.payload;
        },
        setReplyToNoteEvent: (state, action) => {
            state.replyToNoteEvent = action.payload;
        }
    }
});


export const { setNoteModalEvent, setReplyToNoteEvent} = noteSlice.actions;
export default noteSlice.reducer;

export type NoteSlice = {
  noteModalEvent: Event | null
  replyToNoteEvent: Event | null
}
