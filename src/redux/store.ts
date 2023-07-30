import { configureStore } from '@reduxjs/toolkit';
import keySlice from './slices/keySlice';
import notesSlice from './slices/EventsSlice';
import noteSlice from './slices/noteSlice';
import nostrSlice from './slices/nostrSlice';

export const store = configureStore({
    reducer: {
        keys: keySlice,
        notes: notesSlice,
        note: noteSlice,
        nostr: nostrSlice
    },
  })
  
  // Define a type for your root state
export type RootState = ReturnType<typeof store.getState>