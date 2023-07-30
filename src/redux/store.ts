import { configureStore } from '@reduxjs/toolkit';
import keySlice from './slices/keySlice';
import notesSlice from './slices/EventsSlice';
import noteSlice from './slices/noteSlice';

export const store = configureStore({
    reducer: {
        keys: keySlice,
        notes: notesSlice,
        note: noteSlice
    },
  })
  
  // Define a type for your root state
export type RootState = ReturnType<typeof store.getState>