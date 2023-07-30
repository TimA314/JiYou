import { createSlice } from "@reduxjs/toolkit";
import { RelaySetting } from "../../nostr/Types";
import { defaultRelays } from "../../nostr/DefaultRelays";


const initialState: NostrSlice = {
    relays: defaultRelays
}

export const nostrSlice = createSlice({
    name: "nostr",
    initialState,
    reducers: {
        setRelays: (state, action) => {
            state.relays = action.payload;
        }
    }
});


export const { setRelays } = nostrSlice.actions;
export default nostrSlice.reducer;

export type NostrSlice = {
  relays: RelaySetting[]
}
