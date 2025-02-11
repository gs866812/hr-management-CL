import { createSlice } from '@reduxjs/toolkit';
import { clearUserData, fetchPresentUser } from './userSlice'; // Import the async thunk

const userNameSlice = createSlice({
    name: 'userName',
    initialState: {
        userName: null,
    },
    reducers: {
        setUserName: (state, action) => { // Reducer to manually set userName
            state.userName = action.payload;
        },
        clearUserName: (state) => {
            state.userName = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPresentUser.fulfilled, (state, action) => {
            state.userName = action.payload.userName;
        });
        builder.addCase(clearUserData, (state) => {
            state.userName = null;
        })
    },
});

export const { setUserName, clearUserName } = userNameSlice.actions;
export const selectUserName = (state) => state.userName.userName;
export default userNameSlice.reducer;