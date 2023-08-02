import { configureStore } from '@reduxjs/toolkit';
import keySlice from './slices/keySlice';
import noteSlice from './slices/noteSlice';
import nostrSlice from './slices/nostrSlice';
import eventsSlice from './slices/eventsSlice';


export const store = configureStore({
    reducer: {
        keys: keySlice,
        note: noteSlice,
        nostr: nostrSlice,
        events: eventsSlice,
    }
  })
  
  // Define a type for your root state
export type RootState = ReturnType<typeof store.getState>