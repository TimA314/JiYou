import { createSlice } from "@reduxjs/toolkit";
import { Event } from "nostr-tools";


const initialState: NoteSlice = {
    noteModalEvent: null,
    replyToNoteEvent: null,
    searchEventIds: [],
    hashTags: [],
    tabIndex: 0,
    imageOnlyMode: (JSON.parse(localStorage.getItem("JiYouSettings") ?? ""))?.feedSettings?.imagesOnlyMode == true ?? false,
    hideExplicitContent: true
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
        },
        setSearchEventIds: (state, action) => {
            state.searchEventIds = action.payload.trim();
        },
        setHashTags: (state, action) => {
            state.hashTags = action.payload;
        },
        setTabIndex: (state, action) => {
            state.tabIndex = action.payload;
        },
        setImageOnlyMode: (state, action) => {
            state.imageOnlyMode = action.payload;
        },
        setHideExplicitContent: (state, action) => {
            state.hideExplicitContent = action.payload;
        }
    }
});


export const { 
    setNoteModalEvent, 
    setReplyToNoteEvent, 
    setSearchEventIds, 
    setHashTags, 
    setTabIndex, 
    setImageOnlyMode,
    setHideExplicitContent
} = noteSlice.actions;
export default noteSlice.reducer;

export type NoteSlice = {
  noteModalEvent: Event | null
  replyToNoteEvent: Event | null
  searchEventIds: string[];
  hashTags: string[];
  tabIndex: number;
  imageOnlyMode: boolean;
  hideExplicitContent: boolean;
}
