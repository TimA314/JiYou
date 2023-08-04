import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Event } from "nostr-tools";
import { AlertMessage } from "../../components/AlertMessages";


const initialState: NoteSlice = {
    noteModalEvent: null,
    replyToNoteEvent: null,
    searchEventIds: [],
    hashTags: [],
    tabIndex: 0,
    imageOnlyMode: false,
    hideExplicitContent: true,
    alertMessages: []
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
        },
        removeMessage: (state, action: PayloadAction<AlertMessage>) => {
            state.alertMessages = state.alertMessages.filter(msg => msg.message !== action.payload.message);
        },      
        addMessage: (state, action: PayloadAction<AlertMessage>) => {
            state.alertMessages.push(action.payload);
        },    
    }
});


export const { 
    setNoteModalEvent, 
    setReplyToNoteEvent, 
    setSearchEventIds, 
    setHashTags, 
    setTabIndex, 
    setImageOnlyMode,
    setHideExplicitContent,
    removeMessage,
    addMessage
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
  alertMessages: AlertMessage[]
}
