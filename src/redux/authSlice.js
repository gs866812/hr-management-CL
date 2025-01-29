import { createSlice } from '@reduxjs/toolkit';

// Load user from localStorage
const storedUser = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'user',
  initialState: {
    user: storedUser,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('token', JSON.stringify(action.payload)); // Save to localStorage
    },
    clearUser(state) {
      state.user = null;
      localStorage.removeItem('token'); // Remove from localStorage
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
