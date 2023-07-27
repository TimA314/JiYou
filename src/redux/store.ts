import { configureStore } from '@reduxjs/toolkit';
import keySlice from './slices/keySlice';

export const store = configureStore({
    reducer: {
        keys: keySlice,
    },
  })
  
  // Define a type for your root state
export type RootState = ReturnType<typeof store.getState>