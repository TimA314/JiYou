import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    publicKey: {
        decoded: "",
        encoded: ""
    },
    privateKey: {
        decoded: "",
        encoded: ""
    }
}

export const keySlice = createSlice({
    name: "keys",
    initialState,
    reducers: {
        setKeys: (state, action) => {
            state.publicKey = action.payload.publicKey;
            state.privateKey = action.payload.privateKey;
        }
    }
})

export const { setKeys } = keySlice.actions;
export default keySlice.reducer;