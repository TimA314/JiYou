import { createSlice } from "@reduxjs/toolkit";

const initialState: NoteSlice = {
    replyModalOpen: false,
    noteModalOpen: false,
}

export const noteSlice = createSlice({
    name: "nostrNote",
    initialState,
    reducers: {
        toggleReplyModalOpen: (state) => {
            state.replyModalOpen = !state.replyModalOpen;
        },
        toggleNoteModalOpen: (state) => {
            state.noteModalOpen = !state.noteModalOpen;
        }
    }
});


export const { toggleReplyModalOpen, toggleNoteModalOpen } = noteSlice.actions;
export default noteSlice.reducer;

export type NoteSlice = {
  replyModalOpen: Boolean
  noteModalOpen: Boolean
}
