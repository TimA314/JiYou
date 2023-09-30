import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Event } from "nostr-tools";
import { AlertMessage } from "../../components/AlertMessages";


const initialState: NoteSlice = {
    noteModalEvent: null,
    replyToNoteEvent: null,
    profileEventToShow: null,
    searchEventIds: [],
    hashTags: [],
    tabIndex: 0,
    imageOnlyMode: false,
    hideExplicitContent: true,
    alertMessages: [],
    explicitTags: [
        "nsfw"
    ],
    zapAmountSettings: [1, 12, 21, 210, 2100]
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
        addSearchEventId: (state, action) => {
            state.searchEventIds = [...new Set([...state.searchEventIds, action.payload.trim()])];
        },
        removeSearchEventId: (state, action) => {
            state.searchEventIds = state.searchEventIds.filter((id) => id !== action.payload)
        },
        addHashTag: (state, action) => {
            state.hashTags = [...new Set([...state.hashTags, action.payload])];
        },
        removeHashTag: (state, action) => {
            state.hashTags = state.hashTags.filter((t) => t !== action.payload);
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
        setProfileEventToShow: (state, action: PayloadAction<Event | null>) => {
            state.profileEventToShow = action.payload;
        },
        addZapAmountSettings: (state, action: PayloadAction<number>) => {
            state.zapAmountSettings = Array.from(new Set([...state.zapAmountSettings, action.payload])).sort((a, b) => a - b);
        },
        removeZapAmountSettings: (state, action: PayloadAction<number>) => {
            state.zapAmountSettings = state.zapAmountSettings.filter((zap) => zap !== action.payload).sort((a, b) => a - b);
        },
        setZapAmountSettings: (state, action: PayloadAction<number[]>) => {
            state.zapAmountSettings = Array.from(new Set(action.payload)).sort((a, b) => a - b);
        },
        addHideExplicitTag: (state, action: PayloadAction<string>) => {
            state.explicitTags = Array.from(new Set([...state.explicitTags, action.payload]))
        },
        removeHideExplicitTag: (state, action: PayloadAction<string>) => {
            state.explicitTags = state.explicitTags.filter((zap) => zap !== action.payload)
        }
    }
});


export const { 
    setNoteModalEvent, 
    setReplyToNoteEvent, 
    addSearchEventId,
    removeSearchEventId,
    addHashTag,
    removeHashTag,
    setTabIndex, 
    setImageOnlyMode,
    setHideExplicitContent,
    removeMessage,
    addMessage,
    setProfileEventToShow,
    addZapAmountSettings: setZapAmountSettings,
    removeZapAmountSettings,
    removeHideExplicitTag
} = noteSlice.actions;
export default noteSlice.reducer;

export type NoteSlice = {
  noteModalEvent: Event | null
  replyToNoteEvent: Event | null
  profileEventToShow: Event | null
  searchEventIds: string[];
  hashTags: string[];
  tabIndex: number;
  imageOnlyMode: boolean;
  hideExplicitContent: boolean;
  alertMessages: AlertMessage[];
  explicitTags: string[];
  zapAmountSettings: number[];
}
