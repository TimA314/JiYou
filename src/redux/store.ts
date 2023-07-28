import { configureStore } from '@reduxjs/toolkit';
import keySlice from './slices/keySlice';
import notesSlice from './slices/notesSlice';

export const store = configureStore({
    reducer: {
        keys: keySlice,
        notes: notesSlice
    },
  })
  
  // Define a type for your root state
export type RootState = ReturnType<typeof store.getState>