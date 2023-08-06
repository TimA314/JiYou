import { createSlice, current } from "@reduxjs/toolkit";
import { RelaySetting } from "../../nostr/Types";
import { defaultRelays } from "../../nostr/DefaultRelays";


const initialState: NostrSlice = {
    relays: defaultRelays,
    following: [],
    followers: [],
    currentProfileFollowers: [],
    currentProfileFollowing: []
}

export const nostrSlice = createSlice({
    name: "nostr",
    initialState,
    reducers: {
        setRelays: (state, action) => {
            state.relays = action.payload;
        },
        setFollowing: (state, action) => {
            state.following = action.payload;
        },
        addFollowing: (state, action) => {
            state.following = [...new Set([...state.following, action.payload])];
        },
        removeFollowing: (state, action) => {
            state.following = state.following.filter((f) => f !== action.payload);
        },
        setFollowers: (state, action) => {
            state.followers = action.payload;
        },
        setCurrentProfileFollowers: (state, action) => {
            state.currentProfileFollowers = action.payload;
        },
        setCurrentProfileFollowing: (state, action) => {
            state.currentProfileFollowing = action.payload;
        }
    }
});


export const { 
    setRelays, 
    setFollowing, 
    addFollowing, 
    removeFollowing,
    setFollowers,
    setCurrentProfileFollowers,
    setCurrentProfileFollowing,
 } = nostrSlice.actions;
export default nostrSlice.reducer;

export type NostrSlice = {
    relays: RelaySetting[],
    following: string[],
    followers: string[]
    currentProfileFollowers: string[],
    currentProfileFollowing: string[]
}
